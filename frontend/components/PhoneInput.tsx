"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import IntlTelInput from "@intl-tel-input/react";
import "intl-tel-input/styles";

interface PhoneInputProps {
  /** Callback when the phone number or its validity changes */
  onPhoneChange: (phone: string, isValid: boolean) => void;
  /** Callback when the selected country changes */
  onChangeCountry: (countryCode: string) => void;
  /** If true, show validation errors even if the field hasn't been touched */
  isSubmitted?: boolean;
  /** Initial phone number value */
  initialValue?: string;
  /** Label text for the input */
  label?: string;
  /** If true, the field is not required and will not show a "required" error when empty */
  optional?: boolean;
}

export function PhoneInput({
  onPhoneChange,
  onChangeCountry,
  isSubmitted = false,
  initialValue = "",
  label = "Phone",
  optional = false,
}: PhoneInputProps) {
  const intlTelInputRef = useRef(null);
  const [touched, setTouched] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [currentNumber, setCurrentNumber] = useState(initialValue);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  // Sync when initialValue changes from async fetch
  useEffect(() => {
    // Only update the internal instance if the new initialValue differs from our current local state.
    // This prevents resetting the cursor position while the user is actively typing!
    if (initialValue && initialValue !== currentNumber) {
      setCurrentNumber(initialValue);
      // Wait for next tick so IntlTelInput has time to initialize
      const timer = setTimeout(() => {
        if (intlTelInputRef.current) {
          // @ts-expect-error - iti instance exposes setNumber
          const iti = intlTelInputRef.current.getInstance();
          if (iti) {
            iti.setNumber(initialValue);
            setIsValid(iti.isValidNumber());
          }
        }
      }, 50);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue]);

  // Map library error codes to user-friendly messages
  const getErrorMessage = (code: string | null): string | null => {
    if (!code) return null;
    switch (code) {
      case "TOO_SHORT":
        return "Phone number is too short";
      case "TOO_LONG":
        return "Phone number is too long";
      case "INVALID_COUNTRY_CODE":
        return "Invalid country code";
      case "NOT_A_NUMBER":
        return "Not a valid phone number";
      case "INVALID_LENGTH":
        return "Invalid phone number length";
      default:
        return "Enter a valid phone number";
    }
  };

  const handleCountryChange = useCallback(
    (iso2: string) => {
      onChangeCountry(iso2);
    },
    [onChangeCountry],
  );

  // Called by the library when the E.164 formatted number changes (requires utils)
  const handleNumberChange = useCallback(
    (number: string) => {
      setCurrentNumber(number);
    },
    [],
  );

  // Called by the library when the validity changes (requires utils)
  const handleValidityChange = useCallback(
    (valid: boolean) => {
      setIsValid(valid);
    },
    [],
  );

  // Called by the library when the validation error code changes
  const handleErrorCodeChange = useCallback(
    (code: string | null) => {
      setErrorCode(code);
    },
    [],
  );

  const isEmpty = currentNumber.trim().length === 0;
  const isRequiredError = !optional && isSubmitted && isEmpty;
  const isValidationError = !isValid && !isEmpty && (touched || isSubmitted);
  const showError = isRequiredError || isValidationError;

  const errorMessage = isRequiredError
    ? `${label} is required`
    : getErrorMessage(errorCode);

  const lastEmitted = useRef({ number: initialValue, valid: true });

  // Sync the latest number and validity state to the parent safely
  useEffect(() => {
    const effectiveValidity = (optional && isEmpty) ? true : isValid;
    if (lastEmitted.current.number !== currentNumber || lastEmitted.current.valid !== effectiveValidity) {
      lastEmitted.current = { number: currentNumber, valid: effectiveValidity };
      onPhoneChange(currentNumber, effectiveValidity);
    }
  }, [currentNumber, isValid, optional, isEmpty, onPhoneChange]);

  return (
    <div className="space-y-1 w-full">
      <label
        htmlFor="phone"
        className="block text-xs font-semibold text-glanz-gold dark:text-glanz-gold uppercase tracking-[3px]"
      >
        {label}
      </label>

      {/* International Tel Input — dark/light theming via --iti-* vars in globals.css */}
      <div className="iti-glanz-theme">
        <IntlTelInput
          ref={intlTelInputRef}
          initialCountry="ae"
          onChangeCountry={handleCountryChange}
          onChangeNumber={handleNumberChange}
          onChangeValidity={handleValidityChange}
          onChangeErrorCode={handleErrorCodeChange}
          strictMode={true}
          loadUtils={() => import("intl-tel-input/utils")}
          inputProps={{
            id: "phone",
            defaultValue: initialValue,
            placeholder: "50 123 4567",
            maxLength: 15,
            autoComplete: "tel",
            onBlur: () => setTouched(true),
            className: `w-full bg-white dark:bg-glanz-black border rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-1 transition-all placeholder-midgray ${showError
              ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500"
              : "border-slate-200 dark:border-charcoal focus:border-glanz-gold focus:ring-glanz-gold"
              }`,
          }}
        />
      </div>

      {/* Show error: required on submit, or validation error after touch */}
      {showError && (
        <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 pl-1 transition-all duration-200">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

