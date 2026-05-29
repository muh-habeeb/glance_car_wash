"use client";

import { useRef, useState, useCallback } from "react";
import IntlTelInput from "@intl-tel-input/react";
import "intl-tel-input/styles";

interface PhoneInputProps {
  /** Callback when the phone number or its validity changes */
  onPhoneChange: (phone: string, isValid: boolean) => void;
  /** Callback when the selected country changes */
  onChangeCountry: (countryCode: string) => void;
  /** If true, show validation errors even if the field hasn't been touched */
  isSubmitted?: boolean;
}

export function PhoneInput({
  onPhoneChange,
  onChangeCountry,
  isSubmitted = false,
}: PhoneInputProps) {
  const intlTelInputRef = useRef(null);
  const [touched, setTouched] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [currentNumber, setCurrentNumber] = useState("");
  const [errorCode, setErrorCode] = useState<string | null>(null);

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
      onPhoneChange(number, isValid);
    },
    [onPhoneChange, isValid],
  );

  // Called by the library when the validity changes (requires utils)
  const handleValidityChange = useCallback(
    (valid: boolean) => {
      setIsValid(valid);
      onPhoneChange(currentNumber, valid);
    },
    [onPhoneChange, currentNumber],
  );

  // Called by the library when the validation error code changes
  const handleErrorCodeChange = useCallback(
    (code: string | null) => {
      setErrorCode(code);
    },
    [],
  );

  const showError =
    !isValid && currentNumber.length > 0 && (touched || isSubmitted);
  const errorMessage =
    isSubmitted && currentNumber.length === 0
      ? "Phone is required"
      : getErrorMessage(errorCode);

  return (
    <div className="space-y-1 w-full">
      <label
        htmlFor="phone"
        className="block text-xs font-semibold text-glanz-gold dark:text-glanz-gold uppercase tracking-[3px]"
      >
        Phone
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
      {isSubmitted && currentNumber.length === 0 && (
        <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 pl-1 transition-all duration-200">
          Phone is required
        </p>
      )}
      {showError && errorMessage && (
        <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 pl-1 transition-all duration-200">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

