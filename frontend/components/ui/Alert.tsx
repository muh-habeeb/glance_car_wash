"use client";

/**
 * @file Alert.tsx
 * @description Premium styled Alert component and state hook for React, matching the Glanz brand guidelines.
 * Supports standard declarative Alert blocks, as well as a fully programmatic, imperative `useAlert` API
 * which is directly callable (e.g. `alert("message", ttl)`) and has helper methods (e.g. `alert.success()`).
 * Operates beautifully in both Dark Mode and Light Mode.
 */

import { useState, useCallback, useRef } from "react";
import { ShieldAlert, Check, Info } from "lucide-react";

/**
 * @interface AlertState
 * @description Internal state structure used by the programmatic `useAlert` hook.
 */
interface AlertState {
  /** The severity or status type of the alert message */
  type: "default" | "error" | "success" | "info";
  /** The descriptive text message to render */
  message: string;
  /** Optional time-to-live in seconds. If provided, the alert auto-dismisses after this period */
  ttl?: number;
}

/**
 * @interface AlertProps
 * @description Configuration properties accepted by the stateless Alert component.
 */
interface AlertProps {
  /** The visual status style category of the alert banner */
  type?: "default" | "error" | "success" | "info";
  /** The message text to display to the user */
  message: string;
  /** Callback fired when the manual close button (✕) is clicked */
  onClose?: () => void;
}

/**
 * Alert Component
 * 
 * A stateless, premium designed notification panel styled to support both light and dark mode themes.
 * Uses rich gold, rose, emerald, and blue accents depending on severity.
 * 
 * @param {AlertProps} props - The component parameters
 */
export function Alert({ type = "default", message, onClose }: AlertProps) {
  // Cohesive styling for both Light and Dark modes
  const styles = {
    default: "bg-slate-100/80 dark:bg-charcoal/30 border-slate-200 dark:border-charcoal/80 text-slate-700 dark:text-cream",
    error: "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-400",
    success: "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400",
    info: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-300",
  };

  // Status-aligned vector icons from Lucide
  const icons = {
    default: Info,
    error: ShieldAlert,
    success: Check,
    info: Info,
  };

  const Icon = icons[type];

  return (
    <div className={`text-xs border rounded-xl px-4 py-3 flex items-start gap-2.5 ${styles[type]} leading-relaxed text-left transition-all duration-300 animate-in fade-in`}>
      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
      <span className="flex-1 font-medium">{message}</span>
      {onClose && (
        <button 
          onClick={onClose}
          type="button" 
          className="text-current opacity-60 hover:opacity-100 transition-opacity ml-1.5 cursor-pointer shrink-0 font-bold"
          aria-label="Dismiss Alert"
        >
          ✕
        </button>
      )}
    </div>
  );
}

/**
 * @interface AlertCallable
 * @description The custom callable function API returned by `useAlert()`.
 */
export interface AlertCallable {
  /** Default trigger function (renders a neutral basic/info style) */
  (message: string, ttl?: number): void;
  /** Programmatically triggers a success alert */
  success: (message: string, ttl?: number) => void;
  /** Programmatically triggers an error alert */
  error: (message: string, ttl?: number) => void;
  /** Programmatically triggers an info alert */
  info: (message: string, ttl?: number) => void;
  /** Resets and clears the active alert banner */
  clear: () => void;
}

/**
 * useAlert React Hook
 * 
 * A custom React hook that exposes a fully programmatically controlled, callable Alert API.
 * This simplifies form components by avoiding manual local states and render slots.
 * 
 * @example
 * ```tsx
 * const [profileAlert, ProfileAlertContainer] = useAlert();
 * 
 * // Trigger default basic alert directly as a function call
 * profileAlert("Checking system parameters...", 5);
 * 
 * // Helper methods are also fully active
 * profileAlert.success("Settings updated successfully!", 5); 
 * profileAlert.error("Failed to connect."); 
 * 
 * return (
 *   <form onSubmit={handleSave}>
 *     <ProfileAlertContainer />
 *     <button type="submit">Save</button>
 *   </form>
 * );
 * ```
 * 
 * @returns {readonly [AlertCallable, () => React.JSX.Element | null]} Tuple containing:
 *  - **AlertCallable**: A directly callable function that also exposes methods (`.success()`, etc.)
 *  - **AlertContainer**: Self-contained component to render inline inside the layout
 */
export function useAlert() {
  const [state, setState] = useState<AlertState | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Resets active alerts and clears any scheduled auto-dismiss timers.
   */
  const clear = useCallback(() => {
    setState(null);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /**
   * Schedules an alert display.
   */
  const trigger = useCallback((type: "default" | "error" | "success" | "info", message: string, ttl?: number) => {
    // Clear any previous alerts/timers first to prevent race conditions
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    setState({ type, message, ttl });

    if (ttl && ttl > 0) {
      timerRef.current = setTimeout(() => {
        setState(null);
      }, ttl * 1000);
    }
  }, []);

  // Construct the callable function with helper methods
  const alertApi: AlertCallable = Object.assign(
    (message: string, ttl?: number) => trigger("default", message, ttl),
    {
      success: (message: string, ttl?: number) => trigger("success", message, ttl),
      error: (message: string, ttl?: number) => trigger("error", message, ttl),
      info: (message: string, ttl?: number) => trigger("info", message, ttl),
      clear
    }
  );

  /**
   * Programmatic Alert Container
   */
  const AlertContainer = useCallback(() => {
    if (!state) return null;
    return (
      <Alert 
        key={`${state.type}-${state.message}`}
        type={state.type} 
        message={state.message} 
        onClose={clear}
      />
    );
  }, [state, clear]);

  return [alertApi, AlertContainer] as const;
}
