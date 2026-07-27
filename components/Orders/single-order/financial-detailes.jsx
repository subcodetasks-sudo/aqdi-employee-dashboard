"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { ContractStepEditor } from "./contract-edit/contract-step-editor";
import {
  STEP4_FINANCIAL_FIELDS,
  STEP4_OTHER_CONDITIONS_FIELDS,
  STEP4_TERMS_FIELDS,
  STEP4_TENANT_ROLES_FIELDS,
} from "./contract-edit/contract-field-schemas";
import {
  formatDisplayValue,
  isEmptyDisplayValue,
  SECTION_ERROR_BUTTON_CLASS,
} from "./contract-summary-view";
import {
  pickFirst,
  resolveOtherConditionsList,
  resolveTenantRoleDetails,
} from "./frontend-contract-fields";
import { useTenantRoles } from "@/src/hooks/use-tenant-roles";

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

const ROLE_BORDER_COLORS = [
  "border-blue-500",
  "border-amber-500",
  "border-indigo-600",
  "border-sky-400",
  "border-orange-500",
  "border-rose-500",
  "border-purple-500",
  "border-teal-500",
];

function TenantRoleCard({ role, borderColor }) {
  const valueText = role.value;
  const empty = isEmptyDisplayValue(role.label);

  return (
    <div
      className={`rounded-[16px] border-r-4 bg-white p-4 shadow-sm ${borderColor} ${
        empty ? "opacity-45" : ""
      }`}
    >
      <span className="mb-1 block text-right text-xs font-medium text-gray-400">
        صلاحية المستأجر
      </span>
      <p className="text-right text-sm font-bold text-gray-800 lg:text-base">
        {formatDisplayValue(role.label)}
      </p>
      {!isEmptyDisplayValue(valueText) ? (
        <p className="mt-2 text-right text-xs text-gray-500">
          <span className="font-medium text-gray-400">
            {role.inputLabel || "القيمة"}:
          </span>{" "}
          <span className="font-bold text-gray-800">{valueText}</span>
        </p>
      ) : null}
    </div>
  );
}

function composeDate(day, month, year, fallback) {
  if (day && month && year) return `${day}-${month}-${year}`;
  return fallback ?? null;
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

  const tenantRoleItems = resolveTenantRoleDetails(data, tenantRoles);
  const hasTenantRolesFlag =
    pick("tenant_roles") === true ||
    pick("tenant_roles") === 1 ||
    pick("tenant_roles") === "1";

  const otherConditionsList = resolveOtherConditionsList(data);
  const hasOtherConditionsFlag =
    pick("conditions") === true ||
    pick("conditions") === 1 ||
    pick("conditions") === "1" ||
    otherConditionsList.length > 0;

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
  ];

  const termsFields = STEP4_TERMS_FIELDS.filter((field) =>
    ["contract_starting_date", "type_contract_starting_date"].includes(field.key)
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

          <ContractStepEditor
            title="شروط أخرى"
            step="step4"
            fields={STEP4_OTHER_CONDITIONS_FIELDS}
          >
            <div className="rounded-[28px] border border-gray-100 bg-gray-100/50 p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="text-right">
                  <h3 className="text-sm font-black text-gray-800">
                    هل توجد شروط أخرى؟
                  </h3>
                  <p className="mt-1 text-xs text-gray-400">
                    {hasOtherConditionsFlag ? "نعم" : "لا"}
                  </p>
                </div>
                {otherConditionsList.length > 0 ? (
                  <span className="rounded-full bg-brand-hover/15 px-2.5 py-1 text-[11px] font-bold text-brand-hover">
                    {otherConditionsList.length} شرط
                  </span>
                ) : null}
              </div>

              {otherConditionsList.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {otherConditionsList.map((condition, index) => (
                    <DetailCard
                      key={`condition-${index}`}
                      label={`الشرط ${index + 1}`}
                      value={condition}
                      borderColor={
                        ROLE_BORDER_COLORS[index % ROLE_BORDER_COLORS.length]
                      }
                      copyable
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm font-medium text-[#A3A3A3]">
                  لا توجد شروط أخرى محددة
                </p>
              )}
            </div>
          </ContractStepEditor>

          <ContractStepEditor
            title="صلاحيات المستأجر"
            step="step4"
            fields={STEP4_TENANT_ROLES_FIELDS}
          >
            <div className="rounded-[28px] border border-brand-hover/30 bg-brand-hover/5 p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-sm font-black text-gray-800">
                  الصلاحيات المحددة
                </h3>
                {hasTenantRolesFlag || tenantRoleItems.length > 0 ? (
                  <span className="rounded-full bg-brand-hover/15 px-2.5 py-1 text-[11px] font-bold text-brand-hover">
                    {tenantRoleItems.length} صلاحية
                  </span>
                ) : null}
              </div>

              {tenantRoleItems.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {tenantRoleItems.map((role, index) => (
                    <TenantRoleCard
                      key={role.id ?? `${role.label}-${index}`}
                      role={role}
                      borderColor={
                        ROLE_BORDER_COLORS[index % ROLE_BORDER_COLORS.length]
                      }
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm font-medium text-[#A3A3A3]">
                  {hasTenantRolesFlag
                    ? "تم تفعيل صلاحيات المستأجر بدون تفاصيل محفوظة"
                    : "لا توجد صلاحيات مستأجر محددة"}
                </p>
              )}
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
