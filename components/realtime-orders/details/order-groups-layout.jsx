"use client";

import DeedAddressGroup from "./order-groups/deed-address-group";
import TenantFinancialGroup from "./order-groups/tenant-financial-group";
import UnitsGroup from "./order-groups/units-group";
import StatusTimeline from "./order-groups/status-timeline";
import LeaseRenewalFeatures from "./order-groups/lease-renewal-features";

export default function OrderGroupsLayout({
  order,
  orderData,
  onEdit,
  isLeaseRenewal = false,
}) {
  return (
    <div className="space-y-4" dir="rtl">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <DeedAddressGroup order={order} onEdit={onEdit} />
        <TenantFinancialGroup order={order} onEdit={onEdit} />
        <UnitsGroup order={order} onEdit={onEdit} />
      </div>

      {isLeaseRenewal ? <LeaseRenewalFeatures orderData={orderData} /> : null}

      <StatusTimeline timeline={order?.status_timeline} />
    </div>
  );
}
