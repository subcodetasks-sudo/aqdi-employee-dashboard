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
  badgeText: "قيمنا",
  mainTitle: "قيم عقدي",
  description:
    "يهدف (إيجار) إلى تنظيم قطاع الإيجار العقاري في المملكة العربية السعودية بصورة متوازنة تحفظ حقوق أطراف العملية الإيجارية.",
  cards: [
    {
      title: "نحو إدارة واضحة ومسؤولة",
      description:
        "نوفر معلومات واضحة ومحدثة بشكل كامل للجمهور بشفافية لتعزيز قيم المواطنين.",
    },
    {
      title: "أساس علاقتنا مع المواطن",
      description:
        "يمكنكم تستند إلى مبادئ شفافة ومعلومات دقيقة لخدمتكم بكفاءة.",
    },
    {
      title: "خدمة فعالة ورؤية واضحة",
      description:
        "نوفر معلومات واضحة ومحدثة بشكل كامل للجمهور بشفافية لتعزيز قيم المواطنين.",
    },
  ],
};

const INITIAL_CARDS_COUNT = DEFAULT_VALUES.cards.length;

export default function AboutValuesSectionForm({
  initialData,
  saveEndpoint,
  queryKey,
}) {
  const form = useForm({
    defaultValues: DEFAULT_VALUES,
  });
  const queryClient = useQueryClient();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "cards",
  });
  const cards = form.watch("cards");

  useEffect(() => {
    const nextCards = initialData?.cards?.length
      ? initialData.cards.map((card) => ({
          id: card.id ?? null,
          title: getStringValue(card.title),
          description: getStringValue(card.description),
        }))
      : DEFAULT_VALUES.cards;

    form.reset({
      badgeText: getStringValue(initialData?.badge_text, DEFAULT_VALUES.badgeText),
      mainTitle: getStringValue(initialData?.main_title, DEFAULT_VALUES.mainTitle),
      description: getStringValue(initialData?.description, DEFAULT_VALUES.description),
      cards: nextCards,
    });
  }, [form, initialData]);

  const addCard = () => {
    append({
      title: "",
      description: "",
    });
  };

  const removeCard = (cardIndex) => {
    remove(cardIndex);
  };

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
    formData.append("values[badge_text]", values.badgeText.trim());
    formData.append("values[main_title]", values.mainTitle.trim());
    formData.append("values[description]", values.description.trim());
    values.cards.forEach((card, index) => {
      if (card.id) formData.append(`values[cards][${index}][id]`, String(card.id));
      formData.append(`values[cards][${index}][title]`, card.title.trim());
      formData.append(`values[cards][${index}][description]`, card.description.trim());
    });
    saveSection(formData);
  };

  return (
    <div className="rounded-[24px] border border-[#EEEEEE] bg-[#FCFCFC] p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-black">قسم قيم عقدي</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#707070]">
          عدل الشارة والعنوان والوصف، ثم حدّث البطاقات الثلاث الأساسية مع إمكانية
          إضافة بطاقات جديدة.
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
                      placeholder="مثال: قيمنا"
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
                      placeholder="مثال: قيم عقدي"
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
                      placeholder="أدخل وصف القسم"
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
              <Button
                type="button"
                variant="outline"
                onClick={addCard}
                className="rounded-full"
              >
                <Plus className="size-4" />
                إضافة بطاقة
              </Button>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              {fields.map((fieldItem, cardIndex) => {
                const defaultCard = DEFAULT_VALUES.cards[cardIndex] || {
                  title: "",
                  description: "",
                };
                const cardTitle =
                  cards?.[cardIndex]?.title?.trim() ||
                  defaultCard.title ||
                  `بطاقة ${cardIndex + 1}`;

                return (
                  <div
                    key={fieldItem.id}
                    className="rounded-[24px] border border-[#EAEAEA] bg-white p-5 shadow-sm"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-sm font-bold text-black">{cardTitle}</h4>
                      {cardIndex >= INITIAL_CARDS_COUNT ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCard(cardIndex)}
                          className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      ) : null}
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
                                placeholder={defaultCard.title || "أدخل عنوان البطاقة"}
                                className="h-[48px] rounded-[14px] border-[#EEEEEE] bg-white px-4"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`cards.${cardIndex}.description`}
                        rules={{ required: "وصف البطاقة مطلوب" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[13px] font-bold text-black">
                              الوصف
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder={defaultCard.description || "أدخل وصف البطاقة"}
                                className="min-h-[96px] rounded-[16px] border-[#EEEEEE] bg-white px-4 py-3 text-sm leading-6 resize-none"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
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
              "حفظ قسم قيم عقدي"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
