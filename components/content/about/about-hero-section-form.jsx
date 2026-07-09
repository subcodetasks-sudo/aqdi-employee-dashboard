"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { getStringValue } from "@/src/lib/content-admin";
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const DEFAULT_VALUES = {
  badgeText: "من نحن؟",
  mainTitle: "نُبسّط إدارة العقود الإيجارية",
  description:
    "تقدم عقاري حلولًا إلكترونية متكاملة لإدارة عقود الإيجار السكنية والتجارية بإجراءات سهلة وآمنة تضمن حقوق جميع الأطراف وتعزز الثقة والحياد.",
};

export default function AboutHeroSectionForm({
  initialData,
  saveEndpoint,
  queryKey,
  sectionKey,
}) {
  const form = useForm({
    defaultValues: DEFAULT_VALUES,
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    form.reset({
      badgeText: getStringValue(initialData?.badge_text, DEFAULT_VALUES.badgeText),
      mainTitle: getStringValue(initialData?.main_title, DEFAULT_VALUES.mainTitle),
      description: getStringValue(initialData?.description, DEFAULT_VALUES.description),
    });
  }, [form, initialData]);

  const { mutate: saveSection, isPending } = useMutation({
    mutationFn: (payload) => axiosInstance.post(saveEndpoint, payload),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم حفظ القسم بنجاح");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء حفظ القسم");
    },
  });

  const onSubmit = (values) => {
    saveSection({
      hero: {
        badge_text: values.badgeText.trim(),
        main_title: values.mainTitle.trim(),
        description: values.description.trim(),
      },
    });
  };

  return (
    <div className="rounded-[24px] border border-[#EEEEEE] bg-[#FCFCFC] p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-black">القسم الرئيسي</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#707070]">
          عدل الشارة والعنوان الرئيسي والوصف الخاص ببداية صفحة من نحن.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="badgeText"
            rules={{ required: "نص الشارة مطلوب" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[14px] font-bold text-black">الشارة</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="مثال: من نحن؟"
                    className="h-[52px] rounded-[16px] border-[#EEEEEE] bg-white px-4"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mainTitle"
            rules={{ required: "العنوان الرئيسي مطلوب" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[14px] font-bold text-black">
                  العنوان الرئيسي
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="مثال: نُبسّط إدارة العقود الإيجارية"
                    className="min-h-[120px] rounded-[20px] border-[#EEEEEE] bg-white px-4 py-3 leading-7 resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            rules={{ required: "الوصف مطلوب" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[14px] font-bold text-black">الوصف</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="أدخل وصف القسم الرئيسي"
                    className="min-h-[120px] rounded-[20px] border-[#EEEEEE] bg-white px-4 py-3 leading-7 resize-none"
                  />
                </FormControl>
                <FormDescription className="text-[#8A8A8A]">
                  يظهر هذا النص أسفل العنوان الرئيسي في صفحة من نحن.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isPending}
            className="h-12 rounded-full bg-brand-hover px-8 text-sm font-bold text-white hover:bg-brand-hover/90"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              "حفظ القسم الرئيسي"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
