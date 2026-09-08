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
  badgeText: "دعم مباشر وشخصي",
  mainTitle: "للاستفسار عن توثيق العقود على الواتساب !",
  description:
    "فريقنا المتخصص جاهز لمساعدتك في أي استفسار حول توثيق العقود التجارية تواصل معنا في أي وقت ونرد عليك خلال دقائق.",
  contactNumber: "",
  image: null,
};

export default function ContactSectionForm({ initialData, saveEndpoint, queryKey }) {
  const form = useForm({ defaultValues: DEFAULT_VALUES });
  const { saveSection, isPending } = useSaveSection({ saveEndpoint, queryKey });

  useEffect(() => {
    form.reset({
      badgeText: getStringValue(initialData?.badge_text, DEFAULT_VALUES.badgeText),
      mainTitle: getStringValue(initialData?.main_title, DEFAULT_VALUES.mainTitle),
      description: getStringValue(initialData?.description, DEFAULT_VALUES.description),
      contactNumber: getStringValue(
        initialData?.contact_number,
        DEFAULT_VALUES.contactNumber
      ),
      image: null,
    });
  }, [form, initialData]);

  const onSubmit = (values) =>
    saveSection(
      buildSectionFormData("contact", {
        badge_text: values.badgeText,
        main_title: values.mainTitle,
        description: values.description,
        contact_number: values.contactNumber,
        ...assetFormValue(values.image, values.imageRemoved),
      })
    );

  return (
    <SectionFormShell
      title="قسم التواصل"
      description="عدل نصوص قسم التواصل، رقم الواتساب، وصورة القسم الرئيسية."
      form={form}
      onSubmit={onSubmit}
      isPending={isPending}
      submitLabel="حفظ قسم التواصل"
    >
      <SectionTextField
        control={form.control}
        name="badgeText"
        label="الشارة"
        placeholder="مثال: دعم مباشر وشخصي"
        rules={{ required: "نص الشارة مطلوب" }}
      />
      <SectionTextField
        control={form.control}
        name="mainTitle"
        label="العنوان الرئيسي"
        placeholder="مثال: للاستفسار عن توثيق العقود على الواتساب!"
        multiline
        rules={{ required: "العنوان الرئيسي مطلوب" }}
      />
      <SectionTextField
        control={form.control}
        name="description"
        label="الوصف"
        placeholder="أدخل وصف قسم التواصل"
        multiline
        rules={{ required: "الوصف مطلوب" }}
      />
      <SectionTextField
        control={form.control}
        name="contactNumber"
        label="رقم التواصل"
        placeholder="05xxxxxxxx"
        dir="ltr"
        rules={{ required: "رقم التواصل مطلوب" }}
      />
      <SectionImageField
        form={form}
        name="image"
        initialUrl={initialData?.image_url || ""}
        label="صورة القسم"
        uploadTitle="ارفع صورة قسم التواصل"
        previewClassName="h-[260px]"
      />
    </SectionFormShell>
  );
}
