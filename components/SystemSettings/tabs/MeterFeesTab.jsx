"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { METER_FEE_FIELDS, MOCK_METER_FEES } from "../mock-data";
import { PrimaryButton, SectionHeading } from "../shared";

export default function MeterFeesTab() {
  const [form, setForm] = useState(MOCK_METER_FEES);

  return (
    <div className="flex flex-col gap-4">
      <SectionHeading
        title="رسوم العدادات"
        description="4 رسوم ثابتة على مستوى المشروع للمستأجر السكني والتجاري. الحقول اختيارية، والحد الأدنى 0."
      />

      <div className="max-w-3xl space-y-5 rounded-2xl border border-[#E6EBE9] bg-white p-6 shadow-[0_4px_12px_rgba(11,83,69,0.04)] dark:bg-[#13241C] dark:border-white/10">
        <div className="grid gap-5 sm:grid-cols-2">
          {METER_FEE_FIELDS.map((field) => (
            <label key={field.key} className="flex flex-col gap-1.5 text-right">
              <span className="text-[13px] font-bold text-[#111827] dark:text-white">
                {field.label}
              </span>
              <Input
                type="number"
                min={0}
                step="any"
                inputMode="decimal"
                value={form[field.key]}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value !== "" && Number(value) < 0) return;
                  setForm((prev) => ({ ...prev, [field.key]: value }));
                }}
                className="h-12 rounded-xl bg-[#FAFAFA]"
                placeholder="0"
              />
            </label>
          ))}
        </div>

        <div className="flex justify-end pt-1">
          <PrimaryButton onClick={() => toast.success("تم حفظ رسوم العدادات (واجهة تجريبية)")}>
            حفظ الرسوم
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
