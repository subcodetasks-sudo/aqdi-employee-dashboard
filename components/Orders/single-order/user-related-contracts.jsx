"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRelatedContractOrigin } from "./use-related-contract-origin";

function getCurrentContractId(orderData) {
  return orderData?.id ?? orderData?.contract_summary?.id ?? null;
}

const buttonBase =
  "relative inline-flex items-center justify-center min-w-[96px] px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all shrink-0";

export default function UserRelatedContracts({ orderData }) {
  const contracts = Array.isArray(orderData?.user_contracts)
    ? orderData.user_contracts
    : [];
  const currentContractId = getCurrentContractId(orderData);
  const originContractId = useRelatedContractOrigin(orderData);

  if (!contracts.length) return null;

  const isViewingOrigin =
    originContractId != null &&
    currentContractId != null &&
    String(originContractId) === String(currentContractId);

  const originContract = contracts.find(
    (contract) => String(contract?.id) === String(originContractId)
  );

  const getButtonClass = (contractId) => {
    const id = String(contractId);
    const isCurrent =
      currentContractId != null && id === String(currentContractId);
    const isOrigin =
      originContractId != null && id === String(originContractId);

    if (isOrigin) {
      return `${buttonBase} bg-[#0D6B6B] text-white border-[#0D6B6B] hover:bg-[#0B5C5C]`;
    }

    if (isCurrent) {
      return `${buttonBase} bg-white border-primary text-primary ring-2 ring-primary/25 pointer-events-none`;
    }

    return `${buttonBase} bg-white border-[#E4E4E4] text-black hover:border-primary hover:text-primary`;
  };

  return (
    <div className="border-t border-[#E8E8E8] pt-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13px] font-bold text-[#4D4D4D]">عقود مرتبطة</p>
        {!isViewingOrigin && originContractId ? (
          <Link
            href={`/home/orders/${originContractId}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#E6F4F4] px-3 py-1.5 text-xs font-bold text-[#0D6B6B] transition-colors hover:bg-[#D4ECEC]"
          >
            <ArrowLeft className="size-3.5" />
            العودة للعقد الأساسي
            {originContract?.uuid ? (
              <span dir="ltr" className="font-mono">
                ({originContract.uuid})
              </span>
            ) : null}
          </Link>
        ) : null}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {contracts.map((contract) => {
          const contractId = contract?.id;
          const contractUuid = contract?.uuid || "—";
          const isCurrent =
            contractId != null &&
            currentContractId != null &&
            String(contractId) === String(currentContractId);
          const isOrigin =
            contractId != null &&
            originContractId != null &&
            String(contractId) === String(originContractId);

          return (
            <Link
              key={contractId ?? contractUuid}
              href={`/home/orders/${contractId}`}
              className={getButtonClass(contractId)}
              dir="ltr"
              title={
                isOrigin
                  ? "العقد الأساسي"
                  : isCurrent
                    ? "العقد الحالي"
                    : undefined
              }
              aria-current={isCurrent ? "page" : undefined}
            >
              {isOrigin && !isCurrent ? (
                <span className="absolute -top-2 right-1 rounded bg-[#0D6B6B] px-1.5 py-0.5 text-[9px] font-bold text-white shadow">
                  أساسي
                </span>
              ) : null}
              {contractUuid}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
