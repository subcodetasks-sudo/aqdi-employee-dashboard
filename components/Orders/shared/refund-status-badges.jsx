"use client";

import {
  getOrderAdminApprovalStatus,
  hasExistingReturnRequest,
  isAdminRefundApproved,
} from "@/components/analysis/returned/refund-contract-utils";

export function CustomerRefundBadge({ refunded }) {
  if (refunded === true || refunded === 1) {
    return (
      <span className="px-3 py-1 rounded text-11 font-bold whitespace-nowrap bg-[#E6FFE6] text-brand-accent">
        ✅ تم المــوافقة
      </span>
    );
  }
  if (refunded === false || refunded === 0) {
    return (
      <span className="px-3 py-1 rounded text-11 font-bold whitespace-nowrap bg-[#FFE6E6] text-[#EF4444]">
        ❌ لم تتم المــوافقة
      </span>
    );
  }
  return (
    <span className="px-3 py-1 rounded text-11 font-bold whitespace-nowrap bg-[#FFF7E6] text-[#D97706]">
      ⏳ بانتظار الاسترجاع
    </span>
  );
}

export function AdminApprovalCell({ row }) {
  if (!hasExistingReturnRequest(row) && row?.admin_confirmed == null) {
    return <span className="text-13 text-ink-placeholder">—</span>;
  }

  const approved = isAdminRefundApproved(getOrderAdminApprovalStatus(row));

  if (approved) {
    return (
      <span className="px-3 py-1 rounded text-11 font-bold whitespace-nowrap bg-[#E6FFE6] text-brand-accent">
        ✅ تم المــوافقة
      </span>
    );
  }

  return (
    <span className="px-3 py-1 rounded text-11 font-bold whitespace-nowrap bg-[#FFE6E6] text-[#EF4444]">
      ❌ لم تتم المــوافقة
    </span>
  );
}
