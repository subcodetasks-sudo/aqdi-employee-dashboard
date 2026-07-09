"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { getStringValue } from "@/src/lib/content-admin";
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

const DEFAULT_VALUES = {
  badgeText: "الأسعار",
  mainTitle: "وثّق عقدك",
  description: "اختر نوع العقد المناسب لك وابدأ التوثيق فورًا.",
  cards: [
    {
      title: "عقد سكني",
      subtitle: "مناسبة للإيجار، عقد فردي، عقد عائلي ...",
      price: "249",
      durationLabel: "/ السنة الواحدة",
      features: [
        { text: "خلال دقائق ينجز عقدك" },
        { text: "مناسب لحساب المواطن" },
        { text: "مناسب للضمان المطور" },
        { text: "سند تنفيذي" },
        { text: "يطلبه للإيجار أو الاستثمار" },
      ],
    },
    {
      title: "عقد تجاري",
      subtitle: "مناسبة لمحلات تجارية، مكتب، مصنع ...",
      price: "349",
      durationLabel: "/ السنة الواحدة",
      features: [
        { text: "خلال دقائق ينجز عقدك" },
        { text: "متوافق مع وزارة التجارة" },
        { text: "توثيق عقد تجاري" },
        { text: "متوافق مع المركز السعودي للأعمال" },
        { text: "يطلبه للإيجار أو الاستثمار" },
      ],
    },
  ],
};

function PricingFeaturesFields({ control, cardIndex }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `cards.${cardIndex}.features`,
  });

  return (
    <div className="space-y-3 rounded-[18px] border border-[#EEEEEE] bg-[#FCFCFC] p-4">
      <div className="flex items-center justify-between">
        <h5 className="text-sm font-bold text-black">مميزات الباقة</h5>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ text: "" })}
          className="rounded-full"
        >
          <Plus className="size-4" />
          إضافة ميزة
        </Button>
      </div>

      <div className="space-y-3">
        {fields.map((fieldItem, featureIndex) => (
          <div key={fieldItem.id} className="flex items-start gap-2">
            <div className="flex-1">
              <FormField
                control={control}
                name={`cards.${cardIndex}.features.${featureIndex}.text`}
                rules={{ required: "نص الميزة مطلوب" }}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={`الميزة ${featureIndex + 1}`}
                        className="h-[44px] rounded-[14px] border-[#EEEEEE] bg-white px-4"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(featureIndex)}
              className="mt-1 text-red-500 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PricingSectionForm({
  initialData,
  saveEndpoint,
  queryKey,
}) {
  const form = useForm({
    defaultValues: DEFAULT_VALUES,
  });
  const queryClient = useQueryClient();
  const cards = form.watch("cards");

  useEffect(() => {
    const nextCards = initialData?.cards?.length
      ? initialData.cards.map((card, index) => ({
          id: card.id ?? null,
          title: getStringValue(card.title),
          subtitle: getStringValue(card.subtitle),
          price: getStringValue(card.price, DEFAULT_VALUES.cards[index]?.price || ""),
          durationLabel: getStringValue(
            card.duration_label,
            DEFAULT_VALUES.cards[index]?.durationLabel || ""
          ),
          features: card.features?.length
            ? card.features.map((feature) => ({
                id: feature.id ?? null,
                text: getStringValue(feature.text),
              }))
            : [{ text: "" }],
        }))
      : DEFAULT_VALUES.cards;

    form.reset({
      badgeText: getStringValue(initialData?.badge_text, DEFAULT_VALUES.badgeText),
      mainTitle: getStringValue(initialData?.main_title, DEFAULT_VALUES.mainTitle),
      description: getStringValue(initialData?.description, DEFAULT_VALUES.description),
      cards: nextCards,
    });
  }, [form, initialData]);

  const { mutate: saveSection, isPending } = useMutation({
    mutationFn: (payload) =>
      axiosInstance.post(saveEndpoint, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم حفظ القسم بنجاح");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء حفظ القسم");
    },
  });

  const onSubmit = (values) => {
    const formData = new FormData();
    formData.append("pricing[badge_text]", values.badgeText.trim());
    formData.append("pricing[main_title]", values.mainTitle.trim());
    formData.append("pricing[description]", values.description.trim());
    values.cards.forEach((card, index) => {
      if (card.id) formData.append(`pricing[cards][${index}][id]`, String(card.id));
      formData.append(`pricing[cards][${index}][title]`, card.title.trim());
      formData.append(`pricing[cards][${index}][subtitle]`, card.subtitle.trim());
      formData.append(`pricing[cards][${index}][price]`, card.price.trim());
      formData.append(
        `pricing[cards][${index}][duration_label]`,
        card.durationLabel.trim()
      );
      card.features.forEach((feature, featureIndex) => {
        if (feature.id) {
          formData.append(
            `pricing[cards][${index}][features][${featureIndex}][id]`,
            String(feature.id)
          );
        }
        formData.append(
          `pricing[cards][${index}][features][${featureIndex}][text]`,
          feature.text.trim()
        );
      });
    });
    saveSection(formData);
  };

  return (
    <div className="rounded-[24px] border border-[#EEEEEE] bg-[#FCFCFC] p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-black">قسم الأسعار</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#707070]">
          عدل بيانات القسم العامة ثم حدّث البطاقتين الثابتتين، مع إمكانية إضافة
          مميزات جديدة داخل كل بطاقة.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-5">
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
                      placeholder="مثال: الأسعار"
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
                    <Input
                      {...field}
                      placeholder="مثال: وثّق عقدك"
                      className="h-[52px] rounded-[16px] border-[#EEEEEE] bg-white px-4"
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
                      placeholder="أدخل الوصف الخاص بالقسم"
                      className="min-h-[120px] rounded-[20px] border-[#EEEEEE] bg-white px-4 py-3 leading-7 resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-t border-[#ECECEC] pt-6">
              <h3 className="text-base font-bold text-black">محتوى البطاقات</h3>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {DEFAULT_VALUES.cards.map((defaultCard, cardIndex) => {
                const cardTitle =
                  cards?.[cardIndex]?.title?.trim() || defaultCard.title;

                return (
                  <div
                    key={cardIndex}
                    className="rounded-[24px] border border-[#EAEAEA] bg-white p-5 shadow-sm"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-sm font-bold text-black">{cardTitle}</h4>
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`cards.${cardIndex}.title`}
                        rules={{ required: "عنوان البطاقة مطلوب" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[13px] font-bold text-black">
                              العنوان
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={defaultCard.title}
                                className="h-[48px] rounded-[14px] border-[#EEEEEE] bg-white px-4"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`cards.${cardIndex}.subtitle`}
                        rules={{ required: "الوصف المختصر مطلوب" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[13px] font-bold text-black">
                              الوصف المختصر
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={defaultCard.subtitle}
                                className="h-[48px] rounded-[14px] border-[#EEEEEE] bg-white px-4"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name={`cards.${cardIndex}.price`}
                          rules={{ required: "السعر مطلوب" }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[13px] font-bold text-black">
                                السعر
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder={defaultCard.price}
                                  className="h-[48px] rounded-[14px] border-[#EEEEEE] bg-white px-4"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`cards.${cardIndex}.durationLabel`}
                          rules={{ required: "مدة السعر مطلوبة" }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[13px] font-bold text-black">
                                وصف المدة
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder={defaultCard.durationLabel}
                                  className="h-[48px] rounded-[14px] border-[#EEEEEE] bg-white px-4"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <PricingFeaturesFields
                        control={form.control}
                        cardIndex={cardIndex}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

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
              "حفظ قسم الأسعار"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
