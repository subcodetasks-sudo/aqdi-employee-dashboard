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
import { ImageUp, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getStringValue } from "@/src/lib/content-admin";
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const DEFAULT_VALUES = {
  badgeText: "عقدك الموثق من شبكة ايجار خلال دقائق",
  mainTitle: "عقد إيجار إلكتروني موثق..",
  description:
    "عقود إيجار معتمدة وموثقة عبر منصة إيجار الإلكترونية، بخطوات بسيطة وآمنة تضمن حقوق جميع الأطراف.",
  image: undefined,
};

export default function HeroContentForm({
  initialData,
  saveEndpoint,
  queryKey,
  sectionKey,
}) {
  const form = useForm({
    defaultValues: DEFAULT_VALUES,
  });
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  useEffect(() => {
    form.reset({
      badgeText: getStringValue(initialData?.badge_text, DEFAULT_VALUES.badgeText),
      mainTitle: getStringValue(initialData?.main_title, DEFAULT_VALUES.mainTitle),
      description: getStringValue(initialData?.description, DEFAULT_VALUES.description),
      image: null,
    });
    setPreview(initialData?.image_url || null);
    setRemoveImage(false);
  }, [form, initialData]);

  const updatePreview = (file) => {
    if (!file) {
      setPreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
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
    formData.append("hero[badge_text]", values.badgeText.trim());
    formData.append("hero[main_title]", values.mainTitle.trim());
    formData.append("hero[description]", values.description.trim());
    if (values.image instanceof File) {
      formData.append("hero[image]", values.image);
    } else if (removeImage) {
      formData.append("hero[keep_image]", "0");
    } else {
      formData.append("hero[keep_image]", "1");
    }
    saveSection(formData);
  };

  return (
    <div className="rounded-[24px] border border-[#EEEEEE] bg-[#FCFCFC] p-6">
      <div className="mb-6 flex items-start justify-between gap-4 max-md:flex-col">
        <div>
          <h2 className="text-lg font-bold text-black">القسم الرئيسي</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#707070]">
            أضف النصوص الأساسية والصورة الخاصة بأول جزء يظهر للزائر في الصفحة
            الرئيسية.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="badgeText"
            rules={{ required: "نص الشارة مطلوب" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[14px] font-bold text-black">
                  نص الشارة
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="مثال: عقدك الموثق من شبكة ايجار خلال دقائق"
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
                    placeholder="مثال: عقد إيجار إلكتروني موثق.."
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
                <FormLabel className="text-[14px] font-bold text-black">
                  الوصف
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="أدخل الوصف التعريفي للقسم الرئيسي"
                    className="min-h-[140px] rounded-[20px] border-[#EEEEEE] bg-white px-4 py-3 leading-7 resize-none"
                  />
                </FormControl>
                <FormDescription className="text-[#8A8A8A]">
                  يظهر هذا النص أسفل العنوان الرئيسي في واجهة الموقع.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image"
            rules={{
              validate: (value) => {
                const file = value;
                if (!file) return true;
                if (!file.type.startsWith("image/")) return "يجب اختيار ملف صورة فقط";
                return true;
              },
            }}
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem>
                <FormLabel className="text-[14px] font-bold text-black">
                  صورة القسم
                </FormLabel>
                <FormControl>
                  <div className="rounded-[24px] border border-dashed border-[#D9D9D9] bg-white p-4">
                    {preview ? (
                      <div className="space-y-4">
                        <div className="relative  aspect-square h-80 w-full overflow-hidden rounded-[20px] border border-[#EEEEEE] bg-[#FAFAFA]">
                          <Image
                            src={preview}
                            alt="صورة القسم الرئيسي"
                            fill
                            className="object-contain"
                          />
                        </div>

                        <div className="flex items-center gap-3 max-md:flex-col max-md:items-stretch">
                          <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-[#D9D9D9] bg-white px-5 text-sm font-bold text-[#4D4D4D] transition-all hover:bg-[#FAFAFA]">
                            <ImageUp className="size-4" />
                            تغيير الصورة
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0] ?? null;
                                onChange(file);
                                updatePreview(file);
                                setRemoveImage(false);
                                e.target.value = "";
                              }}
                              {...field}
                            />
                          </label>

                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              form.setValue("image", null, { shouldValidate: true });
                              setPreview(null);
                              setRemoveImage(true);
                            }}
                            className="h-11 rounded-full px-5 text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="size-4" />
                            حذف الصورة
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-3 rounded-[20px] bg-white px-6 py-8 text-center transition-all hover:bg-[#FAFAFA]">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F4F7FF] text-brand-hover">
                          <ImageUp className="size-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-black">ارفع صورة القسم الرئيسي</p>
                          <p className="mt-1 text-xs text-[#8A8A8A]">PNG, JPG, WEBP</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            onChange(file);
                            updatePreview(file);
                            setRemoveImage(false);
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
