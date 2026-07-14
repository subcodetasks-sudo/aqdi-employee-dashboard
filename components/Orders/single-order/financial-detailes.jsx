"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { ContractStepEditor } from "./contract-edit/contract-step-editor";
import {
  STEP4_FINANCIAL_FIELDS,
  STEP4_TERMS_FIELDS,
} from "./contract-edit/contract-field-schemas";
import {
  formatDisplayValue,
  isEmptyDisplayValue,
} from "./contract-summary-view";

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
      <span className="mb-1 block text-right text-xs font-medium text-gray-400">{label}</span>
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

function FinancialDetailes({ data }) {
  const financialDetails = [
    {
      label: "مبلغ الإيجار السنوي للوحدة",
      value: data?.step4?.annual_rent_amount_for_the_unit,
      borderColor: "border-blue-500",
      copyable: true,
    },
    {
      label: "نـوع الدفع",
      value: data?.step4?.payment_type_name || data?.step4?.payment_type_id,
      borderColor: "border-yellow-400",
    },
    { label: "الغرامة اليومية", value: data?.step4?.daily_fine, borderColor: "border-red-400", copyable: true },
    {
      label: "إجمالي السعر",
      value: data?.step4?.contract_term_in_years?.price || data?.step4?.contract_term_in_years,
      borderColor: "border-green-500",
      copyable: true,
    },
  ];

  const contractDetails = [
    { label: "مدة العقد", value: data?.step4?.contract_term_name, borderColor: "border-purple-500" },
    { label: "تاريخ بداية العقد", value: data?.step4?.contract_starting_date, borderColor: "border-green-500" },
    {
      label: "نوع التاريخ",
      value:
        data?.step4?.type_contract_starting_date === "hijri"
          ? "هجري"
          : data?.step4?.type_contract_starting_date === "gregorian"
            ? "ميلادي"
            : data?.step4?.type_contract_starting_date,
      borderColor: "border-sky-400",
    },
  ];

  const otherTerms = [
    { label: "شروط إضافية", value: data?.step4?.other_conditions || "لا يوجد", borderColor: "border-gray-300" },
    { label: "نص الشروط الإضافية", value: data?.step4?.text_additional_terms, borderColor: "border-gray-300" },
  ];

  const termsFields = STEP4_TERMS_FIELDS.filter((field) =>
    ["contract_starting_date", "type_contract_starting_date"].includes(field.key)
  );

  const additionalFields = STEP4_TERMS_FIELDS.filter((field) =>
    ["other_conditions", "text_additional_terms"].includes(field.key)
  );

  return (
    <div className="space-y-6 p-4 lg:p-6" dir="rtl">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ContractStepEditor title="البيانات المالية" step="step4" fields={STEP4_FINANCIAL_FIELDS}>
          <div className="rounded-[28px] border border-gray-100 bg-gray-100/50 p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {financialDetails.map((item, index) => (
                <DetailCard key={index} {...item} />
              ))}
            </div>
          </div>
        </ContractStepEditor>

        <ContractStepEditor title="مدة العقد" step="step4" fields={termsFields}>
          <div className="rounded-[28px] border border-gray-100 bg-gray-100/50 p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {contractDetails.map((item, index) => (
                <DetailCard key={index} {...item} />
              ))}
            </div>
          </div>
        </ContractStepEditor>
      </div>

      <ContractStepEditor title="الشروط الإضافية" step="step4" fields={additionalFields}>
        <div className="rounded-[28px] border border-gray-100 bg-gray-100/50 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {otherTerms.map((item, index) => (
              <DetailCard key={index} {...item} />
            ))}
          </div>
        </div>
      </ContractStepEditor>
    </div>
  );
}

export default FinancialDetailes;
