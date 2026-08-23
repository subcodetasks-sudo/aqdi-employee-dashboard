"use client";

import NewRequestsStrip from "./NewRequestsStrip";
import NewRequestsDialog from "./NewRequestsDialog";
import { getWaitingMinutes } from "./map-realtime-order";

/**
 * New requests strip + full dialog on "عرض المزيد".
 */
export default function NewRequestsSection({
  orders = [],
  totalCount,
  summary,
  expanded,
  onExpandedChange,
  onReceive,
  receivingId,
  canReceive = true,
  autoRefresh = true,
  onAutoRefreshChange,
  previewCount = 7,
  dark = false,
  isLoading = false,
}) {
  const total = summary?.total_new_orders ?? totalCount ?? orders.length;
  const over15 =
    summary?.exceeded_15_minutes ??
    orders.filter((o) => getWaitingMinutes(o) >= 15).length;
  const over30 =
    summary?.exceeded_30_minutes ??
    orders.filter((o) => getWaitingMinutes(o) >= 30).length;
  const preview = orders.slice(0, previewCount);
  const cards = Array.isArray(summary?.cards) && summary.cards.length > 0
    ? summary.cards
    : [
        {
          key: "total_new_orders",
          label: summary?.total_new_orders_label || "إجمالي الطلبات الجديدة",
          count: total,
        },
        {
          key: "exceeded_15_minutes",
          label: summary?.exceeded_15_minutes_label || "تجاوزت 15 دقيقة",
          count: over15,
        },
        {
          key: "exceeded_30_minutes",
          label: summary?.exceeded_30_minutes_label || "تجاوزت 30 دقيقة",
          count: over30,
        },
      ];

  return (
    <>
      <NewRequestsStrip
        preview={preview}
        total={total}
        onExpand={() => onExpandedChange?.(true)}
        onReceive={onReceive}
        receivingId={receivingId}
        canReceive={canReceive}
        previewCount={previewCount}
        dark={dark}
        isLoading={isLoading}
      />

      <NewRequestsDialog
        open={expanded}
        onOpenChange={onExpandedChange}
        orders={orders}
        total={total}
        cards={cards}
        onReceive={onReceive}
        receivingId={receivingId}
        canReceive={canReceive}
        autoRefresh={autoRefresh}
        onAutoRefreshChange={onAutoRefreshChange}
        dark={dark}
        isLoading={isLoading}
      />
    </>
  );
}
