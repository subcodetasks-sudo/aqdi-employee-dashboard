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
import { FileText, ImageUp, Loader2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  createFileAsset,
  createImageAsset,
  getStringValue,
} from "@/src/lib/content-admin";
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const DEFAULT_VALUES = {
  badgeText: "جهات موثوقة ومعتمدة",
  mainTitle: "مرخصون من الجهات الرسمية",
  description: "نعمل وفق أنظمة معتمدة لضمان موثوقية وأمان جميع التعاملات.",
  cards: [
    {
      title: "شبكة إيجار",
      description: "منصة موثقة ومعتمدة رسميًا.",
      image: null,
      license: null,
    },
    {
      title: "الهيئة العامة للعقار",
      description: "ترخيص رسمي من الجهة المنظمة.",
      image: null,
      license: null,
    },
    {
      title: "المركز السعودي للأعمال",
      description: "سجل تجاري معتمد ومسجل.",
      image: null,
      license: null,
    },
  ],
};

const EMPTY_ASSET = {
  previewUrl: null,
  name: "",
  isPdf: false,
};

const EMPTY_CARD_ASSET = {
  image: { ...EMPTY_ASSET },
  license: { ...EMPTY_ASSET },
};

function createEmptyAssets() {
  return Array.from({ length: 3 }, () => ({
    image: { ...EMPTY_ASSET },
    license: { ...EMPTY_ASSET },
  }));
}

