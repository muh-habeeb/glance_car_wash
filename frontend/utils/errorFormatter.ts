export interface ErrorDetail {
  whatHappened: string;
  whyItHappened: string;
  whatToDoNext: string;
}

/**
 * Parses and formats authentication and API errors into a highly readable,
 * actionable structure: "What happened", "Why", and "What to do next".
 */
export function formatAuthError(error: any): ErrorDetail {
  const message = error?.message || String(error);
  const code = error?.code || "";

  // 1. Email Already Exists / Account Already Registered
  if (
    code === "USER_ALREADY_EXISTS" ||
    code === "EMAIL_ALREADY_EXISTS" ||
    message.toLowerCase().includes("user already exists") ||
    message.toLowerCase().includes("email already exists") ||
    message.toLowerCase().includes("already registered")
  ) {
    return {
      whatHappened: "Account Already Exists",
      whyItHappened: "This email address is already registered with Glanz Premium Car Wash.",
      whatToDoNext: "Please click 'Sign In' below to log into your existing account, or use a different email address to register.",
    };
  }

  // 2. Invalid Credentials (Incorrect Email or Password)
  if (
    code === "INVALID_EMAIL_OR_PASSWORD" ||
    code === "INVALID_CREDENTIALS" ||
    message.toLowerCase().includes("invalid email or password") ||
    message.toLowerCase().includes("invalid credentials") ||
    message.toLowerCase().includes("unauthorized")
  ) {
    return {
      whatHappened: "Incorrect Credentials",
      whyItHappened: "The email address or password you entered does not match any registered account.",
      whatToDoNext: "Please double-check your spelling and try again, or click 'Forgot Password' to securely reset it.",
    };
  }

  // 3. Email Verification Required
  if (
    code === "EMAIL_NOT_VERIFIED" ||
    message.toLowerCase().includes("email not verified") ||
    message.toLowerCase().includes("verify your email")
  ) {
    return {
      whatHappened: "Email Verification Required",
      whyItHappened: "Your email address has not been verified yet. We require email verification for secure access.",
      whatToDoNext: "Please check your inbox (including your spam/promotions folder) for the verification link we sent you.",
    };
  }

  // 4. Invalid or Expired Token
  if (
    code === "INVALID_TOKEN" ||
    code === "EXPIRED_TOKEN" ||
    message.toLowerCase().includes("invalid token") ||
    message.toLowerCase().includes("expired token")
  ) {
    return {
      whatHappened: "Security Token Expired or Invalid",
      whyItHappened: "The password reset or action link you clicked has either expired (links are valid for 1 hour) or has already been used.",
      whatToDoNext: "Please go back to the Forgot Password page and request a new reset link to continue securely.",
    };
  }

  // 5. Network / Connection Errors
  if (
    message.toLowerCase().includes("fetch failed") ||
    message.toLowerCase().includes("network error") ||
    message.toLowerCase().includes("failed to fetch")
  ) {
    return {
      whatHappened: "Connection Refused",
      whyItHappened: "The frontend was unable to establish a secure connection with the Glanz servers.",
      whatToDoNext: "Please check your internet connection, ensure the backend service is active, and try again.",
    };
  }

  // 6. Validation Errors (e.g. Zod / schema mismatches)
  if (message.toLowerCase().includes("validation") || error?.errors) {
    return {
      whatHappened: "Information Verification Failed",
      whyItHappened: "One or more fields do not meet our required format criteria.",
      whatToDoNext: "Please ensure your phone number starts with '+' and country code, and check that all inputs are filled correctly.",
    };
  }

  // Default fallback for any unhandled errors
  return {
    whatHappened: "An Unexpected Issue Occurred",
    whyItHappened: message || "The system encountered an unhandled exception during your request.",
    whatToDoNext: "Please wait a moment and try again. If the issue persists, contact support for assistance.",
  };
}
