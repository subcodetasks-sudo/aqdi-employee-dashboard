import DateObject from "react-date-object";
import arabic from "react-date-object/calendars/arabic";
import gregorian from "react-date-object/calendars/gregorian";
import arabic_ar from "react-date-object/locales/arabic_ar";
import gregorian_ar from "react-date-object/locales/gregorian_ar";

export const DATE_FORMAT = "DD-MM-YYYY";

export const CALENDAR_TYPE_TO_DATE_KEYS = {
  type_dob_property_owner: ["property_owner_dob"],
  type_dob_property_owner_agent: ["dob_of_property_owner_agent"],
  type_tenant_dob: ["tenant_dob"],
  type_dob_tenant_agent: ["dob_of_property_tenant_agent"],
  type_contract_starting_date: ["contract_starting_date"],
};

export function convertDateBetweenCalendars(dateString, fromType, toType) {
  if (!dateString || fromType === toType) return dateString;
  try {
    const fromCalendar = fromType === "hijri" ? arabic : gregorian;
    const fromLocale = fromType === "hijri" ? arabic_ar : gregorian_ar;
    const toCalendar = toType === "hijri" ? arabic : gregorian;
    const toLocale = toType === "hijri" ? arabic_ar : gregorian_ar;
    const parsed = new DateObject({
      date: String(dateString).trim(),
      format: DATE_FORMAT,
      calendar: fromCalendar,
      locale: fromLocale,
    });
    if (!parsed.isValid) return dateString;
    return parsed.convert(toCalendar, toLocale).format(DATE_FORMAT);
  } catch {
    return dateString;
  }
}
