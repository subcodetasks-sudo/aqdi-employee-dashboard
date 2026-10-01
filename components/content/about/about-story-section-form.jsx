"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import SectionCardsList from "@/components/content/section-cards-list";
import SectionFormShell from "@/components/content/section-form-shell";
import SectionTextField from "@/components/content/section-text-field";
import { buildSectionFormData, getStringValue } from "@/src/lib/content-admin";
import { useSaveSection } from "@/src/hooks/use-save-section";

const DEFAULT_VALUES = {
  badgeText: "قصتنا",
  mainTitle: "أرقام نعتز بها",
  description:
    "نعمل تحت إشراف وتراخيص الجهات الحكومية المعتمدة لضمان موثوقية وأمان كافة المعاملات.",
  cards: [
    { value: "8.3M+", label: "عدد العقود السكنية الموثقة" },
    { value: "2M+", label: "عدد العقود التجارية الموثقة" },
    { value: "4+", label: "سنوات خبرة" },
    { value: "98%+", label: "رضا العملاء" },
  ],
};

export default function AboutStorySectionForm({ initialData, saveEndpoint, queryKey }) {
  const form = useForm({ defaultValues: DEFAULT_VALUES });
  const { saveSection, isPending } = useSaveSection({ saveEndpoint, queryKey });
  const cards = form.watch("cards");

  useEffect(() => {
    form.reset({
      badgeText: getStringValue(initialData?.badge_text, DEFAULT_VALUES.badgeText),
      mainTitle: getStringValue(initialData?.main_title, DEFAULT_VALUES.mainTitle),
      description: getStringValue(initialData?.description, DEFAULT_VALUES.description),
      cards: initialData?.cards?.length
        ? initialData.cards.map((card) => ({
            id: card.id ?? null,
            value: getStringValue(card.value),
            label: getStringValue(card.label),
          }))
        : DEFAULT_VALUES.cards,
    });
  }, [form, initialData]);

  const onSubmit = (values) =>
    saveSection(
      buildSectionFormData("story", {
        badge_text: values.badgeText,
        main_title: values.mainTitle,
        description: values.description,
        cards: values.cards.map((card) => ({
          ...(card.id ? { id: card.id } : {}),
          value: card.value,
          label: card.label,
        })),
      })
    );

  return (
    <SectionFormShell
      title="قسم قصتنا"
      description="عدل الشارة والعنوان والوصف، ثم حدّث بطاقات الأرقام الأساسية، ويمكنك إضافة بطاقات جديدة عند الحاجة."
      form={form}
      onSubmit={onSubmit}
      isPending={isPending}
      submitLabel="حفظ قسم قصتنا"
      formClassName="space-y-8"
    >
      <div className="space-y-5">
        <SectionTextField
          control={form.control}
          name="badgeText"
          label="الشارة"
          placeholder="مثال: قصتنا"
          rules={{ required: "نص الشارة مطلوب" }}
        />
        <SectionTextField
          control={form.control}
          name="mainTitle"
          label="العنوان الرئيسي"
          placeholder="مثال: أرقام نعتز بها"
          rules={{ required: "العنوان الرئيسي مطلوب" }}
        />
        <SectionTextField
          control={form.control}
          name="description"
          label="الوصف"
          placeholder="أدخل وصف القسم"
          multiline
          rules={{ required: "الوصف مطلوب" }}
        />
      </div>

      <SectionCardsList
        control={form.control}
        heading="بطاقات الأرقام"
        addLabel="إضافة بطاقة"
        emptyItem={{ value: "", label: "" }}
        gridClassName="xl:grid-cols-4"
        getCardTitle={(index) =>
          cards?.[index]?.label?.trim() ||
          DEFAULT_VALUES.cards[index]?.label ||
          `بطاقة ${index + 1}`
        }
        fieldsConfig={[
          {
            key: "value",
            label: "الرقم",
            placeholder: (index) =>
              DEFAULT_VALUES.cards[index]?.value || "مثال: 8.3M+",
            rules: { required: "الرقم أو القيمة مطلوبة" },
          },
          {
            key: "label",
            label: "الوصف",
            multiline: true,
            placeholder: (index) =>
              DEFAULT_VALUES.cards[index]?.label || "أدخل وصف البطاقة",
            rules: { required: "وصف البطاقة مطلوب" },
          },
        ]}
      />
    </SectionFormShell>
  );
}
