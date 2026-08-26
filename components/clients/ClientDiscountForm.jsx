"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { APPLIES_TO_OPTIONS } from "@/src/lib/client-discount";
import { DEFAULT_DISCOUNT_FORM_VALUES, discountFormSchema } from "./client-discount-form-schema";
import DiscountTypeToggle from "./DiscountTypeToggle";

const LABEL_CLASS = "text-13 font-bold text-gray-900 dark:text-white";
const CONTROL_CLASS =
  "h-11 rounded-xl border-gray-200 bg-white text-13 dark:border-white/15 dark:bg-transparent dark:text-white focus-visible:ring-brand-dark";

export default function ClientDiscountForm({
  onSubmit,
  isSubmitting = false,
  defaultValues,
  onValuesChange,
}) {
  const form = useForm({
    resolver: zodResolver(discountFormSchema),
    defaultValues: { ...DEFAULT_DISCOUNT_FORM_VALUES, ...defaultValues },
  });

  const notifyOnLogin = form.watch("notifyOnLogin");

  useEffect(() => {
    if (!onValuesChange) return undefined;
    onValuesChange(form.getValues());
    const subscription = form.watch((values) => onValuesChange(values));
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onValuesChange]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5" dir="rtl">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={LABEL_CLASS}>نوع الخصم</FormLabel>
              <DiscountTypeToggle value={field.value} onChange={field.onChange} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={LABEL_CLASS}>القيمة</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  className={CONTROL_CLASS}
                  {...field}
                />
              </FormControl>
              <p className="text-11 font-medium text-gray-400 dark:text-white/40">
                على رسوم السنة الأولى
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="appliesTo"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={LABEL_CLASS}>ينطبق على</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange} dir="rtl">
                  <SelectTrigger className={CONTROL_CLASS}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APPLIES_TO_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expiresAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={LABEL_CLASS}>ساري حتى (اختياري)</FormLabel>
              <FormControl>
                <Input type="date" className={CONTROL_CLASS} {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={LABEL_CLASS}>السبب</FormLabel>
              <FormControl>
                <Input placeholder="مثال: عميل مميز / تعويض" className={CONTROL_CLASS} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notifyOnLogin"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={LABEL_CLASS}>إشعار العميل</FormLabel>
              <div className="flex items-start gap-2.5">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <label
                  htmlFor={field.name}
                  onClick={() => field.onChange(!field.value)}
                  className="text-13 font-medium text-gray-700 dark:text-white/70 leading-snug cursor-pointer"
                >
                  إشعاره عند تسجيل الدخول بأنه حصل على خصم
                </label>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notificationMessage"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={LABEL_CLASS}>نص الرسالة</FormLabel>
              <FormControl>
                <Input
                  placeholder="تهانينا! حصلت على خصم خاص على رسوم السنة الأولى"
                  disabled={!notifyOnLogin}
                  className={CONTROL_CLASS}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full rounded-xl bg-brand-dark text-13 font-bold text-white hover:bg-brand-dark/90 dark:bg-emerald-500 dark:text-brand-ink dark:hover:bg-emerald-500/90"
        >
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : "حفظ الخصم (بالرمز السري)"}
        </Button>
      </form>
    </Form>
  );
}
