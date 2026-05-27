/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { signOut, authClient } from "../../../lib/auth-client";
import { useRouter } from "next/navigation";
import { env } from "@/utils/env";
import { toast } from "sonner";
import { useAlert } from "@/components/ui/Alert";
import disposableDomains from "disposable-email-domains";
import { extraBurners } from "../../../lib/burnerDomains";
import {
  User,
  Lock,
  AlertTriangle,
  LogOut,
  Mail,
  Phone,
  Check,
  ShieldAlert,
  UserCheck,
  Smartphone,
  Info,
  Trash2,
  X,
  Settings,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ValidatedInput } from "@/components/ui/ValidatedInput";
import { ConfirmPasswordInput } from "@/components/ui/ConfirmPasswordInput";
import { z } from "zod";

type Tab = "profile" | "security" | "danger";

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  refetch?: () => void;
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled,
  icon: Icon
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  icon?: any;
}) {
  return (
    <div className="space-y-1 w-full text-left">
      <label className="block text-xs font-semibold text-slate-600 dark:text-cream uppercase tracking-wider">
        {label}
      </label>
      <div className="relative rounded-xl overflow-hidden">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-midgray">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full bg-white dark:bg-glanz-black border border-slate-200 dark:border-charcoal rounded-xl py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-glanz-gold focus:ring-1 focus:ring-glanz-gold transition-all placeholder-midgray disabled:opacity-40 disabled:cursor-not-allowed ${Icon ? 'pl-10 pr-4' : 'px-4'}`}
        />
      </div>
    </div>
  );
}

const delPasswordSchema = z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters");
const emailSchema = z.string().email("Invalid email address").refine(
  (email) => {
    const domain = email.split("@")[1]?.toLowerCase();
    return domain && !disposableDomains.includes(domain) && !extraBurners.includes(domain);
  },
  { message: "Burner emails are not allowed." }
);

