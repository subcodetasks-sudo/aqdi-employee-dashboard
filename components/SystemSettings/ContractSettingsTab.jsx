"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import PopupContractsTab from "@/components/contract-settings/popup-contracts/popup-contracts-tab";
import InstrumentTypesTab from "@/components/contract-settings/instrument-types/instrument-types-tab";
import SmsSettingsTab from "@/components/contract-settings/sms-settings/sms-settings-tab";
import MeterFeeSettingsTab from "@/components/contract-settings/meter-fees/meter-fee-settings-tab";
import PaymentMessagesTab from "@/components/contract-settings/payment-messages/payment-messages-tab";
import { usePermissions } from "@/src/hooks/usePermissions";
import { PERMISSION_SECTIONS } from "@/src/lib/permissions";
import { CONTRACT_SUB_TABS } from "./mock-data";

const SUB_TAB_PANELS = {
  "popup-contracts": PopupContractsTab,
  "instrument-types": InstrumentTypesTab,
  "sms-settings": SmsSettingsTab,
  "meter-fees": MeterFeeSettingsTab,
  "payment-messages": PaymentMessagesTab,
};

export default function ContractSettingsTab({ activeSub, onSubChange }) {
  const { can, isReady } = usePermissions();

  const visibleSubTabs = useMemo(
    () =>
      CONTRACT_SUB_TABS.filter(
        (tab) => isReady && can(tab.section ?? PERMISSION_SECTIONS.settings, "view")
      ),
    [can, isReady]
  );

  const currentSub = visibleSubTabs.some((tab) => tab.id === activeSub)
    ? activeSub
    : visibleSubTabs[0]?.id;
  const Panel = SUB_TAB_PANELS[currentSub] ?? PopupContractsTab;

  return (
    <div className="flex flex-col gap-4">
      <div className="mkt-subtabs">
        {visibleSubTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSubChange(tab.id)}
            className={cn("mkt-subtab", currentSub === tab.id && "on")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {currentSub ? <Panel /> : null}
    </div>
  );
}
