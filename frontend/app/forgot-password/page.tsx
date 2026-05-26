"use client";

import { useState } from "react";
import { authClient } from "../../lib/auth-client";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await authClient.requestPasswordReset({
        email,
        redirectTo: window.location.origin + "/reset-password",
      });
      setSuccess("A password reset link has been requested! If the email is registered, check your inbox (or backend server logs in development).");
    } catch (err: any) {
      setError(err?.message || "Failed to submit password reset request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-4 relative overflow-hidden">
      {/* Soft Glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

      <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md border border-gray-800 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] relative z-10">
        <h1 className="text-3xl font-extrabold text-center mb-2 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          Reset Password
        </h1>
        <p className="text-center text-gray-400 mb-8 text-sm">
          Enter your email and we'll send you a link to reset your password
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 text-sm text-center animate-pulse">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 p-4 rounded-xl mb-6 text-xs text-center leading-relaxed">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1 ml-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-600"
              placeholder="you@example.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20 disabled:opacity-50 mt-2"
          >
            {loading ? "Processing..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-800/80 pt-6">
          <p className="text-gray-400 text-sm">
            Remembered your password?{" "}
            <Link 
              href="/login"
              className="text-blue-400 hover:text-blue-300 font-semibold hover:underline transition-all"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
