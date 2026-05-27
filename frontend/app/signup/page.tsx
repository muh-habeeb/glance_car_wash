/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { signIn, signUp } from "../../lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatAuthError, ErrorDetail } from "../../utils/errorFormatter";
import ErrorDisplay from "../../components/ErrorDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { z } from "zod";
import { ValidatedInput } from "@/components/ui/ValidatedInput";
import { ConfirmPasswordInput } from "@/components/ui/ConfirmPasswordInput";

import disposableDomains from "disposable-email-domains";
import { extraBurners } from "../../lib/burnerDomains";

// Define field-level Zod validation schemas
const nameSchema = z.string().min(1, "Full Name is required").min(3, "Full Name must be at least 3 characters");
const emailSchema = z.string().email("Enter a valid email").min(1, "Email Address is required").refine(
  (email) => {
    const domain = email.split("@")[1]?.toLowerCase();
    return domain && !disposableDomains.includes(domain) && !extraBurners.includes(domain);
  },
  { message: "Registration rejected. Burner emails are not allowed." }
);
const phoneSchema = z.string().min(1, "Phone is required").startsWith("+", "Add country code to your phone number ").min(6, "Enter valid phone number");
const passwordSchema = z.string().min(1, "Password is required").min(8, "Password must be at least 8 characters");

export default function SignupPage() {
  const router = useRouter();

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorDetail | null>(null);
  const [success, setSuccess] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isFormValid =
    nameSchema.safeParse(name).success &&
    emailSchema.safeParse(email).success &&
    phoneSchema.safeParse(phone).success &&
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

    try {
      // Casting to 'any' to bypass TS error for custom fields (phone, whatsapp)
      // since the frontend authClient isn't strictly typed with the backend instance.
      const result = await (signUp.email as any)({
        name,
        email,
        password,
        phone,
        whatsapp,
        callbackURL: window.location.origin + "/dashboard?verified=true",
      });

      if (result.error) {
        setError(formatAuthError(result.error));
        return;
      }

      setSuccess("Account created, verification email has been sent please verify your account.");
      setTimeout(() => {
        router.push(`/login?email=${encodeURIComponent(email)}`);
      }, 7000);
    } catch (err: any) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: "google" | "facebook") => {
    try {
      const result = await signIn.social({
        provider,
        callbackURL: window.location.origin + "/dashboard",
      });
      if (result?.error) {
        setError(formatAuthError(result.error));
      }
    } catch (err: any) {
      setError(formatAuthError(err));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-glanz-black text-slate-800 dark:text-white p-4 transition-colors duration-300">
      <Card className="w-full max-w-md border border-slate-200 dark:border-charcoal bg-slate-50 dark:bg-glanz-black text-slate-800 dark:text-white shadow-md dark:shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)] transition-all duration-300">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-extrabold text-glanz-gold">
            Create Account
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-cream text-xs mt-1">
            Join us today for the best car wash experience
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          <ErrorDisplay error={error} />

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl mb-6 text-sm text-center">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" aria-label="Sign up registration form">
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

            <div className="grid grid-cols-2 gap-4">
              <ValidatedInput
                label="Phone"
                value={phone}
                schema={phoneSchema}
                isSubmitted={isSubmitted}
              >
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1234567890"
                  autoComplete="tel"
                  className="w-full bg-white dark:bg-glanz-black border border-slate-200 dark:border-charcoal rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none transition-all placeholder-midgray"
                />
              </ValidatedInput>
              <ValidatedInput
                label="WhatsApp (Optional)"
                value={whatsapp}
                isSubmitted={isSubmitted}
              >
                <input
                  id="whatsapp"
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+1234567890"
                  autoComplete="tel"
                  className="w-full bg-white dark:bg-glanz-black border border-slate-200 dark:border-charcoal rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none transition-all placeholder-midgray"
                />
              </ValidatedInput>
            </div>

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
              <Link href="/terms" className="text-glanz-gold hover:underline font-semibold">Terms of Service</Link>
              {" and "}
              <Link href="/privacy" className="text-glanz-gold hover:underline font-semibold">Privacy Policy</Link>.
            </p>

            <Button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full bg-glanz-gold hover:bg-soft-gold text-glanz-black font-extrabold py-3 rounded-xl transition-all shadow-md shadow-glanz-gold/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Sign Up"}
            </Button>
          </form>

          <div className="text-center pt-2">
            <p className="text-slate-500 dark:text-cream text-sm">
              {"Already have an account? "}
              <Link
                href="/login"
                className="text-glanz-gold hover:text-soft-gold font-semibold transition-all hover:underline"
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
              <span className="px-4 bg-slate-50 dark:bg-glanz-black text-slate-400 dark:text-midgray uppercase tracking-wider text-[10px] font-bold">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => handleSocialSignIn("google")}
              className="flex items-center justify-center border border-slate-200 dark:border-charcoal rounded-xl hover:bg-slate-100 dark:hover:bg-charcoal text-slate-700 dark:text-white transition-all bg-white dark:bg-glanz-black/50 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.77 14.97.68 12 .68c-4.3 0-8.01 2.47-9.82 6.07l3.66 2.84c.87-2.6 3.3-4.55 6.16-4.55z" />
                <path fill="#4285F4" d="M23.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31l3.57 2.77c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18c-.75 1.48-1.18 3.15-1.18 4.93s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              </svg>
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => handleSocialSignIn("facebook")}
              className="flex items-center justify-center border border-slate-200 dark:border-charcoal rounded-xl hover:bg-slate-100 dark:hover:bg-charcoal text-slate-700 dark:text-white transition-all bg-white dark:bg-glanz-black/50 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 mr-2 fill-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
