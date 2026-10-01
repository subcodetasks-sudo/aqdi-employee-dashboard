"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import SectionFormShell from "@/components/content/section-form-shell";
import SectionImageField from "@/components/content/section-image-field";
import SectionTextField from "@/components/content/section-text-field";
import {
  assetFormValue,
  buildSectionFormData,
  getStringValue,
} from "@/src/lib/content-admin";
import { useSaveSection } from "@/src/hooks/use-save-section";

const DEFAULT_VALUES = {
  badgeText: "عقدك الموثق من شبكة ايجار خلال دقائق",
  mainTitle: "عقد إيجار إلكتروني موثق..",
  description:
    "عقود إيجار معتمدة وموثقة عبر منصة إيجار الإلكترونية، بخطوات بسيطة وآمنة تضمن حقوق جميع الأطراف.",
  image: null,
};

export default function HeroContentForm({ initialData, saveEndpoint, queryKey }) {
  const form = useForm({ defaultValues: DEFAULT_VALUES });
  const { saveSection, isPending } = useSaveSection({ saveEndpoint, queryKey });

  useEffect(() => {
    form.reset({
      badgeText: getStringValue(initialData?.badge_text, DEFAULT_VALUES.badgeText),
      mainTitle: getStringValue(initialData?.main_title, DEFAULT_VALUES.mainTitle),
      description: getStringValue(initialData?.description, DEFAULT_VALUES.description),
      image: null,
    });
  }, [form, initialData]);

  const onSubmit = (values) =>
    saveSection(
      buildSectionFormData("hero", {
        badge_text: values.badgeText,
        main_title: values.mainTitle,
        description: values.description,
        ...assetFormValue(values.image, values.imageRemoved),
      })
    );

  return (
    <SectionFormShell
      title="القسم الرئيسي"
      description="أضف النصوص الأساسية والصورة الخاصة بأول جزء يظهر للزائر في الصفحة الرئيسية."
      form={form}
      onSubmit={onSubmit}
      isPending={isPending}
      submitLabel="حفظ القسم الرئيسي"
    >
      <SectionTextField
        control={form.control}
        name="badgeText"
        label="نص الشارة"
        placeholder="مثال: عقدك الموثق من شبكة ايجار خلال دقائق"
        rules={{ required: "نص الشارة مطلوب" }}
      />
      <SectionTextField
        control={form.control}
        name="mainTitle"
        label="العنوان الرئيسي"
        placeholder="مثال: عقد إيجار إلكتروني موثق.."
        rules={{ required: "العنوان الرئيسي مطلوب" }}
      />
      <SectionTextField
        control={form.control}
        name="description"
        label="الوصف"
        placeholder="أدخل الوصف التعريفي للقسم الرئيسي"
        multiline
        description="يظهر هذا النص أسفل العنوان الرئيسي في واجهة الموقع."
        rules={{ required: "الوصف مطلوب" }}
      />
      <SectionImageField
        form={form}
        name="image"
        initialUrl={initialData?.image_url || ""}
        label="صورة القسم"
        uploadTitle="ارفع صورة القسم الرئيسي"
      />
    </SectionFormShell>
  );
}
