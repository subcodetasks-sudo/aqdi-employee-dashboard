"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MOCK_PAYMENT_MESSAGES } from "../mock-data";
import { OutlineButton, PrimaryButton, SectionHeading } from "../shared";

export default function PaymentMessagesTab() {
  const [messages, setMessages] = useState(MOCK_PAYMENT_MESSAGES);
  const [editing, setEditing] = useState(null);

  const save = () => {
    if (!editing) return;
    setMessages((prev) =>
      prev.map((item) => (item.type === editing.type ? editing : item))
    );
    toast.success("تم حفظ رسالة الدفع (واجهة تجريبية)");
    setEditing(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <SectionHeading
        title="إعدادات رسائل الدفع"
        description="رسالتان ثابتتان: واحدة لنجاح الدفع وأخرى لفشله. يمكنك تعديلهما فقط، بدون إمكانية الحذف."
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {messages.map((item) => {
          const isSuccess = item.type === "success";
          return (
            <div
              key={item.type}
              className="flex flex-col overflow-hidden rounded-2xl border bg-white shadow-[0_4px_12px_rgba(11,83,69,0.04)] dark:bg-[#13241C]"
              style={{
                borderColor: isSuccess ? "#B7EBC9" : "#FECACA",
              }}
            >
              <div
                className="flex items-start justify-between gap-3 border-b px-5 py-4"
                style={{
                  backgroundColor: isSuccess ? "#E6F7EF" : "#FFF0F0",
                  borderColor: isSuccess ? "#B7EBC9" : "#FECACA",
                }}
              >
                <div>
                  <h3 className="text-[16px] font-bold text-[#111827]">{item.label}</h3>
                  <p className="mt-1 text-[12px] text-[#6B7280]">{item.description}</p>
                </div>
                <OutlineButton onClick={() => setEditing({ ...item })}>تعديل</OutlineButton>
              </div>

              <div className="flex flex-1 flex-col gap-4 p-5">
                <div className="rounded-xl border border-[#EEF1F0] bg-[#FCFCFC] p-4 dark:bg-white/[0.03] dark:border-white/10">
                  <p className="mb-1 text-[11px] font-bold text-[#9CA3AF]">نص الرسالة</p>
                  <p className="text-[14px] font-bold leading-7 text-[#111827] dark:text-white">
                    {item.message}
                  </p>
                </div>
                <div className="grid gap-3 rounded-xl bg-[#FAFAFA] p-4 text-[12px] dark:bg-white/[0.03]">
                  <div>
                    <p className="font-bold text-[#9CA3AF]">نص الزر الأول</p>
                    <p className="mt-0.5 text-[13px] font-medium text-[#111827] dark:text-white">
                      {item.buttonText}
                    </p>
                    <p className="break-all text-[#6B7280]" dir="ltr">
                      {item.buttonLink}
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-[#9CA3AF]">نص الزر الثاني</p>
                    <p className="mt-0.5 text-[13px] font-medium text-[#111827] dark:text-white">
                      {item.buttonText2}
                    </p>
                    <p className="break-all text-[#6B7280]" dir="ltr">
                      {item.buttonLink2}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">تعديل {editing?.label}</DialogTitle>
          </DialogHeader>
          {editing ? (
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-bold">نص الرسالة</span>
                <Textarea
                  rows={4}
                  value={editing.message}
                  onChange={(e) => setEditing((prev) => ({ ...prev, message: e.target.value }))}
                  className="rounded-xl resize-none"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-bold">نص الزر الأول</span>
                  <Input
                    value={editing.buttonText}
                    onChange={(e) => setEditing((prev) => ({ ...prev, buttonText: e.target.value }))}
                    className="h-11 rounded-xl"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-bold">رابط الزر الأول</span>
                  <Input
                    dir="ltr"
                    value={editing.buttonLink}
                    onChange={(e) => setEditing((prev) => ({ ...prev, buttonLink: e.target.value }))}
                    className="h-11 rounded-xl"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-bold">نص الزر الثاني</span>
                  <Input
                    value={editing.buttonText2}
                    onChange={(e) => setEditing((prev) => ({ ...prev, buttonText2: e.target.value }))}
                    className="h-11 rounded-xl"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-bold">رابط الزر الثاني</span>
                  <Input
                    dir="ltr"
                    value={editing.buttonLink2}
                    onChange={(e) => setEditing((prev) => ({ ...prev, buttonLink2: e.target.value }))}
                    className="h-11 rounded-xl"
                  />
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <OutlineButton onClick={() => setEditing(null)}>إلغاء</OutlineButton>
                <PrimaryButton onClick={save}>حفظ</PrimaryButton>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
