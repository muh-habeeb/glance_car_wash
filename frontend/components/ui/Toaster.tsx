"use client";

import { Toaster as Sonner } from "sonner";
import { useTheme } from "next-themes";

/**
 * Premium custom colored Sonner Toaster matching the Glanz brand colors.
 * Supports custom colored styles for success, error, warning, and info states.
 * Automatically adapts to the active light/dark theme.
 */
export function Toaster() {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={(resolvedTheme as "light" | "dark") || "light"}
      position="top-center"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-900 group-[.toaster]:border-slate-200 dark:group-[.toaster]:bg-gray-950 dark:group-[.toaster]:text-white dark:group-[.toaster]:border-gray-800 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl border p-4 flex gap-3 items-center",
          description: "group-[.toast]:text-slate-500 dark:group-[.toast]:text-gray-400 text-xs",
          actionButton: "group-[.toast]:bg-[#D8AB44] group-[.toast]:text-[#0B0B0B] font-bold text-xs rounded-lg px-3 py-1 cursor-pointer",
          cancelButton: "group-[.toast]:bg-slate-200 dark:group-[.toast]:bg-gray-800 group-[.toast]:text-slate-700 dark:group-[.toast]:text-white text-xs rounded-lg px-3 py-1 cursor-pointer",
          // Distinct premium colored toast designs
          success: "group-[.toaster]:!bg-emerald-50 group-[.toaster]:!text-emerald-700 group-[.toaster]:!border-emerald-200 dark:group-[.toaster]:!bg-emerald-950/40 dark:group-[.toaster]:!text-emerald-400 dark:group-[.toaster]:!border-emerald-500/30",
          error: "group-[.toaster]:!bg-rose-50 group-[.toaster]:!text-rose-700 group-[.toaster]:!border-rose-200 dark:group-[.toaster]:!bg-rose-950/40 dark:group-[.toaster]:!text-rose-400 dark:group-[.toaster]:!border-rose-500/30",
          warning: "group-[.toaster]:!bg-amber-50 group-[.toaster]:!text-amber-700 group-[.toaster]:!border-amber-200 dark:group-[.toaster]:!bg-amber-950/40 dark:group-[.toaster]:!text-amber-400 dark:group-[.toaster]:!border-amber-500/30",
          info: "group-[.toaster]:!bg-blue-50 group-[.toaster]:!text-blue-700 group-[.toaster]:!border-blue-200 dark:group-[.toaster]:!bg-blue-950/40 dark:group-[.toaster]:!text-blue-400 dark:group-[.toaster]:!border-blue-500/30",
        },
      }}
    />
  );
}

