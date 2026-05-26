"use client";

import { Toaster as Sonner } from "sonner";

/**
 * Premium custom colored Sonner Toaster matching the Glanz brand colors.
 * Supports custom colored styles for success, error, warning, and info states.
 */
export function Toaster() {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-gray-950 group-[.toaster]:text-white group-[.toaster]:border-gray-800 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl border p-4 flex gap-3 items-center",
          description: "group-[.toast]:text-gray-400 text-xs",
          actionButton: "group-[.toast]:bg-[#D8AB44] group-[.toast]:text-[#0B0B0B] font-bold text-xs rounded-lg px-3 py-1 cursor-pointer",
          cancelButton: "group-[.toast]:bg-gray-800 group-[.toast]:text-white text-xs rounded-lg px-3 py-1 cursor-pointer",
          // Distinct premium colored toast designs
          success: "group-[.toaster]:bg-emerald-950/30 group-[.toaster]:text-emerald-400 group-[.toaster]:border-emerald-500/20",
          error: "group-[.toaster]:bg-red-950/30 group-[.toaster]:text-red-400 group-[.toaster]:border-red-500/20",
          warning: "group-[.toaster]:bg-amber-950/30 group-[.toaster]:text-amber-400 group-[.toaster]:border-amber-500/20",
          info: "group-[.toaster]:bg-blue-950/30 group-[.toaster]:text-blue-400 group-[.toaster]:border-blue-500/20",
        },
      }}
    />
  );
}