export function ProfileDrawer({ isOpen, onClose, user, refetch }: ProfileDrawerProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [imageError, setImageError] = useState(false);

  const isGoogle = user?.image?.includes("googleusercontent.com");
  const isFacebook = user?.image?.includes("facebook.com") || user?.image?.includes("platform-lookaside");
  const isCredentialsUser = !isGoogle && !isFacebook;

  // Change state / variables
  // Delete forms input
  const [delPassword, setDelPassword] = useState("");
  const [delEmail, setDelEmail] = useState("");
  const isDeleteFormValid = isCredentialsUser 
    ? delPasswordSchema.safeParse(delPassword).success 
    : (z.string().email().safeParse(delEmail).success && delEmail === user?.email);

  // Profile forms
  const [pName, setPName] = useState(user?.name || "");
  const [pPhone, setPPhone] = useState(user?.phone || "");
  const [pWhatsapp, setPWhatsapp] = useState(user?.whatsapp || "");
  const [pLoading, setPLoading] = useState(false);
  const [profileAlert, ProfileAlertContainer] = useAlert();
  const [securityAlert, SecurityAlertContainer] = useAlert();
  const [emailAlert, EmailAlertContainer] = useAlert();
  const [deleteAlert, DeleteAlertContainer] = useAlert();

  // Keep track of parent user state to adjust profile input states on prop updates during rendering
  const [prevUser, setPrevUser] = useState(user);

  if (user !== prevUser) {
    setPrevUser(user);
    setPName(user?.name || "");
    setPPhone(user?.phone || "");
    setPWhatsapp(user?.whatsapp || "");
  }

  // Change password forms
  const [cpCurrent, setCpCurrent] = useState("");
  const [cpNew, setCpNew] = useState("");
  const [cpConfirm, setCpConfirm] = useState("");
  const [cpLoading, setCpLoading] = useState(false);

  // Change email forms
  const [ceNewEmail, setCeNewEmail] = useState("");
  const [ceLoading, setCeLoading] = useState(false);

  // Delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [delLoading, setDelLoading] = useState(false);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPLoading(true);
    profileAlert.clear();
    try {
      const body: Record<string, string> = {};
      if (pName.trim() && pName.trim() !== user.name) body.name = pName.trim();
      if (pPhone && pPhone !== user.phone) body.phone = pPhone;
      if (pWhatsapp !== user.whatsapp) body.whatsapp = pWhatsapp;

      if (Object.keys(body).length === 0) {
        profileAlert.error("No changes detected.", 5);
        toast.error("No changes detected.");
        return;
      }

      const res = await fetch(
        `${env.NEXT_PUBLIC_SERVER_URL!}/api/users/profile`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      profileAlert.success("Profile updated successfully!", 5);
      toast.success("Profile updated successfully!");
      refetch?.();
    } catch (err: any) {
      profileAlert.error(err.message || "Something went wrong.", 5);
      toast.error(err.message || "Something went wrong.");
    } finally {
      setPLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setCpLoading(true);
    securityAlert.clear();
    if (cpNew !== cpConfirm) {
      securityAlert.error("New passwords do not match.", 5);
      toast.error("New passwords do not match.");
      setCpLoading(false);
      return;
    }
    try {
      const result = await authClient.changePassword({
        currentPassword: cpCurrent,
        newPassword: cpNew,
        revokeOtherSessions: true,
      });
      if (result.error) throw new Error(result.error.message);
      securityAlert.success("Password changed. Other sessions have been signed out.", 5);
      toast.success("Password changed. Other sessions have been signed out.");
      setCpCurrent(""); setCpNew(""); setCpConfirm("");
    } catch (err: any) {
      securityAlert.error(err.message || "Failed to change password.", 5);
      toast.error(err.message || "Failed to change password.");
    } finally {
      setCpLoading(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailResult = emailSchema.safeParse(ceNewEmail);
    if (!emailResult.success) {
      emailAlert.error(emailResult.error.issues[0].message, 5);
      toast.error(emailResult.error.issues[0].message);
      return;
    }

    setCeLoading(true);
    emailAlert.clear();
    try {
      const result = await authClient.changeEmail({
        newEmail: ceNewEmail,
        callbackURL: "/dashboard",
      });
      if (result.error) throw new Error(result.error.message);
      emailAlert.success(`Verification email sent to ${ceNewEmail}. Your email will update after you verify it.`, 5);
      toast.success(`Verification email sent to ${ceNewEmail}. Your email will update after you verify it.`);
      setCeNewEmail("");
    } catch (err: any) {
      emailAlert.error(err.message || "Failed to request email change.", 5);
      toast.error(err.message || "Failed to request email change.");
    } finally {
      setCeLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDelLoading(true);
    deleteAlert.clear();
    try {
      const result = await authClient.deleteUser({
        password: delPassword || undefined,
        callbackURL: "/",
      });
      if (result.error && !result.error.message?.includes("7 days")) {
        console.log(result.error.message, result.error)
        throw new Error(result.error.message);
      }

      deleteAlert.success("Account deactivated. It will be permanently deleted in 7 days. Log back in to cancel.", 5);
      toast.success("Account deactivated. It will be permanently deleted in 7 days. Log back in to cancel.");
      setShowDeleteModal(false);
      setTimeout(() => signOut().then(() => router.push("/")), 3000);
    } catch (err: any) {
      if (err.message?.includes("7 days") || err.message?.includes("scheduled")) {
        deleteAlert.success("Account deactivated. It will be permanently deleted in 7 days. Log back in to cancel.", 5);
        toast.success("Account deactivated. It will be permanently deleted in 7 days. Log back in to cancel.");
        setShowDeleteModal(false);
        setTimeout(() => signOut().then(() => router.push("/")), 3000);
      } else {
        deleteAlert.error(err.message || "Failed to delete account.", 5);
        toast.error(err.message || "Failed to delete account.");
      }
    } finally {
      setDelLoading(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "danger", label: "Danger", icon: AlertTriangle },
  ];

  const activeIndex = tabs.findIndex((t) => t.id === activeTab);

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-300 ${isOpen ? "visible opacity-100" : "invisible opacity-0"}`}>
      {/* Dark Backdrop with Blur */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-sm transition-all"
      />

      {/* Sliding Panel */}
      <div className={`absolute top-0 right-0 bottom-0 w-full sm:w-[480px] bg-white dark:bg-glanz-black border-l border-slate-200 dark:border-charcoal/80 shadow-2xl flex flex-col justify-start overflow-y-auto transition-transform duration-300 ease-out text-slate-800 dark:text-white ${isOpen ? "translate-x-0" : "translate-x-full"
        }`}>

        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 dark:border-charcoal flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-glanz-gold" />
            <span className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white">Account Profile Settings</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-charcoal/30 dark:hover:bg-charcoal/60 text-slate-500 dark:text-cream hover:text-slate-800 dark:hover:text-white rounded-lg border border-slate-200 dark:border-charcoal/50 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Profile Card Content */}
        <div className="p-6 space-y-6 flex-1">

          {/* Header Card (Completely Column-Wise on Mobile to prevent overflow) */}
          <Card className="border border-slate-200 dark:border-charcoal bg-slate-50 dark:bg-glanz-black shadow-lg">
            <CardContent className="p-5 flex flex-col items-center justify-center text-center gap-4">
              {!imageError && user?.image ? (
                <div className="relative group shrink-0">
                  <Image
                    src={user.image}
                    alt={user.name || "Avatar"}
                    width={64}
                    height={64}
                    onError={() => setImageError(true)}
                    className="w-16 h-16 rounded-full object-cover border-2 border-glanz-gold/30 shadow-md"
                  />
                  {isGoogle && (
                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-glanz-black border border-slate-200 dark:border-charcoal rounded-full p-1 shadow-md">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M12 5.04c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.77 14.97.68 12 .68c-4.3 0-8.01 2.47-9.82 6.07l3.66 2.84c.87-2.6 3.3-4.55 6.16-4.55z" />
                        <path fill="#4285F4" d="M23.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31l3.57 2.77c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18c-.75 1.48-1.18 3.15-1.18 4.93s.43 3.45 1.18 4.93l3.66-2.84z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      </svg>
                    </div>
                  )}
                  {isFacebook && (
                    <div className="absolute -bottom-1 -right-1 bg-[#1877F2] border border-[#1877F2] rounded-full p-1 shadow-md">
                      <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-glanz-gold to-deep-bronze flex items-center justify-center text-2xl font-bold text-glanz-black uppercase border border-glanz-gold/30 shrink-0 shadow-md">
                  {user?.name ? user.name.charAt(0) : "U"}
                </div>
              )}

              <div className="space-y-1 w-full text-center">
                <h4 className="text-xl font-extrabold text-slate-900 dark:text-white truncate px-4">
                  {user?.name || "Premium User"}
                </h4>

                {/* Provider Info Badge */}
                <div className="flex flex-col items-center gap-1.5">
                  <span className="text-slate-500 dark:text-cream/70 text-xs truncate max-w-full block px-4">
                    {user?.email}
                  </span>
                  <div className="inline-flex items-center gap-1 text-[9px] bg-slate-100 dark:bg-charcoal/45 border border-slate-200 dark:border-charcoal text-slate-600 dark:text-cream px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
                    {isGoogle ? (
                      <>
                        <span className="w-1 h-1 rounded-full bg-blue-400" />
                        Google Account
                      </>
                    ) : isFacebook ? (
                      <>
                        <span className="w-1 h-1 rounded-full bg-indigo-400" />
                        Facebook Account
                      </>
                    ) : (
                      <>
                        <span className="w-1 h-1 rounded-full bg-amber-400" />
                        Credentials Sign-in
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full flex justify-center pt-2">
                <Button
                  onClick={() => signOut().then(() => router.push("/login"))}
                  variant="destructive"
                  size="xs"
                  className="border border-rose-500/20"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1" />
                  Log Out
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tab navigation inside sidebar */}
          <div className="relative flex gap-1.5 bg-slate-100 dark:bg-glanz-black/60 border border-slate-200 dark:border-charcoal rounded-xl p-1.5 overflow-hidden shrink-0">
            <div
              className="absolute top-1.5 bottom-1.5 rounded-lg bg-white dark:bg-glanz-gold transition-all duration-300 ease-out shadow-sm dark:shadow-lg dark:shadow-glanz-gold/15"
              style={{
                width: "calc(33.333% - 10px)",
                transform: `translate3d(calc(${activeIndex * 100}% + ${activeIndex * 6}px), 0, 0)`,
              }}
            />
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-[10px] uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer ${isActive
                      ? "text-slate-800 dark:text-glanz-black font-extrabold"
                      : "text-slate-500 dark:text-cream/60 hover:text-slate-800 dark:hover:text-white"
                    }`}
                >
                  <TabIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sliding panels inside drawer container */}
          <div className="w-full overflow-hidden shrink-0">
            <div
              className="flex w-[300%] transition-transform duration-500 ease-out"
              style={{
                transform: `translate3d(-${activeIndex * 33.333}%, 0, 0)`,
              }}
            >
              {/* PANEL 1: PROFILE */}
              <div className="w-1/3 shrink-0 pr-2">
                <Card className="border border-slate-200 dark:border-charcoal bg-slate-50 dark:bg-glanz-black shadow-md">
                  <CardHeader className="border-b border-slate-100 dark:border-charcoal pb-4 text-left">
                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <User className="w-4 h-4 text-glanz-gold" />
                      Edit Profile Records
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-600 dark:text-cream/50">
                      Update your registered auto service profiles.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4.5 space-y-4">
                    <form onSubmit={handleProfileSave} className="space-y-4">
                      <Field
                        label="Full Name"
                        value={pName}
                        onChange={setPName}
                        placeholder="John Doe"
                        icon={User}
                      />

                      <Field
                        label="Phone Number"
                        value={pPhone}
                        onChange={setPPhone}
                        placeholder="+1234567890"
                        type="tel"
                        icon={Phone}
                      />

                      <Field
                        label="WhatsApp Number"
                        value={pWhatsapp}
                        onChange={setPWhatsapp}
                        placeholder="+1234567890"
                        type="tel"
                        icon={Smartphone}
                      />

                      {/* Status Check inside Drawer */}
                      <div className="bg-white dark:bg-glanz-black border border-slate-200 dark:border-charcoal/60 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-cream/50">Verification Status</span>
                        {user?.emailVerified ? (
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2 py-0.5 rounded uppercase flex items-center gap-0.5">
                            Verified
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/15 px-2 py-0.5 rounded uppercase flex items-center gap-0.5">
                            Pending
                          </span>
                        )}
                      </div>

                      <ProfileAlertContainer />

                      <Button
                        type="submit"
                        disabled={pLoading}
                        className="w-full bg-glanz-gold hover:bg-soft-gold text-glanz-black font-extrabold py-3 rounded-xl transition-all shadow-md shadow-glanz-gold/10 text-xs"
                      >
                        {pLoading ? "Saving..." : "Save Profile Details"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* PANEL 2: SECURITY */}
              <div className="w-1/3 shrink-0 px-2 space-y-5">
                <Card className="border border-slate-200 dark:border-charcoal bg-slate-50 dark:bg-glanz-black shadow-md">
                  <CardHeader className="border-b border-slate-100 dark:border-charcoal pb-3.5 text-left">
                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-glanz-gold" />
                      Update Password
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-600 dark:text-cream/50">
                      Other device access tokens will be terminated.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3.5">
                    <form onSubmit={handleChangePassword} className="space-y-3.5">
                      <Field
                        label="Current Password"
                        value={cpCurrent}
                        onChange={setCpCurrent}
                        type="password"
                        placeholder="••••••••"
                        icon={Lock}
                      />
                      <ValidatedInput
                        label="New Password"
                        value={cpNew}
                        schema={delPasswordSchema}
                        isSubmitted={false}
                      >
                        <input
                          type="password"
                          value={cpNew}
                          onChange={(e) => setCpNew(e.target.value)}
                          placeholder="Min 6 chars"
                          className="w-full bg-white dark:bg-glanz-black border border-slate-200 dark:border-charcoal rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-glanz-gold focus:ring-1 focus:ring-glanz-gold transition-all placeholder-midgray"
                        />
                      </ValidatedInput>
                      <ConfirmPasswordInput
                        id="cpConfirm"
                        label="Confirm Password"
                        value={cpConfirm}
                        onValueChange={setCpConfirm}
                        passwordToMatch={cpNew}
                        isSubmitted={false}
                      />
                      <SecurityAlertContainer />

                      <Button
                        type="submit"
                        disabled={cpLoading || !cpCurrent || cpNew.length < 6 || cpNew !== cpConfirm}
                        className="w-full bg-glanz-gold hover:bg-soft-gold text-glanz-black font-extrabold py-3 rounded-xl transition-all shadow-md shadow-glanz-gold/10 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cpLoading ? "Updating..." : "Update Password"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 dark:border-charcoal bg-slate-50 dark:bg-glanz-black shadow-md">
                  <CardHeader className="border-b border-slate-100 dark:border-charcoal pb-3.5 text-left">
                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-glanz-gold" />
                      Modify Email
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-600 dark:text-cream/50">
                      Verification is required before email switch.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <form onSubmit={handleChangeEmail} className="space-y-3.5">
                      <ValidatedInput
                        label="New Email Update"
                        value={ceNewEmail}
                        schema={emailSchema}
                        isSubmitted={false}
                      >
                        <input
                          type="email"
                          value={ceNewEmail}
                          onChange={(e) => setCeNewEmail(e.target.value)}
                          placeholder="Enter your new email address"
                          className="w-full bg-white dark:bg-glanz-black border border-slate-200 dark:border-charcoal rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-glanz-gold focus:ring-1 focus:ring-glanz-gold transition-all placeholder-midgray"
                        />
                      </ValidatedInput>
                      <EmailAlertContainer />

                      <Button
                        type="submit"
                        disabled={ceLoading || !emailSchema.safeParse(ceNewEmail).success}
                        className="w-full bg-glanz-gold hover:bg-soft-gold text-glanz-black font-extrabold py-3 rounded-xl transition-all shadow-md shadow-glanz-gold/10 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {ceLoading ? "Delivering..." : "Deliver Email Verification"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* PANEL 3: DANGER */}
              <div className="w-1/3 shrink-0 pl-2">
                <Card className="border border-rose-200 dark:border-rose-950/30 bg-slate-50 dark:bg-glanz-black shadow-md">
                  <CardHeader className="border-b border-rose-100 dark:border-rose-950/20 pb-3.5 text-left">
                    <CardTitle className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                      Danger Management
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-600 dark:text-cream/50">
                      Serious account deactivations.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/15 rounded-xl p-3 space-y-1.5 text-left">
                      <p className="text-xs font-bold text-rose-600 dark:text-rose-300">Account Hold Deletion</p>
                      <p className="text-[10px] text-slate-500 dark:text-cream/50 leading-relaxed">
                        Permanent drop schedules after a 7-day grace deactivation. Re-sign in before hold expires to recover profile features.
                      </p>
                    </div>

                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteModal(true)}
                      className="w-full py-3 border border-rose-200 dark:border-rose-500/15 font-bold active:scale-[0.98] text-xs rounded-xl"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Request Account Deactivation
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <Card className="border border-rose-200 dark:border-rose-900/40 bg-slate-50 dark:bg-glanz-black w-full max-w-md shadow-2xl p-6 animate-in fade-in zoom-in-95 space-y-5">
            <div className="text-center space-y-2.5">
              <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center mx-auto text-rose-500 dark:text-rose-400 text-xl font-bold">
                ⚠️
              </div>
              <h3 className="text-xl font-extrabold text-rose-600 dark:text-rose-400">Request Account Deactivation</h3>
              <p className="text-slate-600 dark:text-cream/60 text-xs leading-relaxed">
                Your profile will be deactivated instantly and permanently deleted in <br /> <strong className="text-rose-600 dark:text-rose-300">7 days</strong>. Log back in before the hold expires to restore your account.
              </p>
            </div>

            {isCredentialsUser ? (
              <div className="space-y-1.5 text-left">
                <ValidatedInput
                  label="Confirm Profile Password"
                  value={delPassword}
                  schema={delPasswordSchema}
                  isSubmitted={false}
                >
                  <input
                    id="delPassword"
                    type="password"
                    value={delPassword}
                    onChange={(e) => setDelPassword(e.target.value)}
                    placeholder="Enter Your password"
                    className="w-full bg-white dark:bg-glanz-black border border-slate-200 dark:border-charcoal rounded-xl py-2.5 px-4 text-sm text-slate-800 dark:text-white focus:outline-none transition-all placeholder-midgray"
                  />
                </ValidatedInput>
              </div>
            ) : (
              <div className="space-y-1.5 text-left">
                <ValidatedInput
                  label="Confirm Your Email"
                  value={delEmail}
                  schema={z.string().email("Invalid email address").refine(val => val === user?.email, "Email does not match")}
                  isSubmitted={false}
                >
                  <input
                    id="delEmail"
                    type="email"
                    value={delEmail}
                    onChange={(e) => setDelEmail(e.target.value)}
                    placeholder={user?.email || "Enter your email"}
                    className="w-full bg-white dark:bg-glanz-black border border-slate-200 dark:border-charcoal rounded-xl py-2.5 px-4 text-sm text-slate-800 dark:text-white focus:outline-none transition-all placeholder-midgray"
                  />
                </ValidatedInput>
              </div>
            )}

            <DeleteAlertContainer />

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => { setShowDeleteModal(false); deleteAlert.clear(); setDelPassword(""); }}
                disabled={delLoading}
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={delLoading || !isDeleteFormValid}
                className="flex-1 rounded-xl active:scale-[0.97] bg-rose-600 hover:bg-rose-500 dark:bg-rose-500 dark:hover:bg-rose-400 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed border-transparent"
              >
                {delLoading ? "Processing..." : "Confirm Deletion"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
