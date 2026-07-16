"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { ContractStepEditor } from "./contract-edit/contract-step-editor";
import {
  STEP3_TENANT_FIELDS,
  STEP3_TENANT_AGENT_FIELDS,
} from "./contract-edit/contract-field-schemas";
import {
  formatDisplayValue,
  isEmptyDisplayValue,
  SECTION_ERROR_BUTTON_CLASS,
} from "./contract-summary-view";
import { pickFirst } from "./frontend-contract-fields";

const OrderSectionErrorMenu = dynamic(
  () => import("@/components/Orders/messages/order-section-error-menu"),
  { ssr: false }
);

const copy = (value) => {
  if (isEmptyDisplayValue(value)) return;
  navigator.clipboard.writeText(String(value));
  toast.success("تم النسخ بنجاح");
};

const calendarTypeLabel = (value) => {
  if (value === "hijri") return "هجري";
  if (value === "gregorian") return "ميلادي";
  return value;
};

const tenantEntityLabel = (value) => {
  if (value === "person") return "فرد";
  if (value === "institution") return "منشأة";
  return value;
};

const authorizationTypeLabel = (value) => {
  if (value === "owner_and_representative_of_record") {
    return "مالك وممثل السجل";
  }
  if (value === "agent_or_authorized_by_registry_owner") {
    return "وكيل أو مفوض من مالك السجل";
  }
  return value;
};

const DetailCard = ({
  label,
  value,
  copyable = false,
  borderColor = "border-gray-200",
}) => {
  const empty = isEmptyDisplayValue(value);
  return (
    <div
      className={`rounded-[16px] border-r-4 bg-white p-4 shadow-sm ${borderColor} ${
        empty ? "opacity-45" : ""
      }`}
    >
      <span className="mb-1 block text-right text-xs font-medium text-gray-400">
        {label}
      </span>
      <p
        className={`flex items-center justify-end gap-2 text-sm font-bold lg:text-base ${
          empty ? "text-[#A3A3A3]" : "text-gray-800"
        }`}
      >
        {copyable && !empty ? (
          <button
            type="button"
            onClick={() => copy(value)}
            className="text-gray-400 hover:text-brand-main"
            title="نسخ"
          >
            <Copy size={14} />
          </button>
        ) : null}
        <span>{formatDisplayValue(value)}</span>
      </p>
    </div>
  );
};

function composeDob(day, month, year, fallback) {
  if (day && month && year) return `${day}-${month}-${year}`;
  return fallback ?? null;
}

function ContractTenant({ data }) {
  const step3 = data?.step3 ?? {};
  const pick = (key, ...alts) =>
    pickFirst(step3[key], data?.[key], ...alts.map((k) => step3[k] ?? data?.[k]));

  const tenantEntity = pick("tenant_entity");
  const isInstitution = tenantEntity === "institution";

  const personFields = [
    {
      label: "كيان المستأجر",
      value: tenantEntityLabel(tenantEntity),
      borderColor: "border-indigo-500",
    },
    {
      label: "رقــم هويـة المستأجر",
      value: pick("tenant_id_num"),
      borderColor: "border-yellow-400",
      copyable: true,
    },
    {
      label: "تــاريخ ميـلاد المستأجر",
      value: composeDob(
        pick("tenant_dob_day"),
        pick("tenant_dob_month"),
        pick("tenant_dob_year"),
        pick("tenant_dob")
      ),
      borderColor: "border-blue-600",
    },
    {
      label: "نوع تاريخ الميلاد",
      value: calendarTypeLabel(pick("type_tenant_dob")),
      borderColor: "border-cyan-500",
    },
    {
      label: "رقـم جــوال المستأجر",
      value: pick("tenant_mobile"),
      borderColor: "border-green-500",
      copyable: true,
    },
  ];

  const institutionFields = [
    {
      label: "كيان المستأجر",
      value: tenantEntityLabel(tenantEntity),
      borderColor: "border-indigo-500",
    },
    {
      label: "الرقم الموحد للمنشأة",
      value: pick("tenant_entity_unified_registry_number"),
      borderColor: "border-teal-500",
      copyable: true,
    },
    {
      label: "نوع التفويض",
      value: authorizationTypeLabel(pick("authorization_type")),
      borderColor: "border-orange-400",
    },
  ];

  const agentDetails = [
    {
      label: "رقم هوية وكيل المستأجر",
      value: pick(
        "id_num_of_property_tenant_agent",
        "id_number_of_property_tenant_agent"
      ),
      borderColor: "border-yellow-500",
      copyable: true,
    },
    {
      label: "جوال وكيل المستأجر",
      value: pick("mobile_of_property_tenant_agent"),
      borderColor: "border-green-600",
      copyable: true,
    },
    {
      label: "تاريخ ميلاد وكيل المستأجر",
      value: composeDob(
        pickFirst(
          step3.dobof_property_tenant_agent_day,
          step3.dob_of_property_tenant_agent_day,
          data?.dobof_property_tenant_agent_day,
          data?.dob_of_property_tenant_agent_day
        ),
        pickFirst(
          step3.dobof_property_tenant_agent_month,
          step3.dob_of_property_tenant_agent_month,
          data?.dobof_property_tenant_agent_month,
          data?.dob_of_property_tenant_agent_month
        ),
        pickFirst(
          step3.dobof_property_tenant_agent_year,
          step3.dob_of_property_tenant_agent_year,
          data?.dobof_property_tenant_agent_year,
          data?.dob_of_property_tenant_agent_year
        ),
        pick("dob_of_property_tenant_agent")
      ),
      borderColor: "border-blue-500",
    },
    {
      label: "نوع تاريخ ميلاد الوكيل",
      value: calendarTypeLabel(pick("type_dob_tenant_agent")),
      borderColor: "border-cyan-600",
    },
    {
      label: "صورة التفويض / الوكالة",
      value: pick(
        "copy_of_the_authorization_or_agency",
        "copy_of_the_authorization_or_agency_path"
      ),
      borderColor: "border-rose-400",
      copyable: true,
    },
  ];

  const leaseRenewalNotes =
    data?.instrument_type === "lease_renewal" ||
    data?.contract_summary?.instrument_type === "lease_renewal"
      ? [{ label: "ملاحظات", value: pick("notes"), borderColor: "border-gray-400" }]
      : [];

  const tenantDetails = isInstitution
    ? [...institutionFields, ...leaseRenewalNotes]
    : [...personFields, ...leaseRenewalNotes];

  return (
    <div className="space-y-6 p-4 lg:p-6" dir="rtl">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-6">
          <ContractStepEditor
            title="تفاصيل المستأجر"
            step="step3"
            fields={STEP3_TENANT_FIELDS}
          >
            <div className="rounded-[28px] border border-gray-100 bg-gray-100/50 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {tenantDetails.map((item) => (
                  <DetailCard key={item.label} {...item} />
                ))}
              </div>
            </div>
          </ContractStepEditor>

          {isInstitution ? (
            <ContractStepEditor
              title="بيانات وكيل المستأجر"
              step="step3"
              fields={STEP3_TENANT_AGENT_FIELDS}
            >
              <div className="rounded-[28px] border border-gray-100 bg-gray-100/50 p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {agentDetails.map((item) => (
                    <DetailCard key={item.label} {...item} />
                  ))}
                </div>
              </div>
            </ContractStepEditor>
          ) : null}
        </div>

        <OrderSectionErrorMenu
          label="إرسال خطأ للعميل"
          orderData={data}
          context="contractTenant"
          buttonClassName={SECTION_ERROR_BUTTON_CLASS}
        />
      </div>
    </div>
  );
}

export default ContractTenant;
