"use client";

import { useState } from "react";
import { authClient } from "../../lib/auth-client";
import Link from "next/link";
import { formatAuthError, ErrorDetail } from "../../utils/errorFormatter";
import ErrorDisplay from "../../components/ErrorDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ValidatedInput } from "@/components/ui/ValidatedInput";
import { z } from "zod";
import { Spinner } from "@/components/ui/Spinner";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { toast } from "sonner";

const emailSchema = z.string().min(1, "Email Address is required").email("Enter a valid email");

export default function ForgotPasswordPage() {
  // Redirect authenticated users to dashboard
  const { isLoading: isCheckingAuth } = useAuthRedirect("/dashboard");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorDetail | null>(null);
  const [success, setSuccess] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isFormValid = emailSchema.safeParse(email).success;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (!isFormValid) return;

    setLoading(true);
    setError(null);
    setSuccess("");

    try {
      const result = await authClient.requestPasswordReset({
        email,
        redirectTo: window.location.origin + "/reset-password",
      });
      if (result?.error) {
        const errMsg = result.error?.message?.toLowerCase() || "";
        const errCode = result.error?.code?.toLowerCase() || "";

        // Check if the backend says the user doesn't exist
        if (
          errCode === "user_not_found" ||
          errMsg.includes("user not found") ||
          errMsg.includes("no user") ||
          errMsg.includes("not found") ||
          errMsg === "user_not_found"
        ) {
          toast.error("Account Not Found", {
            description: "We couldn't find a Glanz account linked to this email address. Please check and try again.",
          });
          return;
        }

        setError(formatAuthError(result.error));
        return;
      }
      setSuccess("A password reset link has been successfully sent to your email!");
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
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
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-glanz-black text-slate-800 dark:text-white p-4 relative overflow-hidden transition-colors duration-300">
      {/* Soft Glow effects using brand colors */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-glanz-gold/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-deep-bronze/5 blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-md border border-slate-200 dark:border-charcoal bg-slate-50 dark:bg-glanz-black text-slate-800 dark:text-white shadow-md dark:shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)] relative z-10 transition-all duration-300">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-extrabold text-glanz-gold">
            Reset Password
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-cream text-xs mt-1">
            Enter your email and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-4">
          <ErrorDisplay error={error} />

          {success && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl text-xs text-center leading-relaxed">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <Button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full bg-glanz-gold hover:bg-soft-gold text-glanz-black font-extrabold py-3 rounded-xl transition-all shadow-md shadow-glanz-gold/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Spinner size={18} className="text-glanz-black" /> : "Send Reset Link"}
            </Button>
          </form>

          <div className="mt-8 text-center border-t border-slate-200 dark:border-charcoal pt-6">
            <p className="text-slate-500 dark:text-cream text-xs">
              Remembered your password?{" "}
              <Link 
                href="/login"
                className="text-glanz-gold hover:text-soft-gold font-semibold transition-all hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
