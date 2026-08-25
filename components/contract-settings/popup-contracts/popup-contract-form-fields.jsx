"use client";

import TextEditor from "@/components/analysis/settings/terms/TextEditor";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { getPopupInstrumentTypeOptions } from "@/src/lib/popup-contracts";

export default function PopupContractFormFields({
  instrumentType,
  onInstrumentTypeChange,
  popupStatusContract,
  onPopupStatusContractChange,
  popupStatusRealestate,
  onPopupStatusRealestateChange,
  contentPopup,
  onContentPopupChange,
  contentEditorKey = 0,
  buttonText,
  onButtonTextChange,
  buttonLink,
  onButtonLinkChange,
  instrumentOptions,
  instrumentTypeDisabled = false,
}) {
  const options = instrumentOptions ?? getPopupInstrumentTypeOptions();

  return (
    <div dir="rtl" className="space-y-4 text-right">
      <div className="space-y-2">
        <label className="text-sm font-medium">
          نوع الوثيقة <span className="text-red-500">*</span>
        </label>
        <Select
          dir="rtl"
          value={instrumentType}
          onValueChange={onInstrumentTypeChange}
          disabled={instrumentTypeDisabled || options.length === 0}
        >
          <SelectTrigger className="h-12 rounded-2xl">
            <SelectValue
              placeholder={
                options.length === 0
                  ? "لا توجد أنواع متاحة للإضافة"
                  : "اختر نوع الوثيقة"
              }
            />
          </SelectTrigger>
          <SelectContent dir="rtl">
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-2xl border border-surface-border bg-neutral-50 px-4 py-3">
          <label className="text-sm font-medium">حالة بوب أب العقد</label>
          <Switch
            dir="ltr"
            checked={popupStatusContract}
            onCheckedChange={onPopupStatusContractChange}
          />
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-surface-border bg-neutral-50 px-4 py-3">
          <label className="text-sm font-medium">حالة بوب أب العقار</label>
          <Switch
            dir="ltr"
            checked={popupStatusRealestate}
            onCheckedChange={onPopupStatusRealestateChange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          محتوى البوب أب <span className="text-red-500">*</span>
        </label>
        <div className="min-h-[280px]">
          <TextEditor
            key={contentEditorKey}
            initialContent={contentPopup}
            placeholder="اكتب محتوى البوب أب هنا ..."
            onChange={(value) => onContentPopupChange(value?.html || "")}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">نص الزر الإضافي</label>
          <Input
            placeholder="مثال: ابدأ الآن"
            value={buttonText}
            onChange={(e) => onButtonTextChange(e.target.value)}
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">رابط الزر الإضافي</label>
          <Input
            placeholder="https://example.com/start"
            value={buttonLink}
            onChange={(e) => onButtonLinkChange(e.target.value)}
            className="h-12"
          />
        </div>
      </div>
    </div>
  );
}
