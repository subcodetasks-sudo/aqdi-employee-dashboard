"use client";

import { useEffect, useState } from "react";
import { Loader2, MessageSquareText } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/src/utils/axios";

export const SMS_SEND_API = "/admin/sms/send";

/** Resolve customer user_id from common order/refund/contract-paid shapes. */
export function resolveOrderSmsUserId(order) {
  if (!order) return null;

  const candidates = [
    order.user_id,
    order.customer_id,
    order.user?.id,
    order.customer?.id,
    order.customer_user_id,
    order.raw?.user_id,
    order.raw?.user?.id,
    order.raw?.customer_id,
    order.contract_summary?.user_id,
    order.contract_summary?.user?.id,
    order.contract?.user_id,
    order.contract?.user?.id,
  ];

  for (const value of candidates) {
    if (value == null || value === "") continue;
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric > 0) return numeric;
  }

  return null;
}

export function resolveOrderSmsPhone(order) {
  if (!order) return "";
  const summary = order.contract_summary ?? {};
  return (
    order.user_mobile ||
    order.customer_mobile ||
    order.userMobile ||
    order.user?.mobile ||
    order.user?.phone ||
    order.customer?.mobile ||
    order.phone ||
    order.mobile ||
    summary.property_owner_mobile ||
    summary.user_mobile ||
    summary.user?.mobile ||
    order.raw?.customer_mobile ||
    order.raw?.user_mobile ||
    ""
  );
}

export default function SendOrderSmsButton({
  order,
  employee = null,
  userId: userIdProp,
  employeeId: employeeIdProp,
  phone: phoneProp,
  className = "",
  label = null,
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const employeeId = employeeIdProp ?? employee?.id ?? null;
  const isEmployeeMode = employeeId != null && employeeId !== "";
  const userId = isEmployeeMode
    ? null
    : userIdProp ?? resolveOrderSmsUserId(order);
  const recipientId = isEmployeeMode ? Number(employeeId) : userId;
  const phone =
    phoneProp ||
    employee?.phone ||
    employee?.mobile ||
    resolveOrderSmsPhone(order || employee);

  useEffect(() => {
    if (!open) setMessage("");
  }, [open]);

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const body = { message: message.trim() };
      if (isEmployeeMode) {
        body.employee_id = Number(employeeId);
      } else {
        body.user_id = Number(userId);
      }
      return axiosInstance.post(SMS_SEND_API, body);
    },
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم إرسال الرسالة بنجاح");
      setOpen(false);
      setMessage("");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "حدث خطأ أثناء إرسال الرسالة"
      );
    },
  });

  const missingRecipientMessage = isEmployeeMode
    ? "تعذر تحديد الموظف لإرسال الرسالة"
    : "تعذر تحديد المستخدم لإرسال الرسالة";

  const handleOpen = (e) => {
    e?.stopPropagation?.();
    if (!recipientId) {
      toast.error(missingRecipientMessage);
      return;
    }
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!recipientId) {
      toast.error(missingRecipientMessage);
      return;
    }
    if (!message.trim()) {
      toast.error("يرجى كتابة نص الرسالة");
      return;
    }
    mutate();
  };

  const triggerClassName = label
    ? `h-auto py-3 px-4 rounded-2xl bg-[#0019FF] hover:bg-[#0015CC] text-white text-xs font-bold flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors ${className}`
    : `w-8 h-8 rounded-full flex items-center justify-center bg-[#F5F5F5] text-[#4D4D4D] hover:bg-brand-main hover:text-white transition-all shrink-0 ${className}`;

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={triggerClassName}
        aria-label="إرسال رسالة SMS"
        title="إرسال رسالة SMS"
      >
        <MessageSquareText className="size-4 shrink-0" />
        {label ? <span>{label}</span> : null}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          dir="rtl"
          closeButton={false}
          className="sm:max-w-[480px] rounded-[28px] border-0 p-6 sm:p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-[#F5F5F5] text-[#A3A3A3] hover:bg-[#FFEBEB] hover:text-[#E24444] transition-all"
              aria-label="إغلاق"
            >
              <i className="fa-solid fa-xmark text-[14px]" />
            </button>
            <h2 className="text-[18px] font-bold text-black">إرسال رسالة SMS</h2>
          </div>

          {(phone || recipientId) && (
            <div className="mb-4 rounded-2xl bg-[#F8F8F8] px-4 py-3 text-right text-[13px] text-[#616161]">
              {phone ? (
                <p>
                  الجوال:{" "}
                  <span className="font-bold text-black" dir="ltr">
                    {phone}
                  </span>
                </p>
              ) : null}
              <p className="mt-1">
                {isEmployeeMode ? "معرّف الموظف" : "معرّف المستخدم"}:{" "}
                <span className="font-bold text-black" dir="ltr">
                  {recipientId}
                </span>
              </p>
            </div>
          )}

          <div className="space-y-2 text-right mb-5">
            <label className="text-sm font-medium text-black">نص الرسالة</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب نص الرسالة هنا..."
              className="min-h-[140px] rounded-[20px] border-[#E5E7EB] bg-white px-4 py-3 text-right resize-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-brand-main"
              dir="rtl"
            />
          </div>

          <Button
            type="button"
            disabled={isPending || !message.trim()}
            onClick={handleSubmit}
            className="w-full h-12 rounded-full bg-brand-hover hover:bg-brand-hover/90 text-white font-bold gap-2"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <MessageSquareText className="size-4" />
            )}
            إرسال الرسالة
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
