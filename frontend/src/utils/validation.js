// CineNova Validation Helper Library

/**
 * Validates full name (min 2 chars, letters, spaces, hyphens, apostrophes).
 */
export const validateName = (name) => {
  const trimmed = String(name || "").trim();
  if (!trimmed) {
    return { valid: false, message: "Please enter your full name." };
  }
  if (trimmed.length < 2) {
    return { valid: false, message: "Full name must be at least 2 characters long." };
  }
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(trimmed)) {
    return { valid: false, message: "Name can only contain letters, spaces, hyphens, and apostrophes." };
  }
  return { valid: true, message: "" };
};

/**
 * Validates email address format.
 */
export const validateEmail = (email) => {
  const trimmed = String(email || "").trim().toLowerCase();
  if (!trimmed) {
    return { valid: false, message: "Please enter your email address." };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, message: "Please enter a valid email address." };
  }
  return { valid: true, message: "", cleanEmail: trimmed };
};

/**
 * Validates password strength (min 8 chars, uppercase, lowercase, number, special char).
 */
export const validatePassword = (password) => {
  const pwd = String(password || "");
  if (!pwd) {
    return { valid: false, message: "Please enter a password." };
  }
  if (pwd.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long." };
  }
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd);

  if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
    return { 
      valid: false, 
      message: "Password must include uppercase, lowercase, number, and special character." 
    };
  }

  return { valid: true, message: "" };
};

/**
 * Validates confirm password matches password.
 */
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { valid: false, message: "Please confirm your password." };
  }
  if (password !== confirmPassword) {
    return { valid: false, message: "Passwords do not match." };
  }
  return { valid: true, message: "" };
};

/**
 * Validates Sri Lankan mobile phone numbers.
 * Formats supported: 07XXXXXXXX, +947XXXXXXXX, 947XXXXXXXX
 */
export const validateSriLankanPhone = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");

  if (!digits) {
    return { valid: false, message: "Please enter a valid 10-digit mobile number." };
  }

  if (digits.length !== 10) {
    return { valid: false, message: "Please enter a valid 10-digit mobile number." };
  }

  return { valid: true, message: "", clean: digits };
};

/**
 * Validates card number input limit (13 to 19 digits).
 * Sanitizes spaces and formats in groups of 4.
 */
export const validateCardNumber = (cardNumber) => {
  const digits = String(cardNumber || "").replace(/\D/g, "").slice(0, 19);

  // Auto-format into 4-digit groups
  const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();

  if (digits.length < 13 || digits.length > 19) {
    return { valid: false, message: "Please enter a valid card number.", formatted };
  }

  return {
    valid: true,
    message: "",
    formatted
  };
};

/**
 * Validates cardholder name (required, min 2 chars, letters/spaces/apostrophes/hyphens).
 */
export const validateCardholderName = (name) => {
  const trimmed = String(name || "").trim();

  if (!trimmed || trimmed.length < 2) {
    return { valid: false, message: "Please enter the name shown on the card." };
  }

  // Must contain valid name characters and at least one letter
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(trimmed)) {
    return { valid: false, message: "Please enter the name shown on the card." };
  }

  return { valid: true, message: "" };
};

/**
 * Validates expiry date in MM/YY format and verifies it is not in the past.
 */
export const validateExpiryDate = (expiry) => {
  const rawDigits = String(expiry || "").replace(/\D/g, "").slice(0, 4);

  let formatted = rawDigits;
  if (rawDigits.length >= 3) {
    formatted = `${rawDigits.slice(0, 2)}/${rawDigits.slice(2)}`;
  }

  if (rawDigits.length < 4) {
    return { valid: false, message: "Enter expiry date as MM/YY.", formatted };
  }

  const month = parseInt(rawDigits.slice(0, 2), 10);
  const year = parseInt(rawDigits.slice(2, 4), 10);

  if (month < 1 || month > 12) {
    return { valid: false, message: "Enter expiry date as MM/YY.", formatted };
  }

  const fullYear = 2000 + year;
  // Card valid until end of selected month (last day, 23:59:59)
  const expiryDate = new Date(fullYear, month, 0, 23, 59, 59);
  const now = new Date();

  if (expiryDate < now) {
    return { valid: false, message: "This card has expired.", formatted };
  }

  return { valid: true, message: "", formatted };
};

/**
 * Validates CVV (digits only, exactly 3 digits).
 */
export const validateCVV = (cvv) => {
  const digits = String(cvv || "").replace(/\D/g, "").slice(0, 3);

  if (digits.length === 3) {
    return { valid: true, message: "", clean: digits };
  }

  return { valid: false, message: "CVV must contain 3 digits.", clean: digits };
};
