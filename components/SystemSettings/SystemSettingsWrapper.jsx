"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import SystemSettingsHeader from "./SystemSettingsHeader";
import GeneralSettingsTab from "./GeneralSettingsTab";
import ContractSettingsTab from "./ContractSettingsTab";
import { CONTRACT_SUB_TABS, PRIMARY_TABS } from "./mock-data";

function resolveTab(raw) {
  return PRIMARY_TABS.some((tab) => tab.id === raw) ? raw : "general";
}

function resolveSub(raw) {
  return CONTRACT_SUB_TABS.some((tab) => tab.id === raw) ? raw : "guidance";
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
    <div className="flex flex-col gap-6 min-h-full" dir="rtl">
      <SystemSettingsHeader activeTab={activeTab} />

      <div className="flex flex-wrap gap-2">
        {PRIMARY_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => updateParams({ tab: tab.id, sub: tab.id === "contracts" ? contractSub : null })}
            className={cn(
              "h-11 px-6 rounded-xl text-[14px] font-bold transition-all shrink-0",
              activeTab === tab.id
                ? "bg-[#054D44] text-white shadow-sm"
                : "bg-white text-[#111827] border border-[#E6EBE9] hover:border-[#054D44]/30 dark:bg-[#13241C] dark:text-white dark:border-white/10"
            )}
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
