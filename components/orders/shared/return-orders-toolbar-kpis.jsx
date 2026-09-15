"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  getOrderAdminApprovalStatus,
  isAdminRefundApproved,
} from "@/components/analysis/returned/refund-contract-utils";
import "./return-orders-design.css";

export function countReturnOrdersByApproval(rows = []) {
  let pending = 0;
  let processing = 0;
  let completed = 0;
  let rejected = 0;

  rows.forEach((row) => {
    const status = getOrderAdminApprovalStatus(row);
    const customerRefunded =
      row?.customer_refunded ?? row?.is_refunded ?? row?.refunded;

    if (isAdminRefundApproved(status)) {
      if (customerRefunded === true || customerRefunded === 1) {
        completed += 1;
      } else {
        processing += 1;
      }
      return;
    }

    if (status === false || status === 0) {
      rejected += 1;
      return;
    }

    pending += 1;
  });

  return { pending, processing, completed, rejected };
}

const KPI_ITEMS = [
  { key: "pending", label: "بانتظار الموافقة", tone: "rk-pend" },
  { key: "processing", label: "قيد المعالجة", tone: "rk-proc" },
  { key: "completed", label: "تم الاسترجاع", tone: "rk-done" },
  { key: "rejected", label: "مرفوضة", tone: "rk-rej" },
];

export default function ReturnOrdersToolbarKpis({ rows = [], counts: countsProp, className }) {
  const derivedCounts = useMemo(() => countReturnOrdersByApproval(rows), [rows]);
  // Prefer the global summary counts; fall back to counting the current page.
  const counts = countsProp ?? derivedCounts;

  return (
    <div className={cn("radm-kpis", className)} id="radmKpis">
      {KPI_ITEMS.map((item) => (
        <div key={item.key} className={cn("rk", item.tone)}>
          <b>{counts[item.key]}</b>
          {item.label}
        </div>
      ))}
    </div>
  );
}
