"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Zod schema matching requested API keys
const salarySchema = z.object({
  addition_date: z.string().min(1, "تاريخ الإضافة مطلوب"),
  due_date: z.string().min(1, "تاريخ الاستحقاق مطلوب"),
  basic_salary: z.string().min(1, "الراتب الأساسي مطلوب"),
  deduction: z.string().optional().default("0"),
  bonus: z.string().optional().default("0"),
  total: z.string().min(1, "المجموع مطلوب"),
});

export default function AddSalaryForm({ employee, onSuccess }) {
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(salarySchema),
    defaultValues: {
      addition_date: new Date().toISOString().split('T')[0],
      due_date: "",
      basic_salary: employee?.base_salary ? String(parseFloat(employee.base_salary)) : "",
      deduction: "0",
      bonus: "0",
      total: "",
    },
  });

  const watchBasicSalary = form.watch("basic_salary");
  const watchDeduction = form.watch("deduction");
  const watchBonus = form.watch("bonus");

  // Dynamic automatic calculation of the total salary
  useEffect(() => {
    const basic = parseFloat(watchBasicSalary || 0);
    const deduction = parseFloat(watchDeduction || 0);
    const bonus = parseFloat(watchBonus || 0);
    const calculatedTotal = basic - deduction + bonus;
    form.setValue("total", isNaN(calculatedTotal) ? "" : String(calculatedTotal));
  }, [watchBasicSalary, watchDeduction, watchBonus, form]);

  const { mutate, isPending } = useMutation({
    mutationFn: (payload) => {
      return axiosInstance.post(`/admin/employees/${employee?.id}/salary`, payload);
    },
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم إضافة الراتب بنجاح");
      queryClient.invalidateQueries({ queryKey: ["employee", String(employee?.id)] });
      queryClient.invalidateQueries({ queryKey: ["allEmployees"] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء إضافة الراتب");
    }
  });

  const onSubmit = (data) => {
    const payload = {
      addition_date: data.addition_date,
      due_date: data.due_date,
      basic_salary: parseFloat(data.basic_salary || 0),
      deduction: parseFloat(data.deduction || 0),
      bonus: parseFloat(data.bonus || 0),
      total: parseFloat(data.total || 0),
    };
    mutate(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
        <div dir='rtl' className="grid grid-cols-2 gap-4 text-right">
          {/* Addition Date */}
          <FormField
            control={form.control}
            name="addition_date"
            render={({ field }) => (
              <FormItem className="text-right">
                <FormLabel>تـاريخ الاضــافة</FormLabel>
                <FormControl>
                  <Input type="date" className="h-12" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Due Date */}
          <FormField
            control={form.control}
            name="due_date"
            render={({ field }) => (
              <FormItem className="text-right">
                <FormLabel>تـاريخ الاستحقاق</FormLabel>
                <FormControl>
                  <Input type="date" className="h-12" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Basic Salary */}
          <FormField
            control={form.control}
            name="basic_salary"
            render={({ field }) => (
              <FormItem className="text-right">
                <FormLabel>الراتب الأساسي</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" className="h-12" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Deduction */}
          <FormField
            control={form.control}
            name="deduction"
            render={({ field }) => (
              <FormItem className="text-right">
                <FormLabel>الخصم</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" className="h-12" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Bonus */}
          <FormField
            control={form.control}
            name="bonus"
            render={({ field }) => (
              <FormItem className="text-right">
                <FormLabel>المكافأة</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" className="h-12" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Total */}
          <FormField
            control={form.control}
            name="total"
            render={({ field }) => (
              <FormItem className="text-right">
                <FormLabel>المجموع (تلقائي)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" readOnly className="h-12 bg-gray-50 font-bold" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button size="lg" type="submit" disabled={isPending} className="block w-fit mx-auto bg-brand-hover text-white px-8">
          {isPending ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin size-4" />
              <span>جاري الحفظ...</span>
            </div>
          ) : (
            "حفظ الراتب"
          )}
        </Button>
      </form>
    </Form>
  );
}