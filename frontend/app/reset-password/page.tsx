"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "../../lib/auth-client";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!token) {
      setError("Invalid or expired reset token. Please request a new link.");
      setLoading(false);
      return;
    }

    try {
      await authClient.resetPassword({
        newPassword: password,
        token: token,
      });
      setSuccess("Password updated successfully! Redirecting you to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md border border-gray-800 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] relative z-10">
      <h1 className="text-3xl font-extrabold text-center mb-2 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
        New Password
      </h1>
      <p className="text-center text-gray-400 mb-8 text-sm">
        Enter and confirm your new secure password below
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 text-sm text-center animate-pulse">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 p-3 rounded-xl mb-6 text-sm text-center">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1 ml-1">
            New Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-600"
            placeholder="••••••••"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1 ml-1">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-600"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20 disabled:opacity-50 mt-2"
        >
          {loading ? "Processing..." : "Update Password"}
        </button>
      </form>

      <div className="mt-8 text-center border-t border-gray-800/80 pt-6">
        <p className="text-gray-400 text-sm">
          Want to go back?{" "}
          <Link 
            href="/login"
            className="text-blue-400 hover:text-blue-300 font-semibold hover:underline transition-all"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-4 relative overflow-hidden">
      {/* Soft Glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

      <Suspense fallback={
        <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md border border-gray-800 flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 text-sm">Loading security token...</p>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
