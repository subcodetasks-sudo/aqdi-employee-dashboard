"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { ContractStepEditor } from "./contract-edit/contract-step-editor";
import {
  STEP3_TENANT_FIELDS,
  STEP3_CONTRACT_META_FIELDS,
} from "./contract-edit/contract-field-schemas";

const copy = (value) => {
  if (!value || value === "---") return;
  navigator.clipboard.writeText(String(value));
  toast.success("تم النسخ بنجاح");
};

const display = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
};

const DetailCard = ({
  label,
  value,
  copyable = false,
  borderColor = "border-gray-200",
}) => (
  <div className={`rounded-[16px] border-r-4 bg-white p-4 shadow-sm ${borderColor}`}>
    <span className="mb-1 block text-right text-xs font-medium text-gray-400">{label}</span>
    <p className="flex items-center justify-end gap-2 text-sm font-bold text-gray-800 lg:text-base">
      {copyable && value && value !== "—" && value !== "---" ? (
        <button
          type="button"
          onClick={() => copy(value)}
          className="text-gray-400 hover:text-brand-main"
          title="نسخ"
        >
          <Copy size={14} />
        </button>
      ) : null}
      <span>{display(value)}</span>
    </p>
  </div>
);

function ContractTenant({ data }) {
  const contractMeta = [
    { label: "نوع العقــد", value: data?.contract_summary?.contract_type, borderColor: "border-blue-500" },
    { label: "تــاريخ بدء العقــد", value: data?.step4?.contract_starting_date, borderColor: "border-purple-500" },
    {
      label: "مــدة العقــد",
      value: data?.contract_summary?.contract_period || data?.contract_summary?.contract_period_id,
      borderColor: "border-gray-400",
    },
  ];

  const tenantDetails = [
    {
      label: "صلاحيات المستأجر",
      value: data?.step3?.tenant_role_names?.join?.("، ") || data?.step3?.tenant_role_names,
      borderColor: "border-blue-500",
      copyable: true,
    },
    {
      label: "رقــم هويـة المستأجر",
      value: data?.step3?.tenant_id_num,
      borderColor: "border-yellow-400",
      copyable: true,
    },
    { label: "تــاريخ ميـلاد المستأجر", value: data?.step3?.tenant_dob, borderColor: "border-blue-600" },
    {
      label: "رقـم جــوال المستأجر",
      value: data?.step3?.tenant_mobile,
      borderColor: "border-green-500",
      copyable: true,
    },
  ];

  return (
    <div className="space-y-6 p-4 lg:p-6" dir="rtl">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ContractStepEditor
          title="نوع العقد / تاريخ بدء العقد"
          step="step3"
          fields={STEP3_CONTRACT_META_FIELDS}
        >
          <div className="rounded-[28px] border border-gray-100 bg-gray-100/50 p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {contractMeta.map((item, index) => (
                <DetailCard key={index} {...item} />
              ))}
            </div>
          </div>
        </ContractStepEditor>

        <ContractStepEditor title="تفاصيل المستأجر" step="step3" fields={STEP3_TENANT_FIELDS}>
          <div className="rounded-[28px] border border-gray-100 bg-gray-100/50 p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {tenantDetails.map((item, index) => (
                <DetailCard key={index} {...item} />
              ))}
            </div>
          </div>
        </ContractStepEditor>
      </div>
    </div>
  );
}

export default ContractTenant;
