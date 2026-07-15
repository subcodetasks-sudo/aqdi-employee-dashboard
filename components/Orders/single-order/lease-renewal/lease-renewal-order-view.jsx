"use client";

import { useState } from "react";
import { toast } from "sonner";
import LeaseRenewalHeader from "./lease-renewal-header";
import LeaseRenewalRenewTab from "./lease-renewal-renew-tab";
import LeaseRenewalFinancialTab from "./lease-renewal-financial-tab";

export default function LeaseRenewalOrderView({ orderData }) {
  const [activeTab, setActiveTab] = useState("renew");

  const copyText = (value, msg) => {
    if (!value) return;
    navigator.clipboard.writeText(String(value));
    toast.success(msg);
  };

  return (
    <div dir="rtl" className="flex flex-col gap-4 w-full min-w-0">
      <LeaseRenewalHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        orderData={orderData}
        onCopy={copyText}
      />

      {activeTab === "renew" ? (
        <LeaseRenewalRenewTab orderData={orderData} />
      ) : (
        <LeaseRenewalFinancialTab orderData={orderData} />
      )}
    </div>
  );
}
