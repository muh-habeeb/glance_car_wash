"use client";

import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  /** Additional class names */
  className?: string;
  /** Size in pixels (default: 16) */
  size?: number;
}

/**
 * A simple spinning loader icon using Lucide's Loader.
 * Drop this inside any button to replace its text during loading.
 *
 * @example
 * <Button disabled={loading}>
 *   {loading ? <Spinner /> : "Submit"}
 * </Button>
 */
export function Spinner({ className, size = 16 }: SpinnerProps) {
  return (
    <Loader
      className={cn("animate-spin", className)}
      size={size}
      aria-label="Loading"
    />
  );
}
