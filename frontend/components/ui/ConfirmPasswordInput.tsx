"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

export interface ConfirmPasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  passwordToMatch: string;
  isSubmitted?: boolean;
}

/**
 * ============================================================================
 * ConfirmPasswordInput Component
 * ============================================================================
 * 
 * An interactive, premium password confirmation input component.
 * It provides character-by-character validation visualizer comparing active input
 * against a primary password key.
 * 
 * ### Features:
 * - Real-time green/red visual highlighting for matching/mismatching characters.
 * - Supports masked (dots `•`) and plain text mode with a built-in eye toggle trigger.
 * - Dynamic color status badges ("Matched" / "Mismatch").
 * 
 * ### Usage Example:
 * ```tsx
 * const [password, setPassword] = useState("");
 * const [confirmPassword, setConfirmPassword] = useState("");
 * 
 * <ConfirmPasswordInput
 *   id="confirmPassword"
 *   label="Confirm Password"
 *   value={confirmPassword}
 *   onValueChange={setConfirmPassword}
 *   passwordToMatch={password}
 *   isSubmitted={isSubmitted}
 * />
 * ```
 * 
 * @param props - ConfirmPasswordInputProps configurations:
 * @param props.label - Text label string rendered above the input.
 * @param props.value - Active reactive string state for confirm password.
 * @param props.onValueChange - State update dispatcher function.
 * @param props.passwordToMatch - The primary password string to match against.
 * @param props.isSubmitted - Optional form submission override to force mismatch warning.
 */
export function ConfirmPasswordInput({
  label,
  value,
  onValueChange,
  passwordToMatch,
  isSubmitted,
  className,
  id,
  ...props
}: ConfirmPasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Validate state
  const isMatch = value === passwordToMatch;
  const showError = value.length > 0 && !isMatch;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange(e.target.value);
  };

  return (
    <div className="space-y-1 w-full relative">
      <div className="flex justify-between items-center">
        <label htmlFor={id} className="block text-xs font-semibold text-cream uppercase tracking-wider">
          {label}
        </label>
        {value.length > 0 && (
          <span className={cn(
            "text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider",
            isMatch 
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
              : "bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse"
          )}>
            {isMatch ? "Matched" : "Mismatch"}
          </span>
        )}
      </div>

      <div className="relative rounded-xl overflow-hidden">
        {/* Real-time character overlay */}
        <div 
          className="absolute inset-y-0 left-0 right-12 px-4 py-2.5 text-sm font-mono flex items-center pointer-events-none select-none overflow-hidden whitespace-pre"
          aria-hidden="true"
        >
          {value.split("").map((char, index) => {
            const matchChar = passwordToMatch[index];
            const doesCharMatch = char === matchChar;
            const displayChar = showPassword ? char : "•";

            return (
              <span
                key={index}
                className={cn(
                  "inline-block transition-colors duration-100",
                  doesCharMatch 
                    ? "text-emerald-400 font-bold" 
                    : "text-rose-500 font-bold underline decoration-rose-500 decoration-2 decoration-wavy"
                )}
              >
                {displayChar}
              </span>
            );
          })}
        </div>

        {/* Real interactive input element */}
        <input
          ref={inputRef}
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={handleChange}
          className={cn(
            "w-full bg-glanz-black border rounded-xl pl-4 pr-12 py-2.5 text-sm font-mono focus:outline-none transition-all placeholder-midgray text-transparent caret-glanz-gold selection:bg-glanz-gold/25 selection:text-white",
            showError 
              ? "border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500" 
              : isMatch && value.length > 0 
                ? "border-emerald-500/50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
                : "border-charcoal focus:border-glanz-gold focus:ring-1 focus:ring-glanz-gold",
            className
          )}
          placeholder={value.length === 0 ? "••••••••" : ""}
          {...props}
        />

        {/* Show/Hide password toggle */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-midgray hover:text-white transition-colors cursor-pointer"
          tabIndex={-1}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {showError && (
        <p className="text-xs text-rose-400 mt-1 pl-1 transition-all duration-200">
          Passwords do not match
        </p>
      )}
    </div>
  );
}
