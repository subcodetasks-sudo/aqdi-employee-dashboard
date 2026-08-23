"use client";

import { cn } from "@/lib/utils";
import PopupContractsTab from "@/components/contract-settings/popup-contracts/popup-contracts-tab";
import InstrumentTypesTab from "@/components/contract-settings/instrument-types/instrument-types-tab";
import SmsSettingsTab from "@/components/contract-settings/sms-settings/sms-settings-tab";
import MeterFeeSettingsTab from "@/components/contract-settings/meter-fees/meter-fee-settings-tab";
import PaymentMessagesTab from "@/components/contract-settings/payment-messages/payment-messages-tab";
import {
  CONTRACT_SUB_TABS,
} from "./mock-data";

const SUB_TAB_PANELS = {
  "popup-contracts": PopupContractsTab,
  "instrument-types": InstrumentTypesTab,
  "sms-settings": SmsSettingsTab,
  "meter-fees": MeterFeeSettingsTab,
  "payment-messages": PaymentMessagesTab,
};

export default function ContractSettingsTab({ activeSub, onSubChange }) {
  const Panel = SUB_TAB_PANELS[activeSub] ?? PopupContractsTab;

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
