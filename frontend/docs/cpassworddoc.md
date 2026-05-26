# ConfirmPasswordInput Component — Developer Registry & Documentation

An interactive, gamified password confirmation input component. It offers live, character-by-character visual feedback mapping typed letters against a primary password key. Matches render in beautiful emerald green, while mismatches instantly underline and render in striking crimson red.

---

## 📦 Features

- **Character-by-character Matching Overlay:** Employs a monospaced overlay strategy (`text-transparent caret-glanz-gold` on the primary input, aligned with absolute colored text layers behind it) to color-code matching and mismatching positions on every keystroke.
- **Support for Masked & Unmasked Modes:** Leverages a built-in eye toggle trigger to let users switch seamlessly between dot masking (`•`) and open text characters.
- **Dynamic Color Status Badges:** Renders modern gold, green, or red state badges (`"Matched"`, `"Mismatch"`) automatically as the user types.
- **Bypasses Default Warnings:** Avoids standard HTML5 browser warning notifications, displaying validation errors below the field instead.

---

## 🛠️ Installation & Dependencies

Add the following packages to your project:

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.0.0",
    "lucide-react": "^0.470.0"
  }
}
```

---

## 🚀 Component Source Code (`components/ui/ConfirmPasswordInput.tsx`)

```tsx
"use client";

import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

export interface ConfirmPasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  passwordToMatch: string;
  isSubmitted?: boolean;
}

export function ConfirmPasswordInput({
  label,
  value,
  onValueChange,
  passwordToMatch,
  className,
  id,
  required,
  ...props
}: ConfirmPasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Validate matching state
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
```

---

## 💻 Form Integration

```tsx
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");

<ConfirmPasswordInput
  id="confirmPassword"
  label="Confirm Password"
  value={confirmPassword}
  onValueChange={setConfirmPassword}
  passwordToMatch={password}
  isSubmitted={isSubmitted}
/>
```
