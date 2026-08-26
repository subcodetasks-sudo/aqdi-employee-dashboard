"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import SystemSettingsHeader from "./SystemSettingsHeader";
import GeneralSettingsTab from "./GeneralSettingsTab";
import ContractSettingsTab from "./ContractSettingsTab";
import {
  CONTRACT_SUB_TAB_ALIASES,
  CONTRACT_SUB_TABS,
  PRIMARY_TABS,
} from "./mock-data";
import "./settings-design.css";

function resolveTab(raw) {
  return PRIMARY_TABS.some((tab) => tab.id === raw) ? raw : "general";
}

function resolveSub(raw) {
  const normalized = CONTRACT_SUB_TAB_ALIASES[raw] ?? raw;
  return CONTRACT_SUB_TABS.some((tab) => tab.id === normalized)
    ? normalized
    : "popup-contracts";
}

export default function SystemSettingsWrapper() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = resolveTab(searchParams.get("tab"));
  const contractSub = resolveSub(searchParams.get("sub"));

  const updateParams = (next) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value == null) params.delete(key);
      else params.set(key, value);
    });
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div
      className="set-page flex flex-col gap-4 min-h-full -m-[45px] p-[45px] max-[1700px]:-m-[30px] max-[1700px]:p-[30px] bg-[#F4F6F5] dark:bg-[#0B1411]"
      dir="rtl"
    >
      <SystemSettingsHeader activeTab={activeTab} />

      <div className="mkt-subtabs">
        {PRIMARY_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() =>
              updateParams({
                tab: tab.id,
                sub: tab.id === "contracts" ? contractSub : null,
              })
            }
            className={cn("mkt-subtab", activeTab === tab.id && "on")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "contracts" ? (
        <ContractSettingsTab
          activeSub={contractSub}
          onSubChange={(sub) => updateParams({ tab: "contracts", sub })}
        />
      ) : (
        <GeneralSettingsTab />
      )}
    </div>
  );
}