function revokeIfBlob(url) {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

export default function OfficialAuthoritiesForm({
  initialData,
  saveEndpoint,
  queryKey,
  sectionKey,
}) {
  const form = useForm({
    defaultValues: DEFAULT_VALUES,
  });
  const queryClient = useQueryClient();
  const [cardAssets, setCardAssets] = useState(createEmptyAssets);
  const cards = form.watch("cards");

  useEffect(() => {
    const nextCards = initialData?.cards?.length
      ? initialData.cards.map((card) => ({
          id: card.id ?? null,
          title: getStringValue(card.title),
          description: getStringValue(card.description),
          image: null,
          license: null,
          existingImageUrl: getStringValue(card.image_url),
          existingLicenseUrl: getStringValue(card.license_file_url),
        }))
      : DEFAULT_VALUES.cards.map((card) => ({
          ...card,
          existingImageUrl: "",
          existingLicenseUrl: "",
        }));

    form.reset({
      badgeText: getStringValue(initialData?.badge_text, DEFAULT_VALUES.badgeText),
      mainTitle: getStringValue(initialData?.main_title, DEFAULT_VALUES.mainTitle),
      description: getStringValue(initialData?.description, DEFAULT_VALUES.description),
      cards: nextCards,
    });
    setCardAssets(
      DEFAULT_VALUES.cards.map((_, index) => {
        const card = nextCards[index];

        return {
          image: createImageAsset(card?.existingImageUrl),
          license: createFileAsset(card?.existingLicenseUrl),
        };
      })
    );
  }, [form, initialData]);

  useEffect(() => {
    return () => {
      cardAssets.forEach((card) => {
        revokeIfBlob(card.image.previewUrl);
        revokeIfBlob(card.license.previewUrl);
      });
    };
  }, [cardAssets]);

  const updateCardAsset = (cardIndex, type, file) => {
    setCardAssets((current) => {
      const next = [...current];
      const previousAsset = next[cardIndex][type];
      revokeIfBlob(previousAsset.previewUrl);

      next[cardIndex] = {
        ...next[cardIndex],
        [type]: file
          ? {
              previewUrl: URL.createObjectURL(file),
              name: file.name,
              isPdf:
                file.type === "application/pdf" ||
                file.name.toLowerCase().endsWith(".pdf"),
            }
          : { ...EMPTY_ASSET },
      };

      return next;
    });
  };

  const removeCardAsset = (cardIndex, type) => {
    form.setValue(`cards.${cardIndex}.${type}`, null, { shouldValidate: true });
    updateCardAsset(cardIndex, type, null);
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
    formData.append("official_authorities[badge_text]", values.badgeText.trim());
    formData.append("official_authorities[main_title]", values.mainTitle.trim());
    formData.append("official_authorities[description]", values.description.trim());
    values.cards.forEach((card, index) => {
      if (card.id) {
        formData.append(`official_authorities[cards][${index}][id]`, String(card.id));
      }
      formData.append(`official_authorities[cards][${index}][title]`, card.title.trim());
      formData.append(
        `official_authorities[cards][${index}][description]`,
        card.description.trim()
      );
      if (card.image instanceof File) {
        formData.append(`official_authorities[cards][${index}][image]`, card.image);
      } else if (!cardAssets[index]?.image?.previewUrl && card.existingImageUrl) {
        formData.append(`official_authorities[cards][${index}][keep_image]`, "0");
      } else {
        formData.append(`official_authorities[cards][${index}][keep_image]`, "1");
      }
      if (card.license instanceof File) {
        formData.append(
          `official_authorities[cards][${index}][license_file]`,
          card.license
        );
      } else if (!cardAssets[index]?.license?.previewUrl && card.existingLicenseUrl) {
        formData.append(`official_authorities[cards][${index}][keep_license]`, "0");
      } else {
        formData.append(`official_authorities[cards][${index}][keep_license]`, "1");
      }
    });
    saveSection(formData);
  };

  return (
    <div className="rounded-[24px] border border-[#EEEEEE] bg-[#FCFCFC] p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-black">قسم الجهات الرسمية</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#707070]">
          عدل بيانات القسم العامة، ثم حدّث محتوى البطاقات الثابتة دون تغيير عددها أو
          ترتيبها.
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
                      placeholder="مثال: جهات موثوقة ومعتمدة"
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
                      placeholder="مثال: مرخصون من الجهات الرسمية"
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
              <h3 className="text-base font-bold text-black">محتوى البطاقات </h3>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {DEFAULT_VALUES.cards.map((defaultCard, cardIndex) => {
                const currentAssets = cardAssets[cardIndex] ?? EMPTY_CARD_ASSET;
                const imageAsset = currentAssets.image;
                const licenseAsset = currentAssets.license;
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
                                placeholder={defaultCard.description}
                                className="min-h-[96px] rounded-[16px] border-[#EEEEEE] bg-white px-4 py-3 text-sm leading-6 resize-none"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`cards.${cardIndex}.image`}
                        rules={{
                          validate: (value) => {
                            if (!value) return true;
                            if (!value.type?.startsWith("image/")) {
                              return "يجب اختيار ملف صورة فقط";
                            }
                            return true;
                          },
                        }}
                        render={({ field: { onChange, value, ...field } }) => (
                          <FormItem>
                            <FormLabel className="text-[13px] font-bold text-black">
                              صورة البطاقة
                            </FormLabel>
                            <FormControl>
                              <div className="rounded-[20px] border border-dashed border-[#D9D9D9] bg-[#FCFCFC] p-3">
                                {imageAsset.previewUrl ? (
                                  <div className="space-y-3">
                                    <div className="overflow-hidden rounded-[18px] border border-[#EEEEEE] bg-white">
                                      <img
                                        src={imageAsset.previewUrl}
                                        alt={`صورة البطاقة ${cardIndex + 1}`}
                                        className="h-40 w-full object-contain"
                                      />
                                    </div>

                                    <div className="flex items-center gap-2 max-md:flex-col max-md:items-stretch">
                                      <label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-[#D9D9D9] bg-white px-4 text-sm font-bold text-[#4D4D4D] transition-all hover:bg-[#FAFAFA]">
                                        <ImageUp className="size-4" />
                                        تغيير
                                        <input
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0] ?? null;
                                            onChange(file);
                                            updateCardAsset(cardIndex, "image", file);
                                            e.target.value = "";
                                          }}
                                          {...field}
                                        />
                                      </label>

                                      <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => removeCardAsset(cardIndex, "image")}
                                        className="rounded-full text-red-500 hover:bg-red-50 hover:text-red-600"
                                      >
                                        <Trash2 className="size-4" />
                                        حذف
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <label className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-[16px] bg-white px-4 py-6 text-center transition-all hover:bg-[#FAFAFA]">
                                    <ImageUp className="size-5 text-brand-hover" />
                                    <div>
                                      <p className="text-sm font-bold text-black">ارفع صورة البطاقة</p>
                                      <p className="mt-1 text-xs text-[#8A8A8A]">PNG, JPG, WEBP</p>
                                    </div>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0] ?? null;
                                        onChange(file);
                                        updateCardAsset(cardIndex, "image", file);
                                        e.target.value = "";
                                      }}
                                      {...field}
                                    />
                                  </label>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`cards.${cardIndex}.license`}
                        rules={{
                          validate: (value) => {
                            if (!value) return true;
                            const isImage = value.type?.startsWith("image/");
                            const isPdf =
                              value.type === "application/pdf" ||
                              value.name?.toLowerCase().endsWith(".pdf");
                            if (!isImage && !isPdf) {
                              return "الترخيص يجب أن يكون صورة أو PDF";
                            }
                            return true;
                          },
                        }}
                        render={({ field: { onChange, value, ...field } }) => (
                          <FormItem>
                            <FormLabel className="text-[13px] font-bold text-black">
                              ملف الترخيص
                            </FormLabel>
                            <FormControl>
                              <div className="rounded-[20px] border border-dashed border-[#D9D9D9] bg-[#FCFCFC] p-3">
                                {licenseAsset.previewUrl ? (
                                  <div className="space-y-3">
                                    <div className="rounded-[18px] border border-[#EEEEEE] bg-white p-4">
                                      {licenseAsset.isPdf ? (
                                        <div className="flex items-center gap-3">
                                          <div className="flex size-12 items-center justify-center rounded-full bg-red-50 text-red-500">
                                            <FileText className="size-5" />
                                          </div>
                                          <div className="min-w-0">
                                            <p className="truncate text-sm font-bold text-black">
                                              {licenseAsset.name}
                                            </p>
                                            <p className="text-xs text-[#8A8A8A]">PDF</p>
                                          </div>
                                        </div>
                                      ) : (
                                        <img
                                          src={licenseAsset.previewUrl}
                                          alt={`ترخيص البطاقة ${cardIndex + 1}`}
                                          className="h-40 w-full rounded-[12px] object-contain"
                                        />
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2 max-md:flex-col max-md:items-stretch">
                                      <label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-[#D9D9D9] bg-white px-4 text-sm font-bold text-[#4D4D4D] transition-all hover:bg-[#FAFAFA]">
                                        <ImageUp className="size-4" />
                                        تغيير
                                        <input
                                          type="file"
                                          accept="image/*,application/pdf"
                                          className="hidden"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0] ?? null;
                                            onChange(file);
                                            updateCardAsset(cardIndex, "license", file);
                                            e.target.value = "";
                                          }}
                                          {...field}
                                        />
                                      </label>

                                      <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => removeCardAsset(cardIndex, "license")}
                                        className="rounded-full text-red-500 hover:bg-red-50 hover:text-red-600"
                                      >
                                        <Trash2 className="size-4" />
                                        حذف
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <label className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-[16px] bg-white px-4 py-6 text-center transition-all hover:bg-[#FAFAFA]">
                                    <FileText className="size-5 text-brand-hover" />
                                    <div>
                                      <p className="text-sm font-bold text-black">ارفع ملف الترخيص</p>
                                      <p className="mt-1 text-xs text-[#8A8A8A]">
                                        صورة أو PDF
                                      </p>
                                    </div>
                                    <input
                                      type="file"
                                      accept="image/*,application/pdf"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0] ?? null;
                                        onChange(file);
                                        updateCardAsset(cardIndex, "license", file);
                                        e.target.value = "";
                                      }}
                                      {...field}
                                    />
                                  </label>
                                )}
                              </div>
                            </FormControl>
                            <FormDescription className="text-[#8A8A8A]">
                              يمكنك رفع صورة للترخيص أو ملف PDF.
                            </FormDescription>
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
              "حفظ قسم الجهات الرسمية"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
