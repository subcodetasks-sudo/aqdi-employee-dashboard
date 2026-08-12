"use client";

import { cn } from "@/lib/utils";
import { CONTRACT_SUB_TABS } from "./mock-data";
import GuidanceContentTab from "./tabs/GuidanceContentTab";
import InstrumentTypesTab from "./tabs/InstrumentTypesTab";
import SmsSettingsTab from "./tabs/SmsSettingsTab";
import MeterFeesTab from "./tabs/MeterFeesTab";
import PaymentMessagesTab from "./tabs/PaymentMessagesTab";

const SUB_TAB_PANELS = {
  guidance: GuidanceContentTab,
  "instrument-types": InstrumentTypesTab,
  sms: SmsSettingsTab,
  "meter-fees": MeterFeesTab,
  "payment-messages": PaymentMessagesTab,
};

export default function ContractSettingsTab({ activeSub, onSubChange }) {
  const Panel = SUB_TAB_PANELS[activeSub] ?? GuidanceContentTab;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        {CONTRACT_SUB_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSubChange(tab.id)}
            className={cn(
              "h-10 px-4 rounded-xl text-[13px] font-bold transition-all shrink-0",
              activeSub === tab.id
                ? "bg-[#054D44] text-white shadow-sm"
                : "bg-white text-[#374151] border border-[#E6EBE9] hover:border-[#054D44]/30 dark:bg-[#13241C] dark:text-white/70 dark:border-white/10"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Panel />
    </div>
  );
}
