"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { MOCK_SMS_SETTINGS, SMS_FIELDS } from "../mock-data";
import { PrimaryButton, SectionHeading } from "../shared";

export default function SmsSettingsTab() {
  const [form, setForm] = useState(MOCK_SMS_SETTINGS);

  return (
    <div className="flex flex-col gap-4">
      <SectionHeading
        title="إعدادات رسائل SMS"
        description="قوالب رسائل SMS عامة لكل المشروع (مرة واحدة). ليست مرتبطة بنوع صك أو عقد."
      />

      <div className="max-w-3xl space-y-5 rounded-2xl border border-[#E6EBE9] bg-white p-6 shadow-[0_4px_12px_rgba(11,83,69,0.04)] dark:bg-[#13241C] dark:border-white/10">
        {SMS_FIELDS.map((field) => (
          <label key={field.key} className="flex flex-col gap-1.5 text-right">
            <span className="text-[13px] font-bold text-[#111827] dark:text-white">
              {field.label}
            </span>
            <span className="text-[12px] text-[#9CA3AF]">{field.description}</span>
            <Textarea
              rows={4}
              value={form[field.key]}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, [field.key]: e.target.value }))
              }
              className="min-h-[110px] rounded-xl resize-none"
            />
          </label>
        ))}

        <div className="flex justify-end pt-1">
          <PrimaryButton onClick={() => toast.success("تم حفظ إعدادات رسائل SMS (واجهة تجريبية)")}>
            حفظ الإعدادات
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
