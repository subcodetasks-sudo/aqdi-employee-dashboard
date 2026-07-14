"use client";

import Image from "next/image";
import waIcon from "@/public/images/waIcon.svg";

const getStatusEmoji = (name = "") => {
  if (name.includes("واتساب") && (name.includes("غير") || name.includes("غير مكتمل"))) return "⛔";
  if (name.includes("أخرى")) return "🤔";
  if (name.includes("معالجة")) return "🤔";
  if (name.includes("تأكيد") && name.includes("عقار")) return "⏳";
  if (name.includes("إجراء") && name.includes("عميل")) return null;
  if (name.includes("عميل") && !name.includes("تأكيد")) return null;
  if (name.includes("تم تأكيد")) return "🏡";
  if (name.includes("اعتماد")) return "🥳";
  if (name.includes("جديد")) return "🆕";
  if (name.includes("استرجاع") || name.includes("مسترج")) return "↩️";
  if (name.includes("ملغ")) return "❌";
  return "🤔";
};

const usesWhatsAppIcon = (name = "") =>
  name.includes("إجراء") && name.includes("عميل");

const getActionLabel = (name = "") => {
  if (name.includes("واتساب") && (name.includes("غير") || name.includes("غير مكتمل"))) {
    return "عرض";
  }
  return "تصفية";
};

const isViewAction = (label) => label === "عرض";

const formatCount = (count) => {
  if (count == null || count === "") return "00";
  const num = Number(count);
  if (Number.isNaN(num)) return "00";
  if (num > 99) return String(num);
  return String(num).padStart(2, "0");
};

function parseHexColor(value = "") {
  const hex = String(value).trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    return {
      r: parseInt(hex[0] + hex[0], 16),
      g: parseInt(hex[1] + hex[1], 16),
      b: parseInt(hex[2] + hex[2], 16),
    };
  }
  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }
  return null;
}

function getRelativeLuminance({ r, g, b }) {
  const toLinear = (channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function isDarkColor(value = "") {
  const rgb = parseHexColor(value);
  if (!rgb) {
    const normalized = String(value).trim().toLowerCase();
    return (
      normalized === "black" ||
      normalized === "#000" ||
      normalized === "#000000" ||
      normalized === "rgb(0,0,0)" ||
      normalized === "rgb(0, 0, 0)"
    );
  }
  return getRelativeLuminance(rgb) < 0.45;
}

function getActiveStatusTextColor(backgroundColor, textColor) {
  if (isDarkColor(backgroundColor)) return "#FFFFFF";
  return textColor || "#111111";
}

function StatusIcon({ name }) {
  if (usesWhatsAppIcon(name)) {
    return (
      <Image src={waIcon} alt="" width={22} height={22} className="w-[22px] h-[22px] object-contain" />
    );
  }

  const emoji = getStatusEmoji(name);
  return <span className="text-[22px] leading-none">{emoji}</span>;
}

function StatusCard({ item, count, isActive, onClick }) {
  const statusColor = item?.color;
  const statusTextColor = getActiveStatusTextColor(
    statusColor,
    item?.color_text
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full p-4 flex flex-col text-right transition-all border-2 ${
        isActive
          ? "shadow-md"
          : "hover:shadow-md border-transparent"
      } ${!statusColor ? (isActive ? "bg-brand-main text-white border-brand-main" : "bg-[#F5F5F5] border-transparent text-black") : ""}`}
      style={
        statusColor
          ? {
              backgroundColor: statusColor,
              color: statusTextColor,
              borderColor: isActive ? statusTextColor : "transparent",
            }
          : undefined
      }
    >
      <p className="font-bold leading-snug">
        {item.name} ({formatCount(count)})
      </p>
    </button>
  );
}

export default function OrdersStatusCards({
  statusItems = [],
  activeFilter,
  onFilterChange,
  showAllCard = false,
  allTotal = 0,
  countsById = {},
  gridClassName = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3",
}) {
  return (
    <div className={gridClassName}>
      {showAllCard && (
        <StatusCard
          item={{ name: "الكل" }}
          count={allTotal}
          isActive={activeFilter === ""}
          onClick={() => onFilterChange("")}
        />
      )}

      {statusItems?.map((item) => {
        const isActive = String(activeFilter) === String(item.id);
        const count =
          countsById[item.id] ??
          item.orders_count ??
          item.count ??
          item.total ??
          item.contracts_count ??
          0;

        return (
          <StatusCard
            key={item.id}
            item={item}
            count={count}
            isActive={isActive}
            onClick={() => onFilterChange(item.id)}
          />
        );
      })}
    </div>
  );
}
