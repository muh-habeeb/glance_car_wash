"use client";

import { useSession, signOut } from "../../lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { data: sessionData, isPending } = useSession();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isPending && !sessionData) {
      router.push("/login");
    }
  }, [sessionData, isPending, router]);

  const handleSignOut = async () => {
    try {
      await signOut({
        callbackURL: "/login",
      });
    } catch (error) {
      console.error("Sign out failed", error);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm animate-pulse">Loading secure session...</p>
        </div>
      </div>
    );
  }

  if (!sessionData) return null;

  const user = sessionData.user;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background soft glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

      <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl w-full max-w-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-gray-800">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Welcome back, {user?.name || "User"}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Your Glance Car Wash customer portal dashboard
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 active:scale-[0.98] text-sm"
          >
            Log Out
          </button>
        </div>

        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-300">Secure Account Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-950/50 p-4 border border-gray-800/80 rounded-xl">
              <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Email Address</span>
              <span className="text-gray-200 font-medium block truncate">{user?.email}</span>
            </div>

            <div className="bg-gray-950/50 p-4 border border-gray-800/80 rounded-xl">
              <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">User Role</span>
              <span className="text-gray-200 font-medium flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {(user as any)?.role || "USER"}
              </span>
            </div>

            <div className="bg-gray-950/50 p-4 border border-gray-800/80 rounded-xl">
              <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Phone Number</span>
              <span className="text-gray-200 font-medium block">
                {(user as any)?.phone || "Not specified"}
              </span>
            </div>

            <div className="bg-gray-950/50 p-4 border border-gray-800/80 rounded-xl">
              <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">WhatsApp Integration</span>
              <span className="text-gray-200 font-medium block">
                {(user as any)?.whatsapp || "Not integrated (Optional)"}
              </span>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-center gap-3">
            <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="text-xs text-gray-400">
              Authenticated securely via **Better Auth** session credentials. Your connection is encrypted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}