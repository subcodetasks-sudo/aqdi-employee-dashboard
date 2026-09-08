"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FileText, ImageUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { getFileNameFromUrl, isPdfUrl } from "@/src/lib/content-admin";

const fileIsPdf = (file) =>
  file?.type === "application/pdf" ||
  Boolean(file?.name?.toLowerCase().endsWith(".pdf"));

function defaultValidate(file, allowPdf) {
  if (!file) return true;
  if (file.type?.startsWith("image/")) return true;
  if (allowPdf && fileIsPdf(file)) return true;
  return allowPdf ? "الملف يجب أن يكون صورة أو PDF" : "يجب اختيار ملف صورة فقط";
}

/**
 * Self-contained image/PDF upload field for the content-admin section forms.
 *
 * - `name` holds the picked `File` (or `null`) on the form.
 * - Whether an existing asset was removed is mirrored to `removedFieldName`
 *   (default `${name}Removed`) so the submit handler can call
 *   `assetFormValue(values[name], values[removedFieldName], ...)`.
 * - Owns the preview lifecycle, revoking every blob URL it creates.
 */
export default function SectionImageField({
  form,
  name,
  removedFieldName = `${name}Removed`,
  initialUrl = "",
  label,
  uploadTitle,
  hint,
  description,
  allowPdf = false,
  size = "md",
  previewClassName = "h-[320px]",
}) {
  const watchedValue = form.watch(name);
  const file = watchedValue instanceof File ? watchedValue : null;
  const [removed, setRemoved] = useState(false);
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    if (!file) {
      setBlobUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // A fresh initialUrl means new server data landed — drop the local "removed" flag.
  useEffect(() => {
    setRemoved(false);
  }, [initialUrl]);

  useEffect(() => {
    form.setValue(removedFieldName, removed);
  }, [removed, form, removedFieldName]);

  const preview = blobUrl || (removed ? "" : initialUrl) || "";
  const isPdf = file ? fileIsPdf(file) : !removed && isPdfUrl(initialUrl);
  const fileName = file?.name || getFileNameFromUrl(removed ? "" : initialUrl);
  const accept = allowPdf ? "image/*,application/pdf" : "image/*";
  const compact = size === "sm";

  return (
    <FormField
      control={form.control}
      name={name}
      rules={{ validate: (value) => defaultValidate(value, allowPdf) }}
      render={({ field: { onChange } }) => {
        const pickFile = (event) => {
          const nextFile = event.target.files?.[0] ?? null;
          onChange(nextFile);
          if (nextFile) setRemoved(false);
          event.target.value = "";
        };
        const clearFile = () => {
          onChange(null);
          setRemoved(true);
        };
        const fileInput = (
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={pickFile}
          />
        );

        return (
          <FormItem>
            {label ? (
              <FormLabel
                className={
                  compact
                    ? "text-[13px] font-bold text-black dark:text-white"
                    : "text-[14px] font-bold text-black dark:text-white"
                }
              >
                {label}
              </FormLabel>
            ) : null}
            <FormControl>
              <div className="rounded-[24px] border border-dashed border-[#D9D9D9] bg-white p-4 dark:border-white/15 dark:bg-white/[0.03]">
                {preview ? (
                  <div className="space-y-4">
                    <div
                      className={`relative w-full overflow-hidden rounded-[20px] border border-[#EEEEEE] bg-[#FAFAFA] dark:border-white/10 dark:bg-white/[0.04] ${previewClassName}`}
                    >
                      {isPdf ? (
                        <div className="flex h-full items-center gap-3 p-4">
                          <div className="flex size-12 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/15">
                            <FileText className="size-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-black dark:text-white">
                              {fileName}
                            </p>
                            <p className="text-xs text-[#8A8A8A] dark:text-white/40">
                              PDF
                            </p>
                          </div>
                        </div>
                      ) : (
                        <Image
                          src={preview}
                          alt={label || uploadTitle || "معاينة"}
                          fill
                          unoptimized
                          className="object-contain"
                        />
                      )}
                    </div>

                    <div className="flex items-center gap-3 max-md:flex-col max-md:items-stretch">
                      <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-[#D9D9D9] bg-white px-5 text-sm font-bold text-[#4D4D4D] transition-all hover:bg-[#FAFAFA] dark:border-white/15 dark:bg-white/[0.04] dark:text-white/70 dark:hover:bg-white/[0.08]">
                        <ImageUp className="size-4" />
                        تغيير
                        {fileInput}
                      </label>

                      <Button
                        type="button"
                        variant="ghost"
                        onClick={clearFile}
                        className="rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                      >
                        <Trash2 className="size-4" />
                        حذف
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center gap-3 rounded-[20px] bg-white px-6 py-8 text-center transition-all hover:bg-[#FAFAFA] dark:bg-white/[0.02] dark:hover:bg-white/[0.06]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F4F7FF] text-brand-main dark:bg-white/10">
                      {allowPdf ? (
                        <FileText className="size-5" />
                      ) : (
                        <ImageUp className="size-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-black dark:text-white">
                        {uploadTitle}
                      </p>
                      <p className="mt-1 text-xs text-[#8A8A8A] dark:text-white/40">
                        {hint || (allowPdf ? "صورة أو PDF" : "PNG, JPG, WEBP")}
                      </p>
                    </div>
                    {fileInput}
                  </label>
                )}
              </div>
            </FormControl>
            {description ? (
              <FormDescription className="text-[#8A8A8A] dark:text-white/40">
                {description}
              </FormDescription>
            ) : null}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
