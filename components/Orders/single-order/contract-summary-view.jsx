"use client";

export const SECTION_ERROR_BUTTON_CLASS =
  "text-xs px-4 py-3 bg-pink-100 text-pink-600 hover:bg-pink-200 rounded-full gap-2 h-auto font-semibold shrink-0 flex items-center";

const EMPTY_PLACEHOLDERS = new Set([
  "",
  "—",
  "--",
  "---",
  "لا يوجد",
  "null",
  "undefined",
]);

export function isEmptyDisplayValue(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" && EMPTY_PLACEHOLDERS.has(value.trim())) return true;
  return false;
}

export function formatDisplayValue(value, emptyFallback = "—") {
  if (isEmptyDisplayValue(value)) return emptyFallback;
  return String(value);
}

export function SummaryInfoItem({ value, label, onCopy }) {
  const empty = isEmptyDisplayValue(value);
  const display = empty ? "—" : value;
  const canCopy = !empty;

  return (
    <div className={empty ? "opacity-45" : undefined}>
      <p
        role={canCopy ? "button" : undefined}
        tabIndex={canCopy ? 0 : undefined}
        onClick={canCopy ? () => onCopy?.(value) : undefined}
        onKeyDown={
          canCopy
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") onCopy?.(value);
              }
            : undefined
        }
        className={`flex items-center gap-1.5 text-[15px] font-bold leading-snug ${
          empty ? "text-[#A3A3A3]" : "text-black"
        } ${canCopy ? "cursor-pointer hover:text-brand-hover" : ""}`}
      >
        <span dir={label?.includes("جوال") || label?.includes("هوية") ? "ltr" : "rtl"}>
          {display}
        </span>
        {canCopy ? (
          <i className="fa-regular fa-copy text-[14px] text-[#A3A3A3] shrink-0" aria-hidden />
        ) : null}
      </p>
      <p className="text-[12px] text-[#A3A3A3] mt-1.5">{label}</p>
    </div>
  );
}

export function SummaryFieldsLayout({ children, errorMenu }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <div className="flex-1 min-w-0">{children}</div>
      {errorMenu ? <div className="shrink-0 pt-1">{errorMenu}</div> : null}
    </div>
  );
}
