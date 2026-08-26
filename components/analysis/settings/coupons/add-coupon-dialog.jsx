"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SettingsFormDialog, {
  SettingsFieldLabel,
  settingsFieldClass,
} from "@/components/SystemSettings/SettingsFormDialog";
import { SETTINGS_EDIT_TRIGGER_CLASS, SettingsAddTrigger } from "@/components/SystemSettings/shared";
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const couponSchema = z.object({
  name: z.string().min(2, "اسم الخصم يجب أن يكون على الأقل حرفين"),
  code: z.string().min(3, "كود الخصم يجب أن يكون على الأقل 3 أحرف"),
  type: z.enum(["percentage", "fixed"], { required_error: "نوع الخصم مطلوب" }),
  value: z.string().min(1, "قيمة الخصم مطلوبة"),
  start_date: z.string().min(1, "تاريخ بداية الخصم مطلوب"),
  end_date: z.string().min(1, "تاريخ نهاية الخصم مطلوب"),
  use_limit: z.string().min(1, "عدد مرات استخدام الخصم مطلوب"),
  user_use_limit: z.string().min(1, "عدد مرات استخدام الخصم لكل مستخدم مطلوب"),
});

export default function AddCouponDialog({ isEdit = false, coupon }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      name: "",
      code: "",
      type: "fixed",
      value: "",
      start_date: "",
      end_date: "",
      use_limit: "",
      user_use_limit: "1",
    },
  });

  useEffect(() => {
    if (isEdit && coupon && open) {
      const typeVal =
        coupon.type_coupon === "ratio" || coupon.type === "percentage" ? "percentage" : "fixed";
      form.reset({
        name: coupon.name || "",
        code: coupon.code_coupon || coupon.code || "",
        type: typeVal,
        value: String(coupon.value_coupon || coupon.value || ""),
        start_date: coupon.date_start || coupon.start_date || "",
        end_date: coupon.date_end || coupon.end_date || "",
        use_limit: String(coupon.usage || coupon.use_limit || ""),
        user_use_limit: String(coupon.usage_of_user || coupon.user_use_limit || "1"),
      });
    }
  }, [isEdit, coupon, open, form]);

  const { mutate: saveCoupon, isPending } = useMutation({
    mutationFn: (data) => {
      const apiPayload = {
        name: data.name,
        code_coupon: data.code,
        type_coupon: data.type === "percentage" ? "ratio" : "value",
        value_coupon: parseFloat(data.value),
        date_start: data.start_date,
        date_end: data.end_date,
        usage: parseInt(data.use_limit),
        usage_of_user: parseInt(data.user_use_limit),
        is_review: true,
      };

      const url = isEdit ? `/admin/coupons/${coupon?.id}` : "/admin/coupons";
      return axiosInstance.post(url, apiPayload);
    },
    onSuccess: (res) => {
      toast.success(res?.data?.message || (isEdit ? "تم تعديل الخصم بنجاح" : "تم إضافة الخصم بنجاح"));
      setOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "حدث خطأ أثناء حفظ الخصم");
    },
  });

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        isEdit ? (
          <button type="button" className={SETTINGS_EDIT_TRIGGER_CLASS}>
            تعديل
          </button>
        ) : (
          <SettingsAddTrigger />
        )
      }
      title={isEdit ? "تعديل العنصر" : "عنصر جديد"}
      onSubmit={form.handleSubmit((data) => saveCoupon(data))}
      submitLabel="حفظ"
      isPending={isPending}
      maxWidthClass="sm:max-w-[560px]"
    >
      <Form {...form}>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <SettingsFieldLabel required>اسم الخصم</SettingsFieldLabel>
                <FormControl>
                  <Input className={settingsFieldClass} placeholder="اكتب هنا ..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <SettingsFieldLabel required>كود الخصم</SettingsFieldLabel>
                <FormControl>
                  <Input
                    className={`${settingsFieldClass} uppercase tracking-wider font-mono`}
                    placeholder="NATIONAL93"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <SettingsFieldLabel required>نوع الخصم</SettingsFieldLabel>
                <FormControl>
                  <Select dir="rtl" value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={settingsFieldClass}>
                      <SelectValue placeholder="اختر نوع الخصم" />
                    </SelectTrigger>
                    <SelectContent dir="rtl">
                      <SelectItem value="fixed">مبلغ ثابت (ريال)</SelectItem>
                      <SelectItem value="percentage">نسبة مئوية (%)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <SettingsFieldLabel required>قيمة الخصم</SettingsFieldLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    className={settingsFieldClass}
                    placeholder="أدخل القيمة"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <SettingsFieldLabel required>تاريخ البداية</SettingsFieldLabel>
                <FormControl>
                  <Input type="date" className={settingsFieldClass} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <SettingsFieldLabel required>تاريخ النهاية</SettingsFieldLabel>
                <FormControl>
                  <Input type="date" className={settingsFieldClass} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="use_limit"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <SettingsFieldLabel required>مرات الاستخدام</SettingsFieldLabel>
                <FormControl>
                  <Input
                    type="number"
                    className={settingsFieldClass}
                    placeholder="مثال: 100"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="user_use_limit"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <SettingsFieldLabel required>مرات الاستخدام للمستخدم</SettingsFieldLabel>
                <FormControl>
                  <Input
                    type="number"
                    className={settingsFieldClass}
                    placeholder="مثال: 1"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </SettingsFormDialog>
  );
}
