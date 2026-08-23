"use client";

import { ChevronLeft, Plus } from "lucide-react";
import NewRequestCard from "./NewRequestCard";
import { RT, RT_SIZES } from "./theme";

/**
 * Collapsed strip — always visible on the page — with an entry point into
 * the full "عرض المزيد" dialog.
 */
export default function NewRequestsStrip({
  preview,
  total,
  onExpand,
  onReceive,
  receivingId,
  canReceive,
  previewCount,
  dark,
  isLoading,
}) {
  return (
    <section
      className="border p-2 sm:p-3 space-y-4"
      style={{
        borderRadius: RT_SIZES.stripRadius,
        borderColor: dark ? RT.borderDark : RT.stripBorder,
        background: dark
          ? RT.cardDarkAlt
          : `linear-gradient(to left, ${RT.stripBgFrom}, ${RT.stripBgTo})`,
      }}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="size-8 rounded-full flex items-center justify-center shrink-0 text-white shadow-sm"
            style={{ backgroundColor: RT.brand }}
          >
            <Plus className="size-4" strokeWidth={2.75} />
          </span>
          <h2
            className="font-black truncate"
            style={{
              fontSize: RT_SIZES.fontHeading,
              color: dark ? RT.white : RT.brand,
            }}
          >
            طلبات جديدة
            <span
              className="mx-1.5 font-bold"
              style={{ color: dark ? RT.whiteMuted40 : RT.mutedGray }}
            >
              –
            </span>
            <span
              className="font-bold"
              style={{
                color: dark ? RT.whiteMuted70 : RT.textSecondary,
              }}
            >
              {total} طلب
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span
            className="font-bold hidden sm:inline"
            style={{
              fontSize: RT_SIZES.fontLabel,
              color: dark ? RT.whiteMuted55 : RT.textSecondary,
            }}
          >
            إجمالي الطلبات : {total}
          </span>
          <button
            type="button"
            onClick={onExpand}
            className="h-9 px-3.5 rounded-full font-bold text-white flex items-center gap-1 shrink-0 transition-colors hover:brightness-110"
            style={{ backgroundColor: RT.brand, fontSize: RT_SIZES.fontLabel }}
          >
            عرض المزيد
            <ChevronLeft className="size-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div
        className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1"
        style={{ scrollbarWidth: "thin" }}
      >
        {isLoading ? (
          Array.from({ length: previewCount }).map((_, index) => (
            <div
              key={`new-order-skeleton-${index}`}
              className="rounded-xl border shrink-0 animate-pulse"
              style={{
                minWidth: RT_SIZES.cardMinWidth,
                height: RT_SIZES.cardSkeletonHeight,
                backgroundColor: dark ? RT.cardDark : RT.white,
                borderColor: dark ? RT.borderDark : RT.cardBorder,
              }}
            />
          ))
        ) : preview.length === 0 ? (
          <p
            className="w-full py-6 text-center font-medium"
            style={{
              fontSize: RT_SIZES.fontEmpty,
              color: dark ? RT.whiteMuted40 : RT.mutedGray,
            }}
          >
            لا توجد طلبات جديدة بانتظار الاستلام
          </p>
        ) : (
          preview.map((order) => (
            <NewRequestCard
              key={order.id}
              order={order}
              onReceive={canReceive ? onReceive : undefined}
              receiving={receivingId != null && receivingId === order.id}
              dark={dark}
            />
          ))
        )}
      </div>
    </section>
  );
}
