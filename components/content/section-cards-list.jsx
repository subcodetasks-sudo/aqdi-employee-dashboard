"use client";

import { useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionImageField from "@/components/content/section-image-field";
import SectionTextField from "@/components/content/section-text-field";
import { newLocalId } from "@/src/lib/content-admin";

/**
 * Repeating "cards" editor shared by the section forms
 * (features / story / beneficiaries / values). Owns the field array.
 *
 * `fieldsConfig`: [{ key, label, multiline?, rules?, placeholder? }]
 * `placeholder` may be a string or `(index) => string`.
 * `imageField`: optional `{ form, nameKey, initialUrlKey, label, uploadTitle, allowPdf }`
 *   renders a `SectionImageField` per card (needs the `form` instance).
 */
export default function SectionCardsList({
  control,
  name = "cards",
  heading,
  addLabel,
  emptyItem,
  lockedCount = 0,
  gridClassName = "xl:grid-cols-3",
  getCardTitle,
  fieldsConfig,
  imageField = null,
}) {
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-t border-[#ECECEC] pt-6 dark:border-white/10">
        <h3 className="text-base font-bold text-black dark:text-white">{heading}</h3>
        {addLabel ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ id: newLocalId(), ...emptyItem })}
            className="rounded-full"
          >
            <Plus className="size-4" />
            {addLabel}
          </Button>
        ) : null}
      </div>

      <div className={`grid gap-4 ${gridClassName}`}>
        {fields.map((item, index) => (
          <div
            key={item.id}
            className="rounded-[24px] border border-[#EAEAEA] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none"
          >
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-sm font-bold text-black dark:text-white">
                {getCardTitle(index)}
              </h4>
              {index >= lockedCount && fields.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                >
                  <Trash2 className="size-4" />
                </Button>
              ) : null}
            </div>

            <div className="space-y-4">
              {fieldsConfig.map((cfg) => (
                <SectionTextField
                  key={cfg.key}
                  control={control}
                  name={`${name}.${index}.${cfg.key}`}
                  label={cfg.label}
                  size="sm"
                  multiline={cfg.multiline}
                  rules={cfg.rules}
                  placeholder={
                    typeof cfg.placeholder === "function"
                      ? cfg.placeholder(index)
                      : cfg.placeholder
                  }
                />
              ))}
              {imageField ? (
                <SectionImageField
                  form={imageField.form}
                  name={`${name}.${index}.${imageField.nameKey || "image"}`}
                  removedFieldName={`${name}.${index}.${
                    imageField.nameKey || "image"
                  }Removed`}
                  initialUrl={
                    imageField.form.watch(
                      `${name}.${index}.${imageField.initialUrlKey || "imageUrl"}`
                    ) || ""
                  }
                  label={imageField.label || "صورة البطاقة"}
                  size="sm"
                  allowPdf={imageField.allowPdf}
                  uploadTitle={imageField.uploadTitle || "ارفع صورة البطاقة"}
                  previewClassName="h-40"
                />
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
