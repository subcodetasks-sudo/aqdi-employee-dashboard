"use client";

import { useMemo, useState } from "react";
import DatePicker from "react-multi-date-picker";
import arabic from "react-date-object/calendars/arabic";
import gregorian from "react-date-object/calendars/gregorian";
import arabic_ar from "react-date-object/locales/arabic_ar";
import gregorian_ar from "react-date-object/locales/gregorian_ar";
import DateObject from "react-date-object";
import { CalendarIcon } from "lucide-react";

const DATE_FORMAT = "DD-MM-YYYY";

export function normalizeCalendarType(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (raw === "hijri" || raw === "هجري" || raw.includes("hijri")) return "hijri";
  if (raw === "gregorian" || raw === "ميلادي" || raw.includes("gregorian")) {
    return "gregorian";
  }
  return null;
}

/** Infer calendar when type is missing: Hijri years are typically < 1700. */
export function inferCalendarTypeFromDate(dateString) {
  if (!dateString) return "gregorian";
  const parts = String(dateString).match(/\d+/g);
  if (!parts?.length) return "gregorian";
  const year = Number(parts[parts.length - 1]);
  if (!Number.isFinite(year)) return "gregorian";
  return year > 1700 ? "gregorian" : "hijri";
}

export function resolveCalendarType(typeValue, dateValue) {
  return normalizeCalendarType(typeValue) || inferCalendarTypeFromDate(dateValue);
}

function parseStoredDate(value, calendarType) {
  if (!value) return null;
  const calendar = calendarType === "hijri" ? arabic : gregorian;
  const locale = calendarType === "hijri" ? arabic_ar : gregorian_ar;

  try {
    const parsed = new DateObject({
      date: String(value).trim(),
      format: DATE_FORMAT,
      calendar,
      locale,
    });
    if (parsed.isValid) return parsed;
  } catch {
    // fall through
  }

  try {
    const parsed = new DateObject({
      date: String(value).trim(),
      format: DATE_FORMAT,
      calendar: calendarType === "hijri" ? gregorian : arabic,
      locale: calendarType === "hijri" ? gregorian_ar : arabic_ar,
    });
    if (parsed.isValid) {
      return parsed.convert(calendar, locale);
    }
  } catch {
    // fall through
  }

  return null;
}

export default function ContractDatePicker({
  id,
  value,
  calendarType,
  onChange,
  disabled = false,
  className = "",
}) {
  const resolvedType = resolveCalendarType(calendarType, value);
  const isHijri = resolvedType === "hijri";
  const [open, setOpen] = useState(false);

  const calendar = isHijri ? arabic : gregorian;
  const locale = isHijri ? arabic_ar : gregorian_ar;

  const selected = useMemo(
    () => parseStoredDate(value, resolvedType),
    [value, resolvedType]
  );

  return (
    <div className={`relative w-full ${className}`}>
      <DatePicker
        key={resolvedType}
        id={id}
        value={selected}
        onChange={(date) => {
          if (!date) {
            onChange("");
            return;
          }
          const next = Array.isArray(date) ? date[0] : date;
          onChange(next?.format?.(DATE_FORMAT) || "");
          setOpen(false);
        }}
        calendar={calendar}
        locale={locale}
        format={DATE_FORMAT}
        calendarPosition="bottom-right"
        containerClassName="w-full"
        inputClass="w-full h-[48px] bg-white border border-[#EEEEEE] rounded-[14px] px-4 pe-11 text-[14px] text-right focus:outline-none focus:border-brand-hover transition-all disabled:opacity-60"
        placeholder={isHijri ? "اختر تاريخ هجري" : "اختر تاريخ ميلادي"}
        disabled={disabled}
        editable={false}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
      />
      <CalendarIcon
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#A3A3A3]"
        aria-hidden
      />
    </div>
  );
}
