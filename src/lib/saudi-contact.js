/**
 * Saudi national ID / iqama and mobile phone validation helpers.
 * Used across contract wizards, dialogs, and employee forms.
 */

export const SAUDI_NATIONAL_ID_MESSAGE =
  "رقم الهوية يجب أن يكون 10 أرقام ويبدأ بـ 1 أو 2";
export const SAUDI_NATIONAL_ID_DIGITS_ONLY_MESSAGE =
  "رقم الهوية يقبل أرقام فقط";
export const SAUDI_PHONE_MESSAGE =
  "رقم الجوال يجب أن يكون 10 أرقام ويبدأ بـ 05";
export const SAUDI_PHONE_DIGITS_ONLY_MESSAGE =
  "رقم الجوال يقبل أرقام فقط";

/** Keep digits only; normalizes Arabic-Indic and Eastern Arabic digits. */
export function digitsOnly(value) {
  return Array.from(String(value ?? ""), (char) => {
    const code = char.codePointAt(0);
    if (code >= 0x0660 && code <= 0x0669) return String(code - 0x0660);
    if (code >= 0x06f0 && code <= 0x06f9) return String(code - 0x06f0);
    if (code >= 48 && code <= 57) return char;
    return "";
  }).join("");
}

/**
 * Detect whether a form field key is a national ID or phone input.
 * Prefer an explicit `inputKind` on the field schema when present.
 */
export function getSaudiContactFieldKind(fieldOrKey) {
  if (!fieldOrKey) return null;
  if (typeof fieldOrKey === "object") {
    if (fieldOrKey.inputKind === "national_id" || fieldOrKey.inputKind === "phone") {
      return fieldOrKey.inputKind;
    }
    return getSaudiContactFieldKind(fieldOrKey.key);
  }

  const key = String(fieldOrKey);
  if (/id_num|national_num|national_id/.test(key)) return "national_id";
  if (/mobile|phone|contact_number|contactNumber|otherNumber|other_number/.test(key)) {
    return "phone";
  }
  return null;
}

/** National ID: 10 digits, starts with 1 or 2. */
export function isSaudiNationalId(value) {
  const digits = digitsOnly(value);
  return /^[12]\d{9}$/.test(digits);
}

/**
 * Saudi mobile: 05xxxxxxxx (10 digits).
 * Also accepts 5xxxxxxxx / 9665xxxxxxxx and normalizes for the check.
 */
export function isSaudiMobile(value) {
  let digits = digitsOnly(value);
  if (digits.startsWith("966") && digits.length >= 12) {
    digits = `0${digits.slice(3)}`;
  }
  if (/^5\d{8}$/.test(digits)) {
    digits = `0${digits}`;
  }
  return /^05\d{8}$/.test(digits);
}

function hasNonDigitChars(value, { allowPlus = false } = {}) {
  for (const char of String(value ?? "")) {
    const code = char.codePointAt(0);
    if (code >= 48 && code <= 57) continue;
    if (code >= 0x0660 && code <= 0x0669) continue;
    if (code >= 0x06f0 && code <= 0x06f9) continue;
    if (allowPlus && char === "+") continue;
    if (char === " " || char === "-") continue;
    return true;
  }
  return false;
}

export function getSaudiNationalIdError(value, { required = false } = {}) {
  const raw = String(value ?? "").trim();
  if (!raw) return required ? "رقم الهوية مطلوب" : null;

  if (hasNonDigitChars(raw)) {
    return SAUDI_NATIONAL_ID_DIGITS_ONLY_MESSAGE;
  }

  const digits = digitsOnly(raw);
  if (!digits || !/^[12]/.test(digits)) {
    return "رقم الهوية يجب أن يبدأ بـ 1 أو 2";
  }
  if (digits.length !== 10) {
    return "رقم الهوية يجب أن يكون 10 أرقام";
  }
  return null;
}

export function getSaudiMobileError(value, { required = false } = {}) {
  const raw = String(value ?? "").trim();
  if (!raw) return required ? "رقم الجوال مطلوب" : null;

  if (hasNonDigitChars(raw, { allowPlus: true })) {
    return SAUDI_PHONE_DIGITS_ONLY_MESSAGE;
  }

  if (!isSaudiMobile(raw)) {
    return SAUDI_PHONE_MESSAGE;
  }
  return null;
}

/** Validate a field value when its kind is national_id or phone. */
export function getSaudiContactFieldError(fieldOrKey, value, options) {
  const kind = getSaudiContactFieldKind(fieldOrKey);
  if (kind === "national_id") return getSaudiNationalIdError(value, options);
  if (kind === "phone") return getSaudiMobileError(value, options);
  return null;
}

/** Sanitize typed input: digits only, capped for national ID / phone. */
export function sanitizeSaudiContactInput(fieldOrKey, nextValue) {
  const kind = getSaudiContactFieldKind(fieldOrKey);
  if (!kind) return nextValue;

  let digits = digitsOnly(nextValue);
  if (kind === "national_id") {
    digits = digits.slice(0, 10);
  } else if (kind === "phone") {
    if (digits.startsWith("966")) digits = `0${digits.slice(3)}`;
    else if (/^5\d{0,8}$/.test(digits)) digits = `0${digits}`;
    digits = digits.slice(0, 10);
  }
  return digits;
}

/** Zod-friendly refine helpers (optional empty when not required). */
export function zodSaudiNationalId(z, { required = true } = {}) {
  let schema = z.string();
  if (!required) {
    return schema
      .optional()
      .refine((v) => !v || isSaudiNationalId(v), { message: SAUDI_NATIONAL_ID_MESSAGE });
  }
  return schema
    .min(1, "رقم الهوية مطلوب")
    .refine((v) => isSaudiNationalId(v), { message: SAUDI_NATIONAL_ID_MESSAGE });
}

export function zodSaudiMobile(z, { required = true } = {}) {
  let schema = z.string();
  if (!required) {
    return schema
      .optional()
      .refine((v) => !v || isSaudiMobile(v), { message: SAUDI_PHONE_MESSAGE });
  }
  return schema
    .min(1, "رقم الجوال مطلوب")
    .refine((v) => isSaudiMobile(v), { message: SAUDI_PHONE_MESSAGE });
}
