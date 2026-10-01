import DateObject from "react-date-object";
import arabic from "react-date-object/calendars/arabic";
import gregorian from "react-date-object/calendars/gregorian";
import arabic_ar from "react-date-object/locales/arabic_ar";
import gregorian_ar from "react-date-object/locales/gregorian_ar";

export const DATE_FORMAT = "DD-MM-YYYY";
const ISO_DATE_FORMAT = "YYYY-MM-DD";

const LATIN_DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

/** Arabic month names, Latin digits so years are not stored or shown as Eastern digits. */
export const gregorianLocale = { ...gregorian_ar, digits: LATIN_DIGITS };
export const hijriLocale = { ...arabic_ar, digits: LATIN_DIGITS };

export const CALENDAR_TYPE_TO_DATE_KEYS = {
  type_dob_property_owner: ["property_owner_dob"],
  type_dob_property_owner_agent: ["dob_of_property_owner_agent"],
  type_tenant_dob: ["tenant_dob"],
  type_dob_tenant_agent: ["dob_of_property_tenant_agent"],
  type_contract_starting_date: ["contract_starting_date"],
  type_instrument_history: ["instrument_history"],
  type_date_first_registration: ["date_first_registration"],
};

const EASTERN_DIGITS = "٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹";

export function toLatinDigits(value) {
  return String(value ?? "").replace(/[٠-٩۰-۹]/g, (char) => {
    const index = EASTERN_DIGITS.indexOf(char) % 10;
    return index >= 0 ? String(index) : char;
  });
}

/** Date portion only, Latin digits, hyphen separators. */
export function normalizeDateInput(value) {
  const text = toLatinDigits(value).trim();
  if (!text) return "";
  const datePart = text.split(/[T ]/)[0];
  return datePart.replace(/[/.]/g, "-");
}

/** API dates are `YYYY-MM-DD`; the picker also accepts `DD-MM-YYYY`. */
export function storedDateFormat(value) {
  const normalized = normalizeDateInput(value);
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(normalized)) return ISO_DATE_FORMAT;
  return DATE_FORMAT;
}

export function calendarParts(calendarType) {
  if (calendarType === "hijri") return { calendar: arabic, locale: hijriLocale };
  return { calendar: gregorian, locale: gregorianLocale };
}

export function parseContractDate(value, calendarType) {
  const normalized = normalizeDateInput(value);
  if (!normalized) return null;

  const format = storedDateFormat(normalized);
  const primary = calendarParts(calendarType);
  const parsed = tryParse(normalized, format, primary.calendar, primary.locale);
  if (parsed) return parsed;

  // A leading 4-digit year is already dated; retrying as DD-MM-YYYY yields a fake year.
  if (format === ISO_DATE_FORMAT) return null;

  const oppositeType = calendarType === "hijri" ? "gregorian" : "hijri";
  const opposite = calendarParts(oppositeType);
  const swapped = tryParse(normalized, format, opposite.calendar, opposite.locale);
  if (!swapped) return null;
  return swapped.convert(primary.calendar, primary.locale);
}

export function formatContractDate(date) {
  if (!date?.format) return "";
  return toLatinDigits(date.format(DATE_FORMAT));
}

function tryParse(date, format, calendar, locale) {
  try {
    const parsed = new DateObject({ date, format, calendar, locale });
    if (parsed.isValid) return parsed;
  } catch {
    // fall through
  }
  return null;
}

export function convertDateBetweenCalendars(dateString, fromType, toType) {
  if (!dateString || fromType === toType) return dateString;
  try {
    const parsed = parseContractDate(dateString, fromType);
    if (!parsed) return dateString;
    const target = calendarParts(toType);
    return formatContractDate(parsed.convert(target.calendar, target.locale));
  } catch {
    return dateString;
  }
}
