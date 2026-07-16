"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { ContractStepEditor } from "./contract-edit/contract-step-editor";
import {
  STEP4_FINANCIAL_FIELDS,
  STEP4_TERMS_FIELDS,
} from "./contract-edit/contract-field-schemas";
import {
  formatDisplayValue,
  isEmptyDisplayValue,
  SECTION_ERROR_BUTTON_CLASS,
} from "./contract-summary-view";
import { asYesNo, pickFirst } from "./frontend-contract-fields";
import {
  getTenantRoleLabel,
  useTenantRoles,
} from "@/src/hooks/use-tenant-roles";

const OrderSectionErrorMenu = dynamic(
  () => import("@/components/Orders/messages/order-section-error-menu"),
  { ssr: false }
);

const copy = (value) => {
  if (isEmptyDisplayValue(value)) return;
  navigator.clipboard.writeText(String(value));
  toast.success("تم النسخ بنجاح");
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

function composeDate(day, month, year, fallback) {
  if (day && month && year) return `${day}-${month}-${year}`;
  return fallback ?? null;
}

function resolveTenantRoleDisplay(data, step4, tenantRoles = []) {
  const roleId = pickFirst(step4?.tenant_role_id, data?.tenant_role_id);
  const matchedRole =
    roleId != null && roleId !== ""
      ? tenantRoles.find((role) => String(role?.id) === String(roleId))
      : null;

  return pickFirst(
    data?.tenant_role?.text_of_reason,
    data?.tenant_role?.name,
    step4?.tenant_role?.text_of_reason,
    step4?.tenant_role?.name,
    data?.relation_labels?.tenant_role,
    matchedRole ? getTenantRoleLabel(matchedRole) : null,
    Array.isArray(data?.tenant_role_ids) && data.tenant_role_ids.length
      ? data.tenant_role_ids
          .map((id) => {
            const role = tenantRoles.find((item) => String(item?.id) === String(id));
            return role ? getTenantRoleLabel(role) : null;
          })
          .filter(Boolean)
          .join("، ") || null
      : null
  );
}

function FinancialDetailes({ data }) {
  const { items: tenantRoles } = useTenantRoles();
  const step4 = data?.step4 ?? {};
  const pick = (...keys) =>
    pickFirst(...keys.flatMap((key) => [step4[key], data?.[key]]));

  const termObj = pick("contract_term_in_years");
  const termLabel =
    typeof termObj === "object" && termObj
      ? pickFirst(termObj.name, termObj.period, termObj.note_ar, termObj.name_trans)
      : termObj;

  const paymentLabel = pickFirst(
    data?.payment_type?.name_trans,
    data?.payment_type?.name_ar,
    data?.payment_type?.name,
    step4.payment_type_name,
    step4.payment_type?.name_trans,
    pick("payment_type_id")
  );

  const tenantRoleLabel = resolveTenantRoleDisplay(data, step4, tenantRoles);

  const financialDetails = [
    {
      label: "نـوع الدفع",
      value: paymentLabel,
      borderColor: "border-yellow-400",
    },
    {
      label: "مدة العقد",
      value: termLabel,
      borderColor: "border-purple-500",
    },
    {
      label: "مدة أخرى (سنوات)",
      value: pick("duration_years"),
      borderColor: "border-indigo-500",
    },
    {
      label: "مدة أخرى (أشهر)",
      value: pick("duration_months"),
      borderColor: "border-indigo-400",
    },
    {
      label: "نوع المدة",
      value: pick("duration_preset"),
      borderColor: "border-slate-400",
    },
  ];

  const contractDetails = [
    {
      label: "تاريخ بداية العقد",
      value: composeDate(
        pick("contract_starting_date_day"),
        pick("contract_starting_date_month"),
        pick("contract_starting_date_year"),
        pick("contract_starting_date")
      ),
      borderColor: "border-green-500",
    },
    {
      label: "نوع التاريخ",
      value:
        pick("type_contract_starting_date") === "hijri"
          ? "هجري"
          : pick("type_contract_starting_date") === "gregorian"
            ? "ميلادي"
            : pick("type_contract_starting_date"),
      borderColor: "border-sky-400",
    },
    {
      label: "صلاحيات المستأجر",
      value: tenantRoleLabel,
      borderColor: "border-blue-500",
      copyable: true,
    },
  ];

  const otherTerms = [
    {
      label: "الشروط",
      value: asYesNo(pick("conditions")),
      borderColor: "border-gray-300",
    },
    {
      label: "صلاحيات المستأجر (علم)",
      value: asYesNo(pick("tenant_roles")),
      borderColor: "border-gray-300",
    },
    {
      label: "شروط إضافية (علم)",
      value: asYesNo(pick("additional_terms")),
      borderColor: "border-gray-300",
    },
    {
      label: "نص الشروط الإضافية",
      value: pick("text_additional_terms", "other_conditions"),
      borderColor: "border-gray-300",
    },
  ];

  const termsFields = STEP4_TERMS_FIELDS.filter((field) =>
    ["contract_starting_date", "type_contract_starting_date", "tenant_role_id"].includes(
      field.key
    )
  );

  const additionalFields = STEP4_TERMS_FIELDS.filter((field) =>
    [
      "conditions",
      "tenant_roles",
      "additional_terms",
      "text_additional_terms",
      "notes",
    ].includes(field.key)
  );

  return (
    <div className="space-y-6 p-4 lg:p-6" dir="rtl">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-6">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <ContractStepEditor
              title="البيانات المالية"
              step="step4"
              fields={STEP4_FINANCIAL_FIELDS}
            >
              <div className="rounded-[28px] border border-gray-100 bg-gray-100/50 p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {financialDetails.map((item) => (
                    <DetailCard key={item.label} {...item} />
                  ))}
                </div>
              </div>
            </ContractStepEditor>

            <ContractStepEditor title="مدة وتاريخ العقد" step="step4" fields={termsFields}>
              <div className="rounded-[28px] border border-gray-100 bg-gray-100/50 p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {contractDetails.map((item) => (
                    <DetailCard key={item.label} {...item} />
                  ))}
                </div>
              </div>
            </ContractStepEditor>
          </div>

          <ContractStepEditor title="الشروط والصلاحيات" step="step4" fields={additionalFields}>
            <div className="rounded-[28px] border border-gray-100 bg-gray-100/50 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {otherTerms.map((item) => (
                  <DetailCard key={item.label} {...item} />
                ))}
              </div>
            </div>
          </ContractStepEditor>
        </div>

        <OrderSectionErrorMenu
          label="إرسال خطأ للعميل"
          orderData={data}
          context="financialTerms"
          buttonClassName={SECTION_ERROR_BUTTON_CLASS}
        />
      </div>
    </div>
  );
}

export default FinancialDetailes;
