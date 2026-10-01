"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import SectionFormShell from "@/components/content/section-form-shell";
import SectionTextField from "@/components/content/section-text-field";
import { buildSectionFormData, getStringValue } from "@/src/lib/content-admin";
import { useSaveSection } from "@/src/hooks/use-save-section";

const DEFAULT_VALUES = {
  badgeText: "من نحن؟",
  mainTitle: "نُبسّط إدارة العقود الإيجارية",
  description:
    "تقدم عقاري حلولًا إلكترونية متكاملة لإدارة عقود الإيجار السكنية والتجارية بإجراءات سهلة وآمنة تضمن حقوق جميع الأطراف وتعزز الثقة والحياد.",
};

export default function AboutHeroSectionForm({ initialData, saveEndpoint, queryKey }) {
  const form = useForm({ defaultValues: DEFAULT_VALUES });
  const { saveSection, isPending } = useSaveSection({ saveEndpoint, queryKey });

  useEffect(() => {
    form.reset({
      badgeText: getStringValue(initialData?.badge_text, DEFAULT_VALUES.badgeText),
      mainTitle: getStringValue(initialData?.main_title, DEFAULT_VALUES.mainTitle),
      description: getStringValue(initialData?.description, DEFAULT_VALUES.description),
    });
  }, [form, initialData]);

  const onSubmit = (values) =>
    saveSection(
      buildSectionFormData("hero", {
        badge_text: values.badgeText,
        main_title: values.mainTitle,
        description: values.description,
      })
    );

  return (
    <SectionFormShell
      title="القسم الرئيسي"
      description="عدل الشارة والعنوان الرئيسي والوصف الخاص ببداية صفحة من نحن."
      form={form}
      onSubmit={onSubmit}
      isPending={isPending}
      submitLabel="حفظ القسم الرئيسي"
    >
      <SectionTextField
        control={form.control}
        name="badgeText"
        label="الشارة"
        placeholder="مثال: من نحن؟"
        rules={{ required: "نص الشارة مطلوب" }}
      />
      <SectionTextField
        control={form.control}
        name="mainTitle"
        label="العنوان الرئيسي"
        placeholder="مثال: نُبسّط إدارة العقود الإيجارية"
        multiline
        rules={{ required: "العنوان الرئيسي مطلوب" }}
      />
      <SectionTextField
        control={form.control}
        name="description"
        label="الوصف"
        placeholder="أدخل وصف القسم الرئيسي"
        multiline
        description="يظهر هذا النص أسفل العنوان الرئيسي في صفحة من نحن."
        rules={{ required: "الوصف مطلوب" }}
      />
    </SectionFormShell>
  );
}
