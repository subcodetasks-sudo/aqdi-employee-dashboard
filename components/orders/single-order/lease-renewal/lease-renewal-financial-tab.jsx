"use client";

import { toast } from "sonner";
import { Check, Copy, Wallet, X } from "lucide-react";
import LeaseRenewalDraftTransfer from "./lease-renewal-draft-transfer";
import { ContractStepEditor } from "../contract-edit/contract-step-editor";
import {
  LEASE_RENEWAL_CONTRACT_DATE_FIELDS,
  LEASE_RENEWAL_FINANCIAL_FIELDS,
} from "../contract-edit/contract-field-schemas";
import {
  formatDisplayValue,
  isEmptyDisplayValue,
} from "../contract-summary-view";
import {
  getOrderFinancialStep,
  getOrderUnits,
  getOrderUnitsStep,
} from "@/src/lib/order-detail-steps";

const MoneyCard = ({ label, value, accent = "border-brand-accent" }) => {
  const empty = isEmptyDisplayValue(value);
  return (
    <div
      className={`bg-white rounded-2xl p-4 shadow-sm border-r-[3px] ${accent} ${
        empty ? "opacity-45" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <Wallet className={`size-5 shrink-0 ${empty ? "text-[#BDBDBD]" : "text-[#3B82F6]"}`} />
        <div className="text-right flex-1 min-w-0">
          <p className="text-11 text-[#9E9E9E] mb-0.5">{label}</p>
          <p
            className={`text-15 font-black ${
              empty ? "text-ink-placeholder" : "text-black"
            }`}
          >
            {formatDisplayValue(value)}
          </p>
        </div>
      </div>
    </div>
  );
};

const InactiveCard = ({ label }) => (
  <div className="bg-[#ECECEC] rounded-2xl p-4 opacity-70 border-r-[3px] border-r-[#BDBDBD]">
    <div className="flex items-center justify-between gap-2">
      <X className="size-5 text-status-danger shrink-0" />
      <p className="text-13 font-bold text-[#9E9E9E] text-right flex-1">{label}</p>
    </div>
  </div>
);

const PermissionCard = ({ label, active }) =>
  active ? (
    <div className="bg-white rounded-2xl p-4 shadow-sm border-r-[3px] border-r-[#9C27B0]">
      <div className="flex items-center justify-between gap-2">
        <Check className="size-5 text-brand-accent shrink-0" />
        <p className="text-13 font-bold text-black text-right flex-1">{label}</p>
      </div>
    </div>
  ) : (
    <InactiveCard label={label} />
  );

export default function LeaseRenewalFinancialTab({ orderData }) {
  const financial = getOrderFinancialStep(orderData);
  const unitsStep = getOrderUnitsStep(orderData);
  const firstUnit = getOrderUnits(orderData)[0] ?? {};

  const totalValue =
    financial.contract_term_in_years?.price ||
    financial.annual_rent_amount_for_the_unit ||
    null;

  const electricityMeter =
    firstUnit.electricity_meter_number ||
    unitsStep.electricity_meter_number ||
    firstUnit.electricity_meter ||
    unitsStep.electricity_meter ||
    null;
  const waterMeter =
    firstUnit.water_meter_number ||
    unitsStep.water_meter_number ||
    firstUnit.water_meter ||
    unitsStep.water_meter ||
    null;
  const startDate = financial.contract_starting_date || null;
  const dateType =
    financial.type_contract_starting_date === "hijri"
      ? "هجري"
      : financial.type_contract_starting_date === "gregorian"
        ? "ميلادي"
        : financial.type_contract_starting_date || "—";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full min-w-0">
      <div className="bg-[#F4F4F4] rounded-20 p-4 min-w-0 overflow-hidden">
        <ContractStepEditor
          title="البيانات المالية"
          step="step6"
          fields={LEASE_RENEWAL_FINANCIAL_FIELDS}
        >
          <div className="space-y-3">
            <MoneyCard label="إجمالي قيمة العقد" value={totalValue} accent="border-brand-accent" />
            <MoneyCard
              label="طريقة الدفعات"
              value={financial.payment_type_name || "—"}
              accent="border-[#BDBDBD]"
            />
            {electricityMeter ? (
              <div className="bg-white rounded-2xl p-4 shadow-sm border-r-[3px] border-r-brand-accent">
                <div className="flex items-start justify-between gap-2">
                  <Check className="size-5 text-brand-accent shrink-0 mt-0.5" />
                  <div className="text-right flex-1 min-w-0">
                    <p className="text-11 text-[#9E9E9E] mb-1">عداد الكهرباء</p>
                    <div className="flex items-center gap-2 justify-end min-w-0">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(String(electricityMeter));
                          toast.success("تم النسخ");
                        }}
                        className="text-ink-placeholder hover:text-brand-main shrink-0"
                      >
                        <Copy className="size-3.5" />
                      </button>
                      <p className="text-11 font-mono text-black break-all" dir="ltr">
                        {electricityMeter}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <InactiveCard label="عداد الكهرباء" />
            )}
            {waterMeter ? (
              <MoneyCard label="عداد المياه" value={waterMeter} accent="border-[#3B82F6]" />
            ) : (
              <InactiveCard label="عداد المياه" />
            )}
          </div>
        </ContractStepEditor>
      </div>

      <div className="bg-[#F4F4F4] rounded-20 p-4 min-w-0 overflow-hidden">
        <ContractStepEditor
          title="مدة العقد"
          step="step6"
          fields={LEASE_RENEWAL_CONTRACT_DATE_FIELDS}
        >
          <div className="space-y-3">
            <MoneyCard label="تاريخ بداية العقد" value={startDate} accent="border-brand-accent" />
            <MoneyCard label="نوع التاريخ" value={dateType} accent="border-[#3B82F6]" />
            <MoneyCard
              label="الغرامة اليومية"
              value={financial.daily_fine || "—"}
              accent="border-[#EF4444]"
            />
          </div>
        </ContractStepEditor>
      </div>

      <div className="bg-[#F4F4F4] rounded-20 p-4 min-w-0 overflow-hidden">
        <ContractStepEditor title="الصلاحيات" step="step6" fields={[]} showEdit={false}>
          <div className="space-y-3">
            <PermissionCard label="التأجير من الباطن" active={Boolean(financial.other_conditions)} />
            <PermissionCard
              label="الترميمات والتحسينات"
              active={Boolean(financial.text_additional_terms)}
            />
            <PermissionCard label="مراجعة الجهات الحكومية" active={false} />
            <PermissionCard label="تعديل الوحدة الإيجارية" active={false} />
          </div>
        </ContractStepEditor>
      </div>

      <div className="bg-[#F4F4F4] rounded-20 p-4 flex flex-col h-fit min-w-0 overflow-hidden sm:col-span-2 xl:col-span-1">
        <ContractStepEditor title="تحويل الطلب" step="step6" fields={[]} showEdit={false}>
          <LeaseRenewalDraftTransfer
            orderId={orderData?.id}
            orderData={orderData}
            layout="column"
            showTransferLabel={false}
          />
        </ContractStepEditor>
      </div>
    </div>
  );
}
