"use client";

import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionFormShell from "@/components/content/section-form-shell";
import SectionImageField from "@/components/content/section-image-field";
import SectionTextField from "@/components/content/section-text-field";
import {
  assetFormValue,
  buildSectionFormData,
  getStringValue,
  newLocalId,
} from "@/src/lib/content-admin";
import { useSaveSection } from "@/src/hooks/use-save-section";

const DEFAULT_VALUES = {
  badgeText: "جهات موثوقة ومعتمدة",
  mainTitle: "مرخصون من الجهات الرسمية",
  description: "نعمل وفق أنظمة معتمدة لضمان موثوقية وأمان جميع التعاملات.",
  cards: [
    { title: "شبكة إيجار", description: "منصة موثقة ومعتمدة رسميًا." },
    { title: "الهيئة العامة للعقار", description: "ترخيص رسمي من الجهة المنظمة." },
    { title: "المركز السعودي للأعمال", description: "سجل تجاري معتمد ومسجل." },
  ],
};

function toFormCard(card = {}) {
  return {
    id: card.id ?? null,
    title: getStringValue(card.title),
    description: getStringValue(card.description),
    imageUrl: getStringValue(card.image_url),
    licenseUrl: getStringValue(card.license_file_url),
    image: null,
    license: null,
  };
}

export default function OfficialAuthoritiesForm({
  initialData,
  saveEndpoint,
  queryKey,
}) {
  const form = useForm({
    defaultValues: { ...DEFAULT_VALUES, cards: DEFAULT_VALUES.cards.map(toFormCard) },
  });
  const { saveSection, isPending } = useSaveSection({ saveEndpoint, queryKey });
  const cards = form.watch("cards");
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "cards",
  });

  useEffect(() => {
    const source = initialData?.cards?.length
      ? initialData.cards
      : DEFAULT_VALUES.cards;
    form.reset({
      badgeText: getStringValue(initialData?.badge_text, DEFAULT_VALUES.badgeText),
      mainTitle: getStringValue(initialData?.main_title, DEFAULT_VALUES.mainTitle),
      description: getStringValue(initialData?.description, DEFAULT_VALUES.description),
      cards: source.map(toFormCard),
    });
  }, [form, initialData]);

  const onSubmit = (values) =>
    saveSection(
      buildSectionFormData("official_authorities", {
        badge_text: values.badgeText,
        main_title: values.mainTitle,
        description: values.description,
        cards: values.cards.map((card) => ({
          id: card.id || newLocalId(),
          title: card.title,
          description: card.description,
          ...assetFormValue(card.image, card.imageRemoved, "image"),
          ...assetFormValue(card.license, card.licenseRemoved, "license_file", "license"),
        })),
      })
    );

  return (
    <SectionFormShell
      title="قسم الجهات الرسمية"
      description="عدل بيانات القسم العامة، ثم حرّر بطاقات الجهات — يمكنك إضافة بطاقة أو حذفها."
      form={form}
      onSubmit={onSubmit}
      isPending={isPending}
      submitLabel="حفظ قسم الجهات الرسمية"
      formClassName="space-y-8"
    >
      <div className="space-y-5">
        <SectionTextField
          control={form.control}
          name="badgeText"
          label="الشارة"
          placeholder="مثال: جهات موثوقة ومعتمدة"
          rules={{ required: "نص الشارة مطلوب" }}
        />
        <SectionTextField
          control={form.control}
          name="mainTitle"
          label="العنوان الرئيسي"
          placeholder="مثال: مرخصون من الجهات الرسمية"
          rules={{ required: "العنوان الرئيسي مطلوب" }}
        />
        <SectionTextField
          control={form.control}
          name="description"
          label="الوصف"
          placeholder="أدخل الوصف الخاص بالقسم"
          multiline
          rules={{ required: "الوصف مطلوب" }}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-t border-[#ECECEC] pt-6 dark:border-white/10">
          <h3 className="text-base font-bold text-black dark:text-white">محتوى البطاقات</h3>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({
                id: newLocalId(),
                title: "",
                description: "",
                imageUrl: "",
                licenseUrl: "",
                image: null,
                license: null,
              })
            }
            className="rounded-full"
          >
            <Plus className="size-4" />
            إضافة بطاقة
          </Button>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {fields.map((fieldItem, cardIndex) => (
            <div
              key={fieldItem.id}
              className="rounded-[24px] border border-[#EAEAEA] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none"
            >
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-sm font-bold text-black dark:text-white">
                  {cards?.[cardIndex]?.title?.trim() || `بطاقة ${cardIndex + 1}`}
                </h4>
                {fields.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(cardIndex)}
                    className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : null}
              </div>

              <div className="space-y-4">
                <SectionTextField
                  control={form.control}
                  name={`cards.${cardIndex}.title`}
                  label="العنوان"
                  size="sm"
                  rules={{ required: "عنوان البطاقة مطلوب" }}
                />
                <SectionTextField
                  control={form.control}
                  name={`cards.${cardIndex}.description`}
                  label="الوصف"
                  size="sm"
                  multiline
                  rules={{ required: "وصف البطاقة مطلوب" }}
                />
                <SectionImageField
                  form={form}
                  name={`cards.${cardIndex}.image`}
                  removedFieldName={`cards.${cardIndex}.imageRemoved`}
                  initialUrl={getStringValue(cards?.[cardIndex]?.imageUrl)}
                  label="صورة البطاقة"
                  size="sm"
                  uploadTitle="ارفع صورة البطاقة"
                  previewClassName="h-40"
                />
                <SectionImageField
                  form={form}
                  name={`cards.${cardIndex}.license`}
                  removedFieldName={`cards.${cardIndex}.licenseRemoved`}
                  initialUrl={getStringValue(cards?.[cardIndex]?.licenseUrl)}
                  label="ملف الترخيص"
                  size="sm"
                  allowPdf
                  uploadTitle="ارفع ملف الترخيص"
                  description="يمكنك رفع صورة للترخيص أو ملف PDF."
                  previewClassName="h-40"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionFormShell>
  );
}
