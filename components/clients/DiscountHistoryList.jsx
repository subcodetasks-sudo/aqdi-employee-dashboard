"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatDiscountValue,
  getAppliesToLabel,
  isCouponActive,
  sortCouponsForDisplay,
} from "@/src/hooks/use-client-discount";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-GB").replace(/\//g, "-");
}

function HistoryRow({ coupon, onDeactivate, isDeactivating }) {
  const active = isCouponActive(coupon);

  return (
    <tr className="border-b border-gray-100 dark:border-white/5 last:border-0">
      <td className="px-3 py-3 text-13 font-bold text-gray-900 dark:text-white tabular-nums whitespace-nowrap">
        {formatDiscountValue(coupon)}
      </td>
      <td className="px-3 py-3 text-13 font-medium text-gray-700 dark:text-white/70 whitespace-nowrap">
        {getAppliesToLabel(coupon)}
      </td>
      <td className="px-3 py-3 text-13 font-medium text-gray-700 dark:text-white/70">
        {coupon.reason || "—"}
      </td>
      <td className="px-3 py-3 text-13 font-medium text-gray-700 dark:text-white/70 tabular-nums whitespace-nowrap">
        {formatDate(coupon.created_at)}
      </td>
      <td className="px-3 py-3 text-13 font-medium text-gray-700 dark:text-white/70 tabular-nums whitespace-nowrap">
        {formatDate(coupon.expires_at)}
      </td>
      <td className="px-3 py-3 whitespace-nowrap">
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-md text-11 font-bold",
            active
              ? "bg-green-100 text-green-700 dark:bg-emerald-500/20 dark:text-emerald-300"
              : "bg-gray-100 text-gray-500 dark:bg-white/[0.06] dark:text-white/50"
          )}
        >
          {active ? "فعال" : "غير فعال"}
        </span>
      </td>
      <td className="px-3 py-3 whitespace-nowrap">
        {active ? (
          <button
            type="button"
            onClick={() => onDeactivate(coupon.id)}
            disabled={isDeactivating}
            className="text-xs font-bold text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-rose-300 dark:hover:text-rose-200"
          >
            إلغاء
          </button>
        ) : null}
      </td>
    </tr>
  );
}

export default function DiscountHistoryList({ coupons, onDeactivate, isDeactivating, isLoading }) {
  const rows = sortCouponsForDisplay(coupons);

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-panel-head dark:bg-white/[0.03]">
            {["القيمة", "ينطبق على", "السبب", "تاريخ الإنشاء", "ساري حتى", "الحالة", ""].map((h) => (
              <th
                key={h || "actions"}
                className="px-3 py-2.5 text-xs font-semibold text-gray-400 dark:text-white/45 text-right whitespace-nowrap border-b border-panel-divider dark:border-white/[0.08]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={7} className="px-3 py-10 text-center">
                <Loader2 className="mx-auto size-5 animate-spin text-brand-dark dark:text-emerald-300" />
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-3 py-10 text-center text-13 text-gray-400 dark:text-white/40">
                لا توجد خصومات مسجّلة لهذا العميل
              </td>
            </tr>
          ) : (
            rows.map((coupon) => (
              <HistoryRow
                key={coupon.id}
                coupon={coupon}
                onDeactivate={onDeactivate}
                isDeactivating={isDeactivating}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
