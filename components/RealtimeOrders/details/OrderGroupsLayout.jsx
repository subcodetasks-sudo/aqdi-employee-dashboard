"use client";

import DeedAddressGroup from "./order-groups/DeedAddressGroup";
import TenantFinancialGroup from "./order-groups/TenantFinancialGroup";
import UnitsGroup from "./order-groups/UnitsGroup";

export default function OrderGroupsLayout({ order, onEdit }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4" dir="rtl">
      <DeedAddressGroup order={order} onEdit={onEdit} />
      <TenantFinancialGroup order={order} onEdit={onEdit} />
      <UnitsGroup order={order} onEdit={onEdit} />
    </div>
  );
}
