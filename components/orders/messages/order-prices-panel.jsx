"use client";

import { Copy, ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useContractPeriods } from "@/src/hooks/use-contract-periods";
import {
  formatContractPeriodPrice,
  getContractPeriodLabel,
} from "@/src/lib/contract-period-utils";

const columnsWrapClass = "flex flex-row items-start gap-3";

const columnClass =
  "bg-[#F3F3F3] rounded-20 p-2 min-w-[min(280px,calc(50vw-32px))] max-w-[min(320px,calc(50vw-24px))] max-h-[min(70vh,480px)] overflow-y-auto";

const rowClass =
  "flex items-center gap-2.5 w-full rounded-14 px-2.5 py-3 text-right transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-main/30";

function getRowIconClass(name = "") {
  const text = String(name);
  if (text.includes("وقف")) return "fa-landmark";
  if (text.includes("ورقي") || text.includes("ورث")) return "fa-file-lines";
  if (text.includes("تجار") || text.toLowerCase().includes("commercial")) {
    return "fa-building";
  }
  return "fa-house";
}

function PriceRowIcon({ name }) {
  return (
    <span className="w-8 h-8 rounded-[10px] bg-white border border-[#E8E8E8] flex items-center justify-center shrink-0 text-[#333]">
      <i className={`fa-solid ${getRowIconClass(name)} text-13`} aria-hidden />
    </span>
  );
}

function copyPeriod(period) {
  const label = getContractPeriodLabel(period);
  const price = formatContractPeriodPrice(period?.price);
  const text = price ? `المدة: ${label}\nالسعر: ${price}` : `المدة: ${label}`;
  navigator.clipboard.writeText(text);
  toast.success("تم نسخ البيانات");
}

function PriceRow({ period, sectionName }) {
  const label = getContractPeriodLabel(period);
  const price = formatContractPeriodPrice(period?.price) || "—";

  return (
    <button
      type="button"
      className={rowClass}
      onClick={(e) => {
        e.stopPropagation();
        copyPeriod(period);
      }}
    >
      <PriceRowIcon name={sectionName} />
      <span className="flex-1 min-w-0">
        <span className="block text-13 font-semibold text-[#1A1A1A] leading-snug truncate">
          {label}
        </span>
        <span className="block text-11 font-bold text-brand-main mt-0.5">{price}</span>
      </span>
      <Copy className="size-3.5 shrink-0 text-[#C4C4C4]" strokeWidth={2} />
      <ChevronLeft className="size-3.5 shrink-0 text-[#C4C4C4]" strokeWidth={2} />
    </button>
  );
}

function PricesContractColumn({ group }) {
  const hasItems = group.sections.some((section) => section.items.length > 0);

  return (
    <div className={columnClass}>
      <p className="text-13 font-bold text-[#1A1A1A] px-2.5 py-2 mb-1">{group.name}</p>
      {!hasItems ? (
        <p className="text-xs text-ink-placeholder text-center py-6">لا توجد أسعار</p>
      ) : (
        group.sections.flatMap((section) =>
          section.items.map((period) => (
            <PriceRow key={period.id} period={period} sectionName={section.name} />
          ))
        )
      )}
    </div>
  );
}

export default function OrderPricesPanel({ enabled = true }) {
  const { groups, isLoading } = useContractPeriods(enabled);

  if (isLoading) {
    return (
      <div className={`${columnClass} flex items-center justify-center py-12`}>
        <Loader2 className="size-6 animate-spin text-ink-placeholder" />
      </div>
    );
  }

  return (
    <div className={columnsWrapClass}>
      {groups.map((group) => (
        <PricesContractColumn key={group.id} group={group} />
      ))}
    </div>
  );
}
