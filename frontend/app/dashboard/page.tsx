"use client";

import Image from "next/image";
import { useSession, signOut, authClient } from "../../lib/auth-client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { env } from "@/utils/env";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "profile" | "security" | "danger";

// ─── Small re-usable field component ─────────────────────────────────────────
function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white
          focus:outline-none focus:border-yellow-500/60 focus:ring-1 focus:ring-yellow-500/40
          transition-all placeholder-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
      />
    </div>
  );
}

// ─── Alert banner ─────────────────────────────────────────────────────────────
function Alert({ type, message }: { type: "error" | "success" | "info"; message: string }) {
  const styles = {
    error: "bg-red-500/10 border-red-500/40 text-red-400",
    success: "bg-emerald-500/10 border-emerald-500/40 text-emerald-400",
    info: "bg-blue-500/10 border-blue-500/30 text-blue-300",
  };
  return (
    <div className={`text-sm border rounded-xl px-4 py-3 ${styles[type]}`}>{message}</div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { data: sessionData, isPending, refetch } = useSession();
  const router = useRouter();

  // ── Tab state ──
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [imageError, setImageError] = useState(false);

  // ── Profile form ──
  const [pName, setPName] = useState("");
  const [pPhone, setPPhone] = useState("");
  const [pWhatsapp, setPWhatsapp] = useState("");
  const [pLoading, setPLoading] = useState(false);
  const [pMsg, setPMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // ── Change password form ──
  const [cpCurrent, setCpCurrent] = useState("");
  const [cpNew, setCpNew] = useState("");
  const [cpConfirm, setCpConfirm] = useState("");
  const [cpLoading, setCpLoading] = useState(false);
  const [cpMsg, setCpMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // ── Change email form ──
  const [ceNewEmail, setCeNewEmail] = useState("");
  const [ceLoading, setCeLoading] = useState(false);
  const [ceMsg, setCeMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // ── Delete account ──
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [delPassword, setDelPassword] = useState("");
  const [delLoading, setDelLoading] = useState(false);
  const [delMsg, setDelMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // Seed profile form from session
  useEffect(() => {
    if (sessionData?.user) {
      const u = sessionData.user as any;
      setPName(u.name || "");
      setPPhone(u.phone || "");
      setPWhatsapp(u.whatsapp || "");
    }
  }, [sessionData]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isPending && !sessionData) {
      router.push("/login");
    }
  }, [sessionData, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm animate-pulse">Loading secure session...</p>
        </div>
      </div>
    );
  }

  if (!sessionData) return null;

  const user = sessionData.user as any;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPLoading(true);
    setPMsg(null);
    try {
      const body: Record<string, string> = {};
      if (pName.trim() && pName.trim() !== user.name) body.name = pName.trim();
      if (pPhone && pPhone !== user.phone) body.phone = pPhone;
      if (pWhatsapp !== user.whatsapp) body.whatsapp = pWhatsapp;

      if (Object.keys(body).length === 0) {
        setPMsg({ type: "error", text: "No changes detected." });
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
      setPMsg({ type: "success", text: "Profile updated successfully!" });
      refetch?.();
    } catch (err: any) {
      setPMsg({ type: "error", text: err.message || "Something went wrong." });
    } finally {
      setPLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setCpLoading(true);
    setCpMsg(null);
    if (cpNew !== cpConfirm) {
      setCpMsg({ type: "error", text: "New passwords do not match." });
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
      setCpMsg({ type: "success", text: "Password changed. Other sessions have been signed out." });
      setCpCurrent(""); setCpNew(""); setCpConfirm("");
    } catch (err: any) {
      setCpMsg({ type: "error", text: err.message || "Failed to change password." });
    } finally {
      setCpLoading(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setCeLoading(true);
    setCeMsg(null);
    try {
      const result = await authClient.changeEmail({
        newEmail: ceNewEmail,
        callbackURL: "/dashboard",
      });
      if (result.error) throw new Error(result.error.message);
      setCeMsg({
        type: "success",
        text: `Verification email sent to ${ceNewEmail}. Your email will update after you verify it.`,
      });
      setCeNewEmail("");
    } catch (err: any) {
      setCeMsg({ type: "error", text: err.message || "Failed to request email change." });
    } finally {
      setCeLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDelLoading(true);
    setDelMsg(null);
    try {
      const result = await authClient.deleteUser({
        password: delPassword || undefined,
        callbackURL: "/",
      });
      // Better Auth's beforeDelete throws APIError("OK") to cancel hard-delete;
      // the client may receive this as a success-like response.
      if (result.error && !result.error.message?.includes("7 days")) {
        throw new Error(result.error.message);
      }
      setDelMsg({
        type: "success",
        text: "Account deactivated. It will be permanently deleted in 7 days. Log back in to cancel.",
      });
      setTimeout(() => signOut().then(() => router.push("/")), 2000);
    } catch (err: any) {
      // If the message contains our custom 7-day message it's actually a success
      if (err.message?.includes("7 days") || err.message?.includes("scheduled")) {
        setDelMsg({
          type: "success",
          text: "Account deactivated. It will be permanently deleted in 7 days. Log back in to cancel.",
        });
        setTimeout(() => signOut().then(() => router.push("/")), 3000);
      } else {
        setDelMsg({ type: "error", text: err.message || "Failed to delete account." });
      }
    } finally {
      setDelLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "security", label: "Security", icon: "🔒" },
    { id: "danger", label: "Danger Zone", icon: "⚠️" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-start p-4 sm:p-6 pt-10 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-yellow-500/5 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/8 blur-[140px] pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10 space-y-6">
        {/* ── Header Card ── */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_60px_-20px_rgba(0,0,0,0.8)]">
          <div className="flex items-center gap-4">
            {!imageError && user?.image ? (
              <Image
                src={user.image}
                alt={user.name || "Avatar"}
                width={56}
                height={56}
                onError={() => {
                  console.warn("Avatar failed to load — using initials fallback");
                  setImageError(true);
                }}
                className="w-14 h-14 rounded-full object-cover border-2 border-yellow-500/30 shadow-lg"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-xl font-bold text-black uppercase shadow-lg">
                {user?.name ? user.name.charAt(0) : "U"}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-extrabold bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
                {user?.name || "Welcome"}
              </h1>
              <p className="text-gray-400 text-xs mt-0.5">{user?.email}</p>
              <p className="mt-1">
                <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                  {user?.role || "USER"}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut().then(() => router.push("/login"))}
            className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-semibold px-4 py-2 rounded-xl transition-all text-sm active:scale-[0.97]"
          >
            Log Out
          </button>
        </div>

        {/* ── Tab Nav ── */}
        <div className="flex gap-1 bg-gray-900/60 border border-gray-800 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-yellow-500 text-black shadow-md"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/60"
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Profile Tab ── */}
        {activeTab === "profile" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
            <h2 className="text-base font-bold text-white">Edit Profile</h2>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <Field label="Full Name" value={pName} onChange={setPName} placeholder="John Doe" />
              <Field
                label="Phone Number"
                value={pPhone}
                onChange={setPPhone}
                placeholder="+1234567890"
                type="tel"
              />
              <Field
                label="WhatsApp Number (optional)"
                value={pWhatsapp}
                onChange={setPWhatsapp}
                placeholder="+1234567890"
                type="tel"
              />
              {/* Read-only info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="bg-gray-950/60 border border-gray-800/60 rounded-xl px-4 py-3">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-0.5">Email</span>
                  <span className="text-gray-300 text-sm truncate block">{user?.email}</span>
                </div>
                <div className="bg-gray-950/60 border border-gray-800/60 rounded-xl px-4 py-3">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-0.5">Email Verified</span>
                  <span className={`text-sm font-medium ${user?.emailVerified ? "text-emerald-400" : "text-red-400"}`}>
                    {user?.emailVerified ? "✓ Verified" : "✗ Not verified"}
                  </span>
                </div>
              </div>
              {pMsg && <Alert type={pMsg.type} message={pMsg.text} />}
              <button
                type="submit"
                disabled={pLoading}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {pLoading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        )}

        {/* ── Security Tab ── */}
        {activeTab === "security" && (
          <div className="space-y-5">
            {/* Change Password */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
              <div>
                <h2 className="text-base font-bold text-white">Change Password</h2>
                <p className="text-xs text-gray-500 mt-0.5">All other sessions will be signed out after changing.</p>
              </div>
              <form onSubmit={handleChangePassword} className="space-y-3">
                <Field
                  label="Current Password"
                  value={cpCurrent}
                  onChange={setCpCurrent}
                  type="password"
                  placeholder="••••••••"
                />
                <Field
                  label="New Password"
                  value={cpNew}
                  onChange={setCpNew}
                  type="password"
                  placeholder="Min 8 characters"
                />
                <Field
                  label="Confirm New Password"
                  value={cpConfirm}
                  onChange={setCpConfirm}
                  type="password"
                  placeholder="Re-enter new password"
                />
                {cpMsg && <Alert type={cpMsg.type} message={cpMsg.text} />}
                <button
                  type="submit"
                  disabled={cpLoading}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {cpLoading ? "Updating..." : "Update Password"}
                </button>
              </form>
              <p className="text-xs text-gray-600 pt-1">
                Forgot your password?{" "}
                <a href="/forgot-password" className="text-yellow-500 hover:text-yellow-400 underline">
                  Reset via email
                </a>
              </p>
            </div>

            {/* Change Email */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
              <div>
                <h2 className="text-base font-bold text-white">Change Email</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  A verification link will be sent to your <strong>new</strong> email. Your email updates only after verification.
                </p>
              </div>
              <form onSubmit={handleChangeEmail} className="space-y-3">
                <Field
                  label="New Email Address"
                  value={ceNewEmail}
                  onChange={setCeNewEmail}
                  type="email"
                  placeholder="new@example.com"
                />
                {ceMsg && <Alert type={ceMsg.type} message={ceMsg.text} />}
                <button
                  type="submit"
                  disabled={ceLoading}
                  className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {ceLoading ? "Sending..." : "Send Verification Link"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── Danger Zone Tab ── */}
        {activeTab === "danger" && (
          <div className="bg-gray-900 border border-red-900/40 rounded-2xl p-6 space-y-5 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
            <div>
              <h2 className="text-base font-bold text-red-400">Danger Zone</h2>
              <p className="text-xs text-gray-500 mt-0.5">These actions are serious and cannot easily be undone.</p>
            </div>

            {/* 7-day warning banner */}
            <div className="bg-red-950/40 border border-red-800/40 rounded-xl px-4 py-3 space-y-1">
              <p className="text-sm font-semibold text-red-300">⚠️ Account Deletion — 7-Day Grace Period</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Requesting deletion <strong className="text-gray-200">deactivates your account immediately</strong> and
                schedules permanent deletion in <strong className="text-red-300">7 days</strong>. You will receive a
                confirmation email. To cancel, simply log back in before the deadline.
              </p>
            </div>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-semibold py-3 rounded-xl transition-all active:scale-[0.98] text-sm"
            >
              Request Account Deletion
            </button>
          </div>
        )}
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-red-900/50 rounded-2xl p-7 w-full max-w-md shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <h3 className="text-xl font-extrabold text-red-400">Delete Account</h3>
              <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                Your account will be <strong className="text-white">deactivated immediately</strong> and permanently deleted in{" "}
                <strong className="text-red-300">7 days</strong>. This cannot be undone after the grace period.
              </p>
            </div>

            {/* Password confirm (for credential users) */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                Confirm Password <span className="text-gray-600 lowercase normal-case">(if you signed up with email)</span>
              </label>
              <input
                type="password"
                value={delPassword}
                onChange={(e) => setDelPassword(e.target.value)}
                placeholder="Enter your password to confirm"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white
                  focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/40
                  transition-all placeholder-gray-600"
              />
              <p className="text-xs text-gray-600 mt-1">
                Social login users (Google/Facebook) can leave this blank.
              </p>
            </div>

            {delMsg && <Alert type={delMsg.type} message={delMsg.text} />}

            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDelMsg(null); setDelPassword(""); }}
                disabled={delLoading}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2.5 rounded-xl transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={delLoading}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl transition-all active:scale-[0.97] disabled:opacity-50 text-sm"
              >
                {delLoading ? "Processing..." : "Yes, Delete My Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}