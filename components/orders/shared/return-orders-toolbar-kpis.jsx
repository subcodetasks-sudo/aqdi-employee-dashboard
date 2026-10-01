"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { countReturnOrdersByApproval } from "@/components/analysis/returned/refund-contract-utils";
import "./return-orders-design.css";

export { countReturnOrdersByApproval };

const KPI_ITEMS = [
  { key: "pending", label: "بانتظار الموافقة", tone: "rk-pend" },
  { key: "approved", label: "تمت الموافقة", tone: "rk-done" },
  { key: "rejected", label: "مرفوضة", tone: "rk-rej" },
];

export default function ReturnOrdersToolbarKpis({ rows = [], counts: countsProp, className }) {
  const derivedCounts = useMemo(() => countReturnOrdersByApproval(rows), [rows]);
  // Prefer explicit global counts; fall back to counting the current page.
  const counts = countsProp ?? derivedCounts;

  return (
    <div className={cn("radm-kpis", className)} id="radmKpis">
      {KPI_ITEMS.map((item) => (
        <div key={item.key} className={cn("rk", item.tone)}>
          <b>{counts[item.key] ?? 0}</b>
          {item.label}
        </div>
      ))}
    </div>
  );
}
