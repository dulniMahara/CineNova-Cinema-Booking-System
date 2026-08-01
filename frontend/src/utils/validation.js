// CineNova Validation Helper Library

/**
 * Validates Sri Lankan mobile phone numbers.
 * Formats supported: 07XXXXXXXX, +947XXXXXXXX, 947XXXXXXXX
 */
export const validateSriLankanPhone = (phone) => {
  if (!phone) {
    return { valid: false, message: "Please enter a valid Sri Lankan mobile number." };
  }

  const clean = String(phone).replace(/[\s-]/g, "");

  const isLocal = /^07\d{8}$/.test(clean);
  const isIntlWithPlus = /^\+947\d{8}$/.test(clean);
  const isIntlNoPlus = /^947\d{8}$/.test(clean);

  if (isLocal || isIntlWithPlus || isIntlNoPlus) {
    return { valid: true, message: "" };
  }

  return { valid: false, message: "Please enter a valid Sri Lankan mobile number." };
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
