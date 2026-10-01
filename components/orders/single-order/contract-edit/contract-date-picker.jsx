"use client";

import { useMemo, useState } from "react";
import DatePicker from "react-multi-date-picker";
import arabic from "react-date-object/calendars/arabic";
import gregorian from "react-date-object/calendars/gregorian";
import { CalendarIcon } from "lucide-react";
import {
  DATE_FORMAT,
  formatContractDate,
  gregorianLocale,
  hijriLocale,
  normalizeDateInput,
  parseContractDate,
  storedDateFormat,
} from "./step-editor/date-calendar-utils";

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
  const normalized = normalizeDateInput(dateString);
  if (!normalized) return "gregorian";
  const parts = normalized.split("-").map((part) => Number(part));
  const year =
    storedDateFormat(normalized) === "YYYY-MM-DD" ? parts[0] : parts[parts.length - 1];
  if (!Number.isFinite(year)) return "gregorian";
  return year > 1700 ? "gregorian" : "hijri";
}

export function resolveCalendarType(typeValue, dateValue) {
  return normalizeCalendarType(typeValue) || inferCalendarTypeFromDate(dateValue);
}

function parseStoredDate(value, calendarType) {
  return parseContractDate(value, calendarType);
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
  const locale = isHijri ? hijriLocale : gregorianLocale;

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
          onChange(formatContractDate(next));
          setOpen(false);
        }}
        calendar={calendar}
        locale={locale}
        format={DATE_FORMAT}
        calendarPosition="bottom-right"
        containerClassName="w-full"
        inputClass="w-full h-12 bg-white dark:bg-white/[0.04] border border-surface-border dark:border-white/10 rounded-14 px-4 pe-11 text-sm text-right text-gray-900 dark:text-white focus:outline-none focus:border-brand-hover transition-all disabled:opacity-60"
        placeholder={isHijri ? "اختر تاريخ هجري" : "اختر تاريخ ميلادي"}
        disabled={disabled}
        editable={false}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
      />
      <CalendarIcon
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-placeholder"
        aria-hidden
      />
    </div>
  );
}
