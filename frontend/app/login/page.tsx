/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { signIn, authClient } from "../../lib/auth-client";
import Link from "next/link";
import { formatAuthError, ErrorDetail } from "../../utils/errorFormatter";
import ErrorDisplay from "../../components/ErrorDisplay";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ValidatedInput } from "@/components/ui/ValidatedInput";
import { z } from "zod";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

const emailSchema = z
  .string()
  .min(1, "Email Address is required")
  .email("Enter a valid email");
const passwordSchema = z.string().min(1, "Password is required");

export default function LoginPage() {
  // Redirect authenticated users to dashboard
  const { isLoading: isCheckingAuth } = useAuthRedirect("/dashboard");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const emailParam = params.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }

    const verifyToken = params.get("verifyToken");
    if (verifyToken) {
      // Auto-verify email
      authClient.verifyEmail({ query: { token: verifyToken } }).then((res) => {
        if (res?.error) {
          toast.error("Verification failed", {
            description: res.error.message || "Invalid or expired token.",
          });
        } else {
          toast.success("Account verified successfully!", {
            description:
              "Your email address has been confirmed. You can now sign in.",
          });
        }
        // Clean URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("verifyToken");
        window.history.replaceState({}, "", newUrl.toString());
      });
    }

    const errorParam = params.get("error");
    if (errorParam === "state_mismatch" || errorParam === "invalid_state") {
      toast.error("Authentication Error", {
        description: "Your login session expired or was invalid. Please try logging in again.",
      });
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("error");
      window.history.replaceState({}, "", newUrl.toString());
    }
  }, []);

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "facebook" | null>(null);
  const [error, setError] = useState<ErrorDetail | null>(null);

  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isFormValid =
    emailSchema.safeParse(email).success &&
    passwordSchema.safeParse(password).success;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (!isFormValid) {
      return;
    }

    setLoading(true);
    setError(null);
    setResendSuccess("");

    try {
      const result = await signIn.email({
        email,
        password,
        callbackURL: window.location.origin + "/dashboard",
      });
      // Better Auth returns { data, error } — errors don't throw
      if (result.error) {
        const formattedErr = formatAuthError(result.error);
        setError(formattedErr);
        toast.error(formattedErr.whatHappened, {
          description: formattedErr.whyItHappened,
        });
      } else {
        toast.success("Welcome Back!", {
          description: "Signing you into your secure dashboard...",
        });
      }
    } catch (err: any) {
      const formattedErr = formatAuthError(err);
      setError(formattedErr);
      toast.error(formattedErr.whatHappened, {
        description: formattedErr.whyItHappened,
      });
    } finally {
      setLoading(false);
    }
  };

  // Derived: true when any action is in progress
  const isBusy = loading || socialLoading !== null;

  const handleSocialSignIn = async (provider: "google" | "facebook") => {
    try {
      setSocialLoading(provider);
      setError(null);
      setResendSuccess("");
      const result = await signIn.social({
        provider,
        callbackURL: window.location.origin + "/dashboard",
      });
      if (result?.error) {
        const formattedErr = formatAuthError(result.error);
        setError(formattedErr);
        toast.error(formattedErr.whatHappened, {
          description: formattedErr.whyItHappened,
        });
      }
    } catch (err: any) {
      const formattedErr = formatAuthError(err);
      setError(formattedErr);
      toast.error(formattedErr.whatHappened, {
        description: formattedErr.whyItHappened,
      });
    } finally {
      setSocialLoading(null);
    }
  };

  const handleResendVerification = async () => {
    if (!email) return;
    setResendLoading(true);
    setError(null);
    setResendSuccess("");

    const sendEmailPromise = new Promise(async (resolve, reject) => {
      try {
        const result = await authClient.sendVerificationEmail({
          email,
          callbackURL: window.location.origin + "/dashboard",
        });

        if (result?.error) {
          reject(result.error);
        } else {
          setResendSuccess("A new verification email has been sent! Check your inbox.");
          resolve("Please check your inbox to verify your email address.");
        }
      } catch (err) {
        reject(err);
      }
    });

    toast.promise(sendEmailPromise, {
      loading: "Sending verification email...",
      success: (msg) => `Verification Email Sent: ${msg}`,
      error: (err) => {
        const formattedErr = formatAuthError(err);
        setError(formattedErr);
        return formattedErr.whatHappened;
      },
    });

    try {
      await sendEmailPromise;
    } catch (e) {
      // Ignored here, handled by toast.error callback
    } finally {
      setResendLoading(false);
    }
  };

  const isEmailNotVerified =
    error?.whatHappened === "Email Verification Required";

  // Show a minimal loading state while checking auth session
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-glanz-black">
        <Spinner size={28} className="text-slate-800 dark:text-glanz-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-glanz-black text-slate-800 dark:text-white p-4 transition-colors duration-300">
      <Card className="w-full max-w-md border-slate-200 dark:border-charcoal bg-slate-50 dark:bg-glanz-black text-slate-800 dark:text-white shadow-md dark:shadow-[0_-2px_3px_#ffcc56,0_0px_13px_transparent,0_0px_13px_transparent] transition-all duration-300">
        <CardHeader className="text-center pb-2">
          <div className="text-center uppercase text-xs font-medium mb-1 tracking-[2px] text-glanz-gold">Sign In</div>
          <CardTitle className="text-3xl font-extrabold text-white font-serif flex flex-col items-center">
            Welcome Back.
            <div className=" h-[2px] w-14 bg-amber-400 my-4"></div>
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-cream text-xs mt-1">
            Sign in to book your next wash, view your service history,
            and manage saved vehicles.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          {resendSuccess && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 p-3 rounded-xl text-xs text-center">
              {resendSuccess}
            </div>
          )}

          <ErrorDisplay
            error={error}
            onActionClick={
              isEmailNotVerified ? handleResendVerification : undefined
            }
            actionText="Resend Verification Link"
            actionLoading={resendLoading}
          />

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            aria-label="Sign in credentials form"
          >
            <ValidatedInput
              label="Email"
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

            <div className="space-y-1 relative">
              <ValidatedInput
                label="Password"
                value={password}
                schema={passwordSchema}
                isSubmitted={isSubmitted}
              >
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full bg-white dark:bg-glanz-black border border-slate-200 dark:border-charcoal rounded-xl px-4 py-2.5 pr-14 text-sm text-slate-800 dark:text-white focus:outline-none transition-all placeholder-midgray"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-3 -ml-4 absolute inset-y-0 right-4 flex items-center text-xs font-bold text-glanz-gold hover:text-soft-gold transition-colors cursor-pointer"
                    tabIndex={0}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </ValidatedInput>

              <div className="flex justify-end mt-1">
                <Link
                  href="/forgot-password"
                  className="text-xs text-glanz-gold hover:text-soft-gold transition-all font-semibold pl-3 pr-3 pb-3"
                  aria-label="Forgot your password?"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isBusy || !isFormValid}
              className="group mt-2 w-full bg-glanz-gold hover:bg-soft-gold text-glanz-black font-extrabold py-3 rounded-xl transition-all shadow-md shadow-glanz-gold/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Spinner size={18} className="text-glanz-black " />
              ) : (
                <span className="flex items-center justify-between font-semibold tracking-[1.2px]">
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              )}
            </Button>
          </form>

          <div className="text-center pt-2">
            <label className="text-slate-500 dark:text-cream text-xs" htmlFor="nav-signup">
              {"Don't have an account? "}
              <Link
                id='nav-signup'
                href="/signup"
                tabIndex={0}
                className="text-glanz-gold hover:text-soft-gold font-semibold transition-all hover:underline -ml-3 p-3"
              >
                Sign Up
              </Link>
            </label>
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
                <Spinner size={16} className="text-slate-800 dark:text-glanz-gold" />
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
                <Spinner size={16} className="text-slate-800 dark:text-glanz-gold" />
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
