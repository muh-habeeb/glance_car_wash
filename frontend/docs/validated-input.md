# ValidatedInput Wrapper Component — Developer Registry & Documentation

A premium, React-native form validation wrapper designed for high-performance and premium UX styling. It seamlessly encapsulates standard HTML `<input>` elements as children, injecting dynamic feedback, states, and error handling without using browser-default popup bubbles.

---

## 📦 Features

- **Input-Wrapping Architecture:** Encapsulates standard `<input>` elements directly as React children, preserving natural HTML structures and semantic properties.
- **Zod Validation Schemas:** Global, extensible Zod schemas defining rules for `'email'`, `'password'`, `'phone'`, `'name'`, `'optional-phone'`, and `'text'`.
- **Dynamic CSS Injection:** Clones React children to inject status classes dynamically (e.g. red highlight borders on error) based on focus-blur and submission events.
- **Bypasses Browser Default Warnings:** Prevents native HTML5 error tooltip bubbles from overlaying your interface, using modern styled error feedback beneath the input instead.
- **Public Validation Helper:** Exports a `validateField` function to allow checking form validity globally inside parent elements (e.g. enabling or disabling buttons).

---

## 🛠️ Installation & Dependencies

Ensure your project contains the following dependencies:

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "zod": "^3.22.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.0.0",
    "lucide-react": "^0.470.0"
  }
}
```

### Utility Helper (`utils.ts`)

This component leverages a standard class merger utility (`cn`):

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 🚀 Component Source Code (`components/ui/ValidatedInput.tsx`)

```tsx
"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { z } from "zod";

export type ValidationType = "email" | "password" | "phone" | "name" | "text" | "optional-phone";

export const zodSchemas = {
  email: z.string()
    .min(1, { message: "Email Address is required" })
    .email({ message: "Enter a valid email" }),
  password: z.string()
    .min(1, { message: "Password is required" })
    .min(6, { message: "Password must be at least 6 characters" }),
  phone: z.string()
    .min(1, { message: "Phone is required" }),
  name: z.string()
    .min(1, { message: "Full Name is required" })
    .min(3, { message: "Full Name must be at least 3 characters" }),
  "optional-phone": z.string().optional(),
  text: z.string().min(1, { message: "This field is required" })
};

/**
 * Validates a field value dynamically using Zod schemas.
 */
export function validateField(type: ValidationType, value: string, label: string): string | null {
  const schema = zodSchemas[type];
  if (!schema) return null;
  
  const result = schema.safeParse(value);
  if (result.success) return null;
  
  const err = result.error.issues[0]?.message || "Invalid value";
  return err
    .replace("This field", label)
    .replace("Password", label)
    .replace("Email Address", label)
    .replace("Full Name", label)
    .replace("Phone", label);
}

export interface ValidatedInputProps {
  label: string;
  value: string;
  type: ValidationType;
  isSubmitted?: boolean;
  children: React.ReactElement;
  customValidate?: (value: string) => string | null;
}

export function ValidatedInput({
  label,
  value,
  type,
  isSubmitted,
  children,
  customValidate
}: ValidatedInputProps) {
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let err = validateField(type, value, label);
    if (!err && customValidate) {
      err = customValidate(value);
    }
    setError(err);
  }, [value, type, label, customValidate]);

  const showError = error !== null && (touched || isSubmitted);

  const child = React.Children.only(children) as React.ReactElement<any>;

  const clonedChild = React.cloneElement(child, {
    onBlur: (e: any) => {
      setTouched(true);
      if (child.props.onBlur) child.props.onBlur(e);
    },
    className: cn(
      child.props.className,
      showError 
        ? "border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500" 
        : "border-charcoal focus:border-glanz-gold focus:ring-1 focus:ring-glanz-gold"
    )
  });

  return (
    <div className="space-y-1 w-full">
      <label htmlFor={child.props.id} className="block text-xs font-semibold text-cream uppercase tracking-wider">
        {label}
      </label>
      {clonedChild}
      {showError && (
        <p className="text-xs text-rose-400 mt-1 pl-1 transition-all duration-200">
          {error}
        </p>
      )}
    </div>
  );
}
```

---

## 💻 Visual Integration & Form Checking

### 1. Dynamic Validity Flags
Import `validateField` globally to check validation on form submission (Zod rules apply dynamically, e.g. checking length bounds on name):
```tsx
const isFormValid = 
  validateField("name", name, "Full Name") === null && 
  validateField("email", email, "Email Address") === null && 
  validateField("phone", phone, "Phone") === null && 
  validateField("password", password, "Password") === null && 
  password === confirmPassword;
```

### 2. Form Integration
```tsx
<form onSubmit={handleSubmit} className="space-y-4">
  <ValidatedInput
    label="Email Address"
    value={email}
    type="email"
    isSubmitted={isSubmitted}
  >
    <input
      id="email"
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="you@example.com"
      className="w-full bg-glanz-black border rounded-xl px-4 py-2.5 text-white"
    />
  </ValidatedInput>

  <Button type="submit" disabled={!isFormValid}>
    Submit
  </Button>
</form>
```
