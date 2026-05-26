"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9.5 h-9.5 rounded-xl border border-slate-200 dark:border-charcoal bg-slate-50 dark:bg-glanz-black/60 flex items-center justify-center opacity-40" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-9.5 h-9.5 rounded-xl border border-slate-200 hover:border-slate-300 dark:border-charcoal/80 dark:hover:border-glanz-gold/40 bg-slate-50 dark:bg-glanz-black/60 hover:bg-slate-100 dark:hover:bg-charcoal/40 text-slate-700 dark:text-cream hover:text-slate-900 dark:hover:text-glanz-gold transition-all duration-300 flex items-center justify-center cursor-pointer shadow-sm relative overflow-hidden focus:outline-none focus:ring-1 focus:ring-glanz-gold/30 shrink-0"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className="relative w-4.5 h-4.5 flex items-center justify-center">
        {isDark ? (
          <Moon className="w-4.5 h-4.5 transition-transform duration-300 hover:scale-110" />
        ) : (
          <Sun className="w-4.5 h-4.5 transition-transform duration-300 hover:scale-110" />
        )}
      </div>
    </button>
  );
}

