/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { z } from "zod";

export interface ValidatedInputProps {
  label: string;
  value: string;
  schema?: z.ZodTypeAny;
  isSubmitted?: boolean;
  children: React.ReactElement;
  customValidate?: (value: string) => string | null;
}

/**
 * ============================================================================
 * ValidatedInput Wrapper Component
 * ============================================================================
 * 
 * A premium React form validation wrapper that encapsulates a standard HTML `<input>` element.
 * It manages real-time state validation using custom Zod schemas passed directly as a prop,
 * focus blur tracking, and dynamic Tailwind styling (such as error borders).
 * 
 * ### Usage Example:
 * ```tsx
 * const [email, setEmail] = useState("");
 * const [isSubmitted, setIsSubmitted] = useState(false);
 * 
 * // Define a custom schema for this field:
 * const emailSchema = z.string().min(1, "Email is required").email("Enter a valid email");
 * 
 * <ValidatedInput 
 *   label="Email Address" 
 *   value={email} 
 *   schema={emailSchema} 
 *   isSubmitted={isSubmitted}
 * >
 *   <input
 *     id="email"
 *     type="email"
 *     value={email}
 *     onChange={(e) => setEmail(e.target.value)}
 *     placeholder="you@example.com"
 *     className="w-full bg-glanz-black border rounded-xl px-4 py-2.5 text-sm text-white"
 *   />
 * </ValidatedInput>
 * ```
 * 
 * ### Props & Options:
 * @param props - ValidatedInputProps settings:
 * @param props.label - Field label string rendered above the field.
 * @param props.value - Active reactive string state value of the input.
 * @param props.schema - A custom Zod schema used to validate the value dynamically.
 * @param props.isSubmitted - Optional submission state override to force-render validation errors.
 * @param props.children - Single wrapped standard HTML `<input>` React element.
 * @param props.customValidate - Optional custom validator callback returning error string or null.
 */
export function ValidatedInput({
  label,
  value,
  schema,
  isSubmitted,
  children,
  customValidate
}: ValidatedInputProps) {
  const [touched, setTouched] = useState(false);

  // Calculate validation error dynamically during render to avoid cascading renders
  let error: string | null = null;
  if (schema) {
    const result = schema.safeParse(value);
    if (!result.success) {
      error = result.error.issues[0]?.message || "Invalid value";
    }
  }
  if (!error && customValidate) {
    error = customValidate(value);
  }

  const showError = error !== null && (touched || isSubmitted);

  // Cleanly extract the single child input element
  const child = React.Children.only(children) as React.ReactElement<any>;

  // Dynamically inject custom border/ring styles and touch event listeners
  const clonedChild = React.cloneElement(child, {
    onBlur: (e: any) => {
      setTouched(true);
      if (child.props.onBlur) child.props.onBlur(e);
    },
    className: cn(
      child.props.className,
      showError 
        ? "border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500" 
        : "border-slate-200 dark:border-charcoal focus:border-glanz-gold focus:ring-1 focus:ring-glanz-gold"
    )
  });

  return (
    <div className="space-y-1 w-full">
      <label htmlFor={child.props.id} className="block text-xs font-semibold text-slate-600 dark:text-cream uppercase tracking-wider">
        {label}
      </label>
      {clonedChild}
      {showError && (
        <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 pl-1 transition-all duration-200">
          {error}
        </p>
      )}
    </div>
  );
}
