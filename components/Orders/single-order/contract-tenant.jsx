"use client";

import { useState } from "react";
import { Copy, Eye, FileText } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { ContractStepEditor } from "./contract-edit/contract-step-editor";
import { STEP3_TENANT_FIELDS } from "./contract-edit/contract-field-schemas";
import {
  formatDisplayValue,
  isEmptyDisplayValue,
  SECTION_ERROR_BUTTON_CLASS,
} from "./contract-summary-view";
import { pickFirst } from "./frontend-contract-fields";
import AgencyDocumentViewerDialog, {
  resolveAgencyDocumentUrl,
} from "./agency-document-viewer-dialog";

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
  if (value === "institution") return "مؤسسة أو شركة";
  return value;
};

const authorizationTypeLabel = (value) => {
  if (value === "owner_and_representative_of_record") {
    return "أنا مالك السجل وممثله";
  }
  if (value === "agent_or_authorized_by_registry_owner") {
    return "أنا وكيل أو مفوض عن مالك السجل";
  }
  return value;
};

function isPdfUrl(url) {
  if (!url || typeof url !== "string") return false;
  return url.split("?")[0].toLowerCase().endsWith(".pdf");
}

const DetailCard = ({
  label,
  value,
  copyable = false,
  borderColor = "border-gray-200",
}) => {
  if (isEmptyDisplayValue(value)) return null;

  return (
    <div
      className={`rounded-[16px] border-r-4 bg-white p-4 shadow-sm ${borderColor}`}
    >
      <span className="mb-1 block text-right text-xs font-medium text-gray-400">
        {label}
      </span>
      <p className="flex items-center justify-end gap-2 text-sm font-bold text-gray-800 lg:text-base">
        {copyable ? (
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
  const [agencyViewerOpen, setAgencyViewerOpen] = useState(false);
  const step3 = data?.step3 ?? {};
  const pick = (key, ...alts) =>
    pickFirst(step3[key], data?.[key], ...alts.map((k) => step3[k] ?? data?.[k]));

  const tenantEntity = pick("tenant_entity");
  const isInstitution = tenantEntity === "institution";
  const authorizationType = pick("authorization_type");
  const isAgentAuth =
    authorizationType === "agent_or_authorized_by_registry_owner";

  const agencyDocumentUrl = resolveAgencyDocumentUrl({
    copy_of_the_authorization_or_agency: pick(
      "copy_of_the_authorization_or_agency",
      "copy_of_the_authorization_or_agency_path"
    ),
  });
  const agencyIsPdf = isPdfUrl(agencyDocumentUrl);

  const personFields = [
    {
      label: "صفة المستأجر",
      value: tenantEntityLabel(tenantEntity),
      borderColor: "border-indigo-500",
    },
    {
      label: "رقم هوية المستأجر",
      value: pick("tenant_id_num"),
      borderColor: "border-yellow-400",
      copyable: true,
    },
    {
      label: "رقم جوال المستأجر",
      value: pick("tenant_mobile"),
      borderColor: "border-green-500",
      copyable: true,
    },
    {
      label: "نوع تاريخ الميلاد",
      value: calendarTypeLabel(pick("type_tenant_dob")),
      borderColor: "border-cyan-500",
    },
    {
      label: "تاريخ ميلاد المستأجر",
      value: composeDob(
        pick("tenant_dob_day"),
        pick("tenant_dob_month"),
        pick("tenant_dob_year"),
        pick("tenant_dob")
      ),
      borderColor: "border-blue-600",
    },
  ];

  const institutionFields = [
    {
      label: "صفة المستأجر",
      value: tenantEntityLabel(tenantEntity),
      borderColor: "border-indigo-500",
    },
    {
      label: "نوع التفويض أو الوكالة",
      value: authorizationTypeLabel(authorizationType),
      borderColor: "border-orange-400",
    },
    {
      label: "رقم السجل الموحد",
      value: pick("tenant_entity_unified_registry_number"),
      borderColor: "border-teal-500",
      copyable: true,
    },
    {
      label: "رقم هوية مالك السجل",
      value: pick(
        "id_num_of_property_tenant_agent",
        "id_number_of_property_tenant_agent"
      ),
      borderColor: "border-yellow-500",
      copyable: true,
    },
    {
      label: "رقم جوال مالك السجل",
      value: pick("mobile_of_property_tenant_agent"),
      borderColor: "border-green-600",
      copyable: true,
    },
    {
      label: "نوع تاريخ ميلاد مالك السجل",
      value: calendarTypeLabel(pick("type_dob_tenant_agent")),
      borderColor: "border-cyan-600",
    },
    {
      label: "تاريخ ميلاد مالك السجل",
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
            <div className="rounded-[28px] border border-gray-100 bg-gray-100/50 p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {tenantDetails.map((item) => (
                  <DetailCard key={item.label} {...item} />
                ))}
              </div>

              {isInstitution && isAgentAuth ? (
                <div className="rounded-[16px] border border-[#EEEEEE] bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-right">
                      <p className="text-xs font-medium text-gray-400">
                        صورة التفويض / الوكالة
                      </p>
                      <p className="mt-1 text-sm font-bold text-gray-800">
                        {agencyDocumentUrl
                          ? agencyIsPdf
                            ? "ملف PDF مرفق"
                            : "صورة مرفقة"
                          : "لا يوجد ملف مرفق"}
                      </p>
                    </div>
                    {agencyDocumentUrl ? (
                      <button
                        type="button"
                        onClick={() => setAgencyViewerOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#E0E0E0] bg-[#FAFAFA] px-3 py-1.5 text-xs font-bold text-[#4D4D4D] hover:border-brand-hover hover:text-brand-hover"
                      >
                        {agencyIsPdf ? (
                          <FileText className="size-3.5 text-[#E24444]" />
                        ) : (
                          <Eye className="size-3.5" />
                        )}
                        معاينة
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </ContractStepEditor>
        </div>

        <OrderSectionErrorMenu
          label="إرسال خطأ للعميل"
          orderData={data}
          context="contractTenant"
          buttonClassName={SECTION_ERROR_BUTTON_CLASS}
        />
      </div>

      <AgencyDocumentViewerDialog
        open={agencyViewerOpen}
        onOpenChange={setAgencyViewerOpen}
        documentUrl={agencyDocumentUrl}
        title={agencyIsPdf ? "وكالة PDF" : "صورة الوكالة"}
      />
    </div>
  );
}

export default ContractTenant;
