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
import { ImageUp, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createImageAsset, getStringValue } from "@/src/lib/content-admin";
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const DEFAULT_VALUES = {
  sectionTitle: "كل ما تريد معرفته",
  sectionDescription:
    'يمكنك استخدام منصة "عقدي" لتوثيق عقودك السكنية والتجارية بسهولة ويسر.',
  mission: {
    badgeText: "الرسالة",
    title: "رسالتنا",
    description:
      "نقدم حلولًا عقارية موثوقة تركز على الكفاءة والفعالية لتشغيل أعمالنا وحماية الوقت، لنكون عنصرًا أساسيًا في نجاح شركائنا وموظفينا.",
    image: null,
  },
  vision: {
    badgeText: "الرؤية",
    title: "رؤيتنا..",
    description:
      "أن تكون إيجار الأولى في قطاع المنشآت العقارية ومرافق مستهدفات رؤية 2030.",
    image: null,
  },
};

function VisionMissionItem({
  form,
  sectionKey,
  title,
  preview,
  setPreview,
  uploadLabel,
}) {
  const updatePreview = (file) => {
    if (!file) {
      setPreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="rounded-[24px] border border-[#EAEAEA] bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h4 className="text-sm font-bold text-black">{title}</h4>
      </div>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name={`${sectionKey}.badgeText`}
          rules={{ required: "نص الشارة مطلوب" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[13px] font-bold text-black">الشارة</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="h-[48px] rounded-[14px] border-[#EEEEEE] bg-white px-4"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${sectionKey}.title`}
          rules={{ required: "العنوان مطلوب" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[13px] font-bold text-black">العنوان</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="h-[48px] rounded-[14px] border-[#EEEEEE] bg-white px-4"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${sectionKey}.description`}
          rules={{ required: "الوصف مطلوب" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[13px] font-bold text-black">الوصف</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  className="min-h-[110px] rounded-[16px] border-[#EEEEEE] bg-white px-4 py-3 text-sm leading-6 resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${sectionKey}.image`}
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
              <FormLabel className="text-[13px] font-bold text-black">صورة الجزء</FormLabel>
              <FormControl>
                <div className="rounded-[20px] border border-dashed border-[#D9D9D9] bg-[#FCFCFC] p-3">
                  {preview ? (
                    <div className="space-y-3">
                      <div className="relative h-[220px] w-full overflow-hidden rounded-[18px] border border-[#EEEEEE] bg-white">
                        <Image
                          src={preview}
                          alt={title}
                          fill
                          className="object-contain"
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
                              updatePreview(file);
                              e.target.value = "";
                            }}
                            {...field}
                          />
                        </label>

                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            form.setValue(`${sectionKey}.image`, null, {
                              shouldValidate: true,
                            });
                            setPreview(null);
                          }}
                          className="rounded-full text-red-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="size-4" />
                          حذف
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex min-h-[130px] cursor-pointer flex-col items-center justify-center gap-2 rounded-[16px] bg-white px-4 py-6 text-center transition-all hover:bg-[#FAFAFA]">
                      <ImageUp className="size-5 text-brand-hover" />
                      <div>
                        <p className="text-sm font-bold text-black">{uploadLabel}</p>
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
      </div>
    </div>
  );
}

export default function AboutVisionMissionSectionForm({
  initialData,
  saveEndpoint,
  queryKey,
  sectionKey,
}) {
  const form = useForm({
    defaultValues: DEFAULT_VALUES,
  });
  const queryClient = useQueryClient();
  const [missionPreview, setMissionPreview] = useState(null);
  const [visionPreview, setVisionPreview] = useState(null);

  useEffect(() => {
    form.reset({
      sectionTitle: getStringValue(initialData?.section_title, DEFAULT_VALUES.sectionTitle),
      sectionDescription: getStringValue(
        initialData?.section_description,
        DEFAULT_VALUES.sectionDescription
      ),
      mission: {
        badgeText: getStringValue(
          initialData?.mission?.badge_text,
          DEFAULT_VALUES.mission.badgeText
        ),
        title: getStringValue(initialData?.mission?.title, DEFAULT_VALUES.mission.title),
        description: getStringValue(
          initialData?.mission?.description,
          DEFAULT_VALUES.mission.description
        ),
        image: null,
        existingImageUrl: getStringValue(initialData?.mission?.image_url),
      },
      vision: {
        badgeText: getStringValue(
          initialData?.vision?.badge_text,
          DEFAULT_VALUES.vision.badgeText
        ),
        title: getStringValue(initialData?.vision?.title, DEFAULT_VALUES.vision.title),
        description: getStringValue(
          initialData?.vision?.description,
          DEFAULT_VALUES.vision.description
        ),
        image: null,
        existingImageUrl: getStringValue(initialData?.vision?.image_url),
      },
    });
    setMissionPreview(createImageAsset(initialData?.mission?.image_url).previewUrl);
    setVisionPreview(createImageAsset(initialData?.vision?.image_url).previewUrl);
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
    formData.append("vision_mission[section_title]", values.sectionTitle.trim());
    formData.append("vision_mission[section_description]", values.sectionDescription.trim());
    formData.append("vision_mission[mission][badge_text]", values.mission.badgeText.trim());
    formData.append("vision_mission[mission][title]", values.mission.title.trim());
    formData.append(
      "vision_mission[mission][description]",
      values.mission.description.trim()
    );
    if (values.mission.image instanceof File) {
      formData.append("vision_mission[mission][image]", values.mission.image);
    } else if (!missionPreview && values.mission.existingImageUrl) {
      formData.append("vision_mission[mission][keep_image]", "0");
    } else {
      formData.append("vision_mission[mission][keep_image]", "1");
    }
    formData.append("vision_mission[vision][badge_text]", values.vision.badgeText.trim());
    formData.append("vision_mission[vision][title]", values.vision.title.trim());
    formData.append(
      "vision_mission[vision][description]",
      values.vision.description.trim()
    );
    if (values.vision.image instanceof File) {
      formData.append("vision_mission[vision][image]", values.vision.image);
    } else if (!visionPreview && values.vision.existingImageUrl) {
      formData.append("vision_mission[vision][keep_image]", "0");
    } else {
      formData.append("vision_mission[vision][keep_image]", "1");
    }
    saveSection(formData);
  };

  return (
    <div className="rounded-[24px] border border-[#EEEEEE] bg-[#FCFCFC] p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-black">قسم الرؤية والرسالة</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[#707070]">
          عدل محتوى جزئي الرسالة والرؤية، مع صورة مستقلة لكل جزء.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-5">
            <FormField
              control={form.control}
              name="sectionTitle"
              rules={{ required: "عنوان القسم مطلوب" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[14px] font-bold text-black">
                    عنوان القسم
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="مثال: كل ما تريد معرفته"
                      className="h-[52px] rounded-[16px] border-[#EEEEEE] bg-white px-4"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sectionDescription"
              rules={{ required: "وصف القسم مطلوب" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[14px] font-bold text-black">
                    وصف القسم
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder='مثال: يمكنك استخدام منصة "عقدي" لتوثيق عقودك السكنية والتجارية بسهولة ويسر.'
                      className="min-h-[110px] rounded-[20px] border-[#EEEEEE] bg-white px-4 py-3 leading-7 resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <VisionMissionItem
              form={form}
              sectionKey="mission"
              title="الرسالة"
              preview={missionPreview}
              setPreview={setMissionPreview}
              uploadLabel="ارفع صورة الرسالة"
            />

            <VisionMissionItem
              form={form}
              sectionKey="vision"
              title="الرؤية"
              preview={visionPreview}
              setPreview={setVisionPreview}
              uploadLabel="ارفع صورة الرؤية"
            />
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
              "حفظ قسم الرؤية والرسالة"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
