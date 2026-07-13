"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const fieldClass = "h-12 rounded-[16px] bg-[#FAFAFA] border-[#EEEEEE]";

export default function PaymentMessageFormFields({ form, onChange }) {
  const update = (key, value) => onChange({ ...form, [key]: value });

  return (
    <div dir="rtl" className="space-y-5 text-right">
      <div className="space-y-2">
        <label className="text-sm font-bold text-black">
          نص الرسالة <span className="text-red-500">*</span>
        </label>
        <Textarea
          placeholder="اكتب رسالة الدفع هنا..."
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          className="min-h-[120px] rounded-[16px] bg-[#FAFAFA] border-[#EEEEEE] resize-none"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-bold text-black">
            نص الزر الأول <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="مثال: عرض العقد"
            value={form.button_text}
            onChange={(e) => update("button_text", e.target.value)}
            className={fieldClass}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-black">
            رابط الزر الأول <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="https://example.com/contracts"
            value={form.button_link}
            onChange={(e) => update("button_link", e.target.value)}
            className={fieldClass}
            dir="ltr"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-bold text-black">
            نص الزر الثاني <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="مثال: الصفحة الرئيسية"
            value={form.button_text_2}
            onChange={(e) => update("button_text_2", e.target.value)}
            className={fieldClass}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-black">
            رابط الزر الثاني <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="https://example.com"
            value={form.button_link_2}
            onChange={(e) => update("button_link_2", e.target.value)}
            className={fieldClass}
            dir="ltr"
          />
        </div>
      </div>
    </div>
  );
}
