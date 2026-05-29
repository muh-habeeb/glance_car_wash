/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { signIn, signUp } from "../../lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatAuthError, ErrorDetail } from "../../utils/errorFormatter";
import ErrorDisplay from "../../components/ErrorDisplay";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { z } from "zod";
import { ValidatedInput } from "@/components/ui/ValidatedInput";
import { ConfirmPasswordInput } from "@/components/ui/ConfirmPasswordInput";

import disposableDomains from "disposable-email-domains";
import { extraBurners } from "../../lib/burnerDomains";
import { PhoneInput } from "@/components/PhoneInput";
import { Spinner } from "@/components/ui/Spinner";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { toast } from "sonner";
import { ArrowUpRightIcon } from "lucide-react";

// Define field-level Zod validation schemas
const nameSchema = z
  .string()
  .min(1, "Full Name is required")
  .min(3, "Full Name must be at least 3 characters");
const emailSchema = z
  .email("Enter a valid email")
  .min(1, "Email Address is required")
  .refine(
    (email) => {
      const domain = email.split("@")[1]?.toLowerCase();
      return (
        domain &&
        !disposableDomains.includes(domain) &&
        !extraBurners.includes(domain)
      );
    },
    { message: "Registration rejected. Burner emails are not allowed." },
  );
const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters");

