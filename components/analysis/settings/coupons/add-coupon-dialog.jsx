"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import { SETTINGS_EDIT_TRIGGER_CLASS, SettingsAddTrigger } from "@/components/SystemSettings/shared";
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

  // Pre-populate when opening in edit mode, mapping API keys to fields
  useEffect(() => {
    if (isEdit && coupon && open) {
      const typeVal = coupon.type_coupon === "ratio" || coupon.type === "percentage" ? "percentage" : "fixed";
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
      // Map frontend fields back to API requirements exactly
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
    }
  });

  const onSubmit = (data) => {
    saveCoupon(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <button type="button" className={SETTINGS_EDIT_TRIGGER_CLASS}>
            تعديل
          </button>
        ) : (
          <SettingsAddTrigger>إضافة</SettingsAddTrigger>
        )}
      </DialogTrigger>

      <DialogContent closeButton={false} className="max-w-2xl p-0 overflow-hidden rounded-32 border-0 shadow-2xl" dir="rtl">
        <DialogHeader>
          <div className="flex items-center justify-between border-b border-[#F0F0F0] px-8 py-6 bg-neutral-50">
            <h2 className="text-xl font-black text-black">
              {isEdit ? "تعديل الخصم" : "إضافة خصم"}
            </h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setOpen(false)} 
              className="rounded-full w-8 h-8 hover:bg-gray-200/50"
            >
              <X className="size-4 text-gray-500" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Row 1: Coupon Name & Code */}
              <div className="grid grid-cols-2 gap-4 text-right">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-13 font-bold text-black">اسم الخصم</FormLabel>
                      <FormControl>
                        <Input className="h-12 rounded-xl focus:border-brand-main" placeholder="اكتب هنا ..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-13 font-bold text-black">كود الخصم</FormLabel>
                      <FormControl>
                        <Input className="h-12 rounded-xl focus:border-brand-main uppercase tracking-wider font-mono" placeholder="NATIONAL93" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Row 2: Discount Type & Value */}
              <div className="grid grid-cols-2 gap-4 text-right">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-13 font-bold text-black">نوع الخصم</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange} dir="rtl">
                          <SelectTrigger className="h-12 rounded-xl">
                            <SelectValue placeholder="اختر نوع الخصم" />
                          </SelectTrigger>
                          <SelectContent>
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
                    <FormItem>
                      <FormLabel className="text-13 font-bold text-black">قيمة الخصم</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" className="h-12 rounded-xl focus:border-brand-main" placeholder="أدخل القيمة" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Row 3: Start Date & End Date */}
              <div className="grid grid-cols-2 gap-4 text-right">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-13 font-bold text-black">تاريخ بداية الخصم</FormLabel>
                      <FormControl>
                        <Input type="date" className="h-12 rounded-xl focus:border-brand-main" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-13 font-bold text-black">تاريخ نهاية الخصم</FormLabel>
                      <FormControl>
                        <Input type="date" className="h-12 rounded-xl focus:border-brand-main" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Row 4: Usage Limit & User Usage Limit */}
              <div className="grid grid-cols-2 gap-4 text-right">
                <FormField
                  control={form.control}
                  name="use_limit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-13 font-bold text-black">عدد مرات استخدام الخصم</FormLabel>
                      <FormControl>
                        <Input type="number" className="h-12 rounded-xl focus:border-brand-main" placeholder="مثال: 100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="user_use_limit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-13 font-bold text-black">عدد مرات استخدام الخصم لكل مستخدم</FormLabel>
                      <FormControl>
                        <Input type="number" className="h-12 rounded-xl focus:border-brand-main" placeholder="مثال: 1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Button */}
              <Button 
                disabled={isPending} 
                type="submit" 
                className="w-full h-14 bg-brand-hover text-white rounded-2xl font-black text-base flex items-center justify-center gap-2 hover:bg-brand-hover/90 transition-all shadow-lg shadow-brand-main/20 mt-4"
              >
                {isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <span>إضــافــة</span>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
