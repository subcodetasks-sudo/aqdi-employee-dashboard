"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { ContractStepEditor } from "./contract-edit/contract-step-editor";
import {
  STEP3_TENANT_FIELDS,
  STEP3_TENANT_AGENT_FIELDS,
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

const calendarTypeLabel = (value) => {
  if (value === "hijri") return "هجري";
  if (value === "gregorian") return "ميلادي";
  return value;
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
  const step3 = data?.step3 ?? {};

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
    { label: "كيان المستأجر", value: step3.tenant_entity, borderColor: "border-indigo-500" },
    {
      label: "صلاحيات المستأجر",
      value: step3.tenant_role_names?.join?.("، ") || step3.tenant_role_names,
      borderColor: "border-blue-500",
      copyable: true,
    },
    {
      label: "رقــم هويـة المستأجر",
      value: step3.tenant_id_num,
      borderColor: "border-yellow-400",
      copyable: true,
    },
    { label: "تــاريخ ميـلاد المستأجر", value: step3.tenant_dob, borderColor: "border-blue-600" },
    { label: "يوم الميلاد", value: step3.tenant_dob_day, borderColor: "border-sky-400" },
    { label: "شهر الميلاد", value: step3.tenant_dob_month, borderColor: "border-sky-500" },
    { label: "سنة الميلاد", value: step3.tenant_dob_year, borderColor: "border-sky-600" },
    {
      label: "نوع تاريخ الميلاد",
      value: calendarTypeLabel(step3.type_tenant_dob),
      borderColor: "border-cyan-500",
    },
    {
      label: "رقـم جــوال المستأجر",
      value: step3.tenant_mobile,
      borderColor: "border-green-500",
      copyable: true,
    },
    {
      label: "الرقم الموحد للمنشأة",
      value: step3.tenant_entity_unified_registry_number,
      borderColor: "border-teal-500",
      copyable: true,
    },
    { label: "نوع التفويض", value: step3.authorization_type, borderColor: "border-orange-400" },
    {
      label: "صورة سجل المالك",
      value: step3.copy_of_the_owner_record,
      borderColor: "border-rose-400",
      copyable: true,
    },
  ];

  const agentDetails = [
    {
      label: "منطقة الوكيل الشرعي للمستأجر",
      value: step3.region_of_the_tenant_legal_agent,
      borderColor: "border-violet-500",
    },
    {
      label: "مدينة الوكيل الشرعي للمستأجر",
      value: step3.city_of_the_tenant_legal_agent,
      borderColor: "border-violet-400",
    },
    {
      label: "رقم هوية وكيل المستأجر",
      value:
        step3.id_num_of_property_tenant_agent ||
        step3.id_number_of_property_tenant_agent,
      borderColor: "border-yellow-500",
      copyable: true,
    },
    {
      label: "جوال وكيل المستأجر",
      value: step3.mobile_of_property_tenant_agent,
      borderColor: "border-green-600",
      copyable: true,
    },
    {
      label: "تاريخ ميلاد وكيل المستأجر",
      value: step3.dob_of_property_tenant_agent,
      borderColor: "border-blue-500",
    },
    {
      label: "يوم ميلاد الوكيل",
      value: step3.dob_of_property_tenant_agent_day,
      borderColor: "border-sky-400",
    },
    {
      label: "شهر ميلاد الوكيل",
      value: step3.dob_of_property_tenant_agent_month,
      borderColor: "border-sky-500",
    },
    {
      label: "سنة ميلاد الوكيل",
      value: step3.dob_of_property_tenant_agent_year,
      borderColor: "border-sky-600",
    },
    {
      label: "نوع تاريخ ميلاد الوكيل",
      value: calendarTypeLabel(step3.type_dob_tenant_agent),
      borderColor: "border-cyan-600",
    },
  ];

  return (
    <div className="space-y-6 p-4 lg:p-6" dir="rtl">
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tenantDetails.map((item, index) => (
              <DetailCard key={index} {...item} />
            ))}
          </div>
        </div>
      </ContractStepEditor>

      <ContractStepEditor
        title="بيانات وكيل المستأجر"
        step="step3"
        fields={STEP3_TENANT_AGENT_FIELDS}
      >
        <div className="rounded-[28px] border border-gray-100 bg-gray-100/50 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {agentDetails.map((item, index) => (
              <DetailCard key={index} {...item} />
            ))}
          </div>
        </div>
      </ContractStepEditor>
    </div>
  );
}

export default ContractTenant;