export default function SignupPage() {
  const router = useRouter();

  // Redirect authenticated users to dashboard
  const { isLoading: isCheckingAuth } = useAuthRedirect("/dashboard");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "missing_phone") {
      setError({
        whatHappened: "Registration Incomplete",
        whyItHappened: "It seems you don't have an account, or you didn't provide a phone number during registration.",
        whatToDoNext: "Please enter your phone number first before using social login.",
      });
      // Clean the URL without adding any history entries
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("error");
      window.history.replaceState(null, "", newUrl.toString());
    }
  }, []);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [countryCode, setCountryCode] = useState("ae");

  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "facebook" | null>(null);
  const [error, setError] = useState<ErrorDetail | null>(null);
  const [success, setSuccess] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isFormValid =
    nameSchema.safeParse(name).success &&
    emailSchema.safeParse(email).success &&
    isPhoneValid &&
    phone.length > 0 &&
    passwordSchema.safeParse(password).success &&
    password === confirmPassword;

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (!isFormValid) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess("");

    try {
      // Casting to 'any' to bypass TS error for custom fields (phone, whatsapp)
      // since the frontend authClient isn't strictly typed with the backend instance.
      const result = await (signUp.email as any)({
        name,
        email,
        password,
        phone,
        countryCode,
        callbackURL: window.location.origin + "/dashboard?verified=true",
      });

      if (result.error) {
        setError(formatAuthError(result.error));
        return;
      }

      setSuccess(
        "Account created, verification email has been sent please verify your account.",
      );
      setTimeout(() => {
        router.push(`/login?email=${encodeURIComponent(email)}`);
      }, 5000);
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  // Derived: true when any action is in progress
  const isBusy = loading || socialLoading !== null;

  const handleSocialSignIn = async (provider: "google" | "facebook") => {
    if (!isPhoneValid || phone.length === 0) {
      toast.error("Phone number is required before using social login.");
      return;
    }

    // Set phone in a short-lived cookie for the backend to read during OAuth callback
    document.cookie = `social_signup_phone=${encodeURIComponent(phone)}; path=/; max-age=3600; SameSite=Lax`;

    try {
      setSocialLoading(provider);
      setError(null);
      const result = await signIn.social({
        provider,
        callbackURL: window.location.origin + "/dashboard",
      });
      if (result?.error) {
        setError(formatAuthError(result.error));
      }
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setSocialLoading(null);
    }
  };

  // Show a minimal loading state while checking auth session
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-glanz-black">
        <Spinner size={28} className="text-glanz-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-glanz-black text-slate-800 dark:text-white p-4 transition-colors duration-300">
      <Card
        className="w-full max-w-md border border-slate-200 dark:border-charcoal bg-slate-50 dark:bg-glanz-black text-slate-800 dark:text-white shadow-md dark:shadow-[0_-2px_3px_#ffcc56,0_0px_13px_transparent,0_0px_13px_transparent] transition-all duration-300"
      >
        <CardHeader className="text-center pb-2">
          <CardDescription className="text-center uppercase text-xs font-medium mb-1 tracking-[2px] text-glanz-gold">
            Create Account
          </CardDescription>
          <CardTitle className="text-3xl font-extrabold text-white font-serif flex flex-col items-center ">
            Start your shine.
            <div className=" h-[2px] w-14 bg-amber-400 my-4"></div>
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-cream text-xs mt-1">
            A Glanz account unlocks one-tap bookings, service
            reminders, and member-only offers.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <ErrorDisplay
            error={error}
            expiryMs={4000}
            onExpire={() => setError(null)}
          />

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl mb-6 text-sm text-center">
              {success}
            </div>
          )}


          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            aria-label="Sign up registration form"
          >
            <ValidatedInput
              label="Full Name"
              value={name}
              schema={nameSchema}
              isSubmitted={isSubmitted}
            >
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                autoComplete="name"
                className="w-full bg-white dark:bg-glanz-black border border-slate-200 dark:border-charcoal rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none transition-all placeholder-midgray"
              />
            </ValidatedInput>

            <ValidatedInput
              label="Email Address"
              value={email}
              schema={emailSchema}
              isSubmitted={isSubmitted}
            >
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full bg-white dark:bg-glanz-black border border-slate-200 dark:border-charcoal rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none transition-all placeholder-midgray"
              />
            </ValidatedInput>

            <PhoneInput
              onPhoneChange={(number, valid) => {
                setPhone(number);
                setIsPhoneValid(valid);
              }}
              onChangeCountry={setCountryCode}
              isSubmitted={isSubmitted}
            />

            <ValidatedInput
              label="Password"
              value={password}
              schema={passwordSchema}
              isSubmitted={isSubmitted}
            >
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full bg-white dark:bg-glanz-black border border-slate-200 dark:border-charcoal rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none transition-all placeholder-midgray"
              />
            </ValidatedInput>

            <ConfirmPasswordInput
              id="confirmPassword"
              label="Confirm Password"
              value={confirmPassword}
              onValueChange={setConfirmPassword}
              passwordToMatch={password}
              isSubmitted={isSubmitted}
            />

            <p className="text-[11px] text-slate-500 dark:text-cream/60 text-center leading-relaxed">
              By signing up, you agree to our{" "}
              <Link
                href="/terms"
                className="text-glanz-gold hover:underline font-semibold"
              >
                Terms of Service
              </Link>
              {" and "}
              <Link
                href="/privacy"
                className="text-glanz-gold hover:underline font-semibold"
              >
                Privacy Policy
              </Link>
              .
            </p>

            <Button
              type="submit"
              disabled={isBusy || !isFormValid}
              className="w-full bg-glanz-gold hover:bg-soft-gold text-white font-extrabold py-3 rounded-xl transition-all shadow-md shadow-glanz-gold/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Spinner size={18} className="text-cream " />
              ) : (
                <span className="flex items-center justify-between font-semibold tracking-[1.2px]">
                  Sign In
                  <ArrowUpRightIcon className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              )}
            </Button>
          </form>

          <div className="text-center pt-2">
            <p className="text-slate-500 dark:text-cream text-sm">
              {"Already have an account? "}
              <Link
                href="/login"
                className="text-glanz-gold hover:text-soft-gold font-semibold transition-all hover:underline  p-3 -ml-3"
              >
                Sign In
              </Link>
            </p>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-charcoal"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-slate-50 dark:bg-glanz-black text-slate-400 dark:text-midgray uppercase tracking-wider text-[10px] font-bold">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant="outline"
              disabled={isBusy}
              onClick={() => handleSocialSignIn("google")}
              className="flex items-center justify-center border border-slate-200 dark:border-charcoal rounded-xl hover:bg-slate-100 dark:hover:bg-charcoal text-slate-700 dark:text-white transition-all bg-white dark:bg-glanz-black/50 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {socialLoading === "google" ? (
                <Spinner size={16} className="text-slate-500" />
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="#EA4335"
                      d="M12 5.04c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.77 14.97.68 12 .68c-4.3 0-8.01 2.47-9.82 6.07l3.66 2.84c.87-2.6 3.3-4.55 6.16-4.55z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31l3.57 2.77c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18c-.75 1.48-1.18 3.15-1.18 4.93s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                  </svg>
                  Google
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isBusy}
              onClick={() => handleSocialSignIn("facebook")}
              className="flex items-center justify-center border border-slate-200 dark:border-charcoal rounded-xl hover:bg-slate-100 dark:hover:bg-charcoal text-slate-700 dark:text-white transition-all bg-white dark:bg-glanz-black/50 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {socialLoading === "facebook" ? (
                <Spinner size={16} className="text-slate-500" />
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2 fill-[#1877F2]" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
