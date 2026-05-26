"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "../../lib/auth-client";
import Link from "next/link";
import { formatAuthError, ErrorDetail } from "../../utils/errorFormatter";
import ErrorDisplay from "../../components/ErrorDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ValidatedInput } from "@/components/ui/ValidatedInput";
import { ConfirmPasswordInput } from "@/components/ui/ConfirmPasswordInput";
import { z } from "zod";

const passwordSchema = z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters");

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorDetail | null>(null);
  const [success, setSuccess] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const isFormValid = 
    passwordSchema.safeParse(password).success && 
    password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (!isFormValid) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess("");

    if (!token) {
      setError({
        whatHappened: "Missing Security Token",
        whyItHappened: "No reset token was found in your URL query parameters.",
        whatToDoNext: "Please request a new reset link from the Forgot Password page."
      });
      setLoading(false);
      return;
    }

    try {
      const result = await authClient.resetPassword({
        newPassword: password,
        token: token,
      });
      if (result?.error) {
        setError(formatAuthError(result.error));
        return;
      }
      setSuccess("Password updated successfully! Redirecting you to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border border-charcoal bg-glanz-black text-white shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)] relative z-10 transition-all duration-300">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-3xl font-extrabold text-glanz-gold">
          New Password
        </CardTitle>
        <CardDescription className="text-cream text-xs mt-1">
          Enter and confirm your new secure password below
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-4">
        <ErrorDisplay error={error} />

        {success && (
          <div className="bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl text-xs text-center animate-pulse">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <ValidatedInput
            label="New Password"
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
              className="w-full bg-glanz-black border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all placeholder-midgray"
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

          <Button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full bg-glanz-gold hover:bg-soft-gold text-glanz-black font-extrabold py-3 rounded-xl transition-all shadow-md shadow-glanz-gold/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Update Password"}
          </Button>
        </form>

        <div className="mt-8 text-center border-t border-charcoal pt-6">
          <p className="text-cream text-xs">
            Want to go back?{" "}
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
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-glanz-black text-white p-4 relative overflow-hidden">
      {/* Soft Glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-glanz-gold/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-deep-bronze/5 blur-[120px] pointer-events-none" />

      <Suspense fallback={
        <div className="bg-glanz-black border border-charcoal p-8 rounded-2xl w-full max-w-md flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-4 border-glanz-gold/20 border-t-glanz-gold rounded-full animate-spin mb-4"></div>
          <p className="text-cream text-sm">Loading security token...</p>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
