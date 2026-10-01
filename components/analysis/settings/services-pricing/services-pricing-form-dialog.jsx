"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SettingsFormDialog, {
  SettingsFieldLabel,
  settingsFieldClass,
} from "@/components/system-settings/settings-form-dialog";
import {
  SETTINGS_EDIT_TRIGGER_CLASS,
  SettingsAddTrigger,
} from "@/components/system-settings/shared";
import { axiosInstance } from "@/src/utils/axios";
import {
  ADMIN_SERVICES_PRICING_API,
  SERVICES_PRICING_QUERY_KEY,
  buildServicesPricingPayload,
} from "@/src/hooks/use-admin-services-pricing";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const EMPTY_FORM = {
  name_ar: "",
  name_en: "",
  price: "",
  contract_type: "housing",
};

function itemToForm(item) {
  if (!item) return { ...EMPTY_FORM };
  return {
    name_ar: item.name_ar || item.name || "",
    name_en: item.name_en || "",
    price: item.price == null || item.price === "" ? "" : String(item.price),
    contract_type: item.contract_type || "housing",
  };
}

export default function ServicesPricingFormDialog({ item = null }) {
  const isEdit = Boolean(item?.id);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const queryClient = useQueryClient();

  const [prevOpen, setPrevOpen] = useState(false);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setForm(isEdit ? itemToForm(item) : { ...EMPTY_FORM });
  }

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const payload = buildServicesPricingPayload(form);
      if (isEdit) {
        return axiosInstance.post(`${ADMIN_SERVICES_PRICING_API}/${item.id}`, payload);
      }
      return axiosInstance.post(ADMIN_SERVICES_PRICING_API, payload);
    },
    onSuccess: (res) => {
      toast.success(
        res?.data?.message ||
          (isEdit ? "تم تعديل سعر الخدمة بنجاح" : "تم إضافة سعر الخدمة بنجاح")
      );
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: [SERVICES_PRICING_QUERY_KEY] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          (isEdit ? "حدث خطأ أثناء تعديل سعر الخدمة" : "حدث خطأ أثناء إضافة سعر الخدمة")
      );
    },
  });

  const handleSubmit = () => {
    if (!form.name_ar.trim() || !form.contract_type) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const price = Number(form.price);
    if (form.price === "" || form.price == null || !Number.isFinite(price) || price < 0) {
      toast.error("السعر يجب أن يكون رقماً أكبر من أو يساوي صفر");
      return;
    }

    mutate();
  };

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        isEdit ? (
          <button type="button" className={SETTINGS_EDIT_TRIGGER_CLASS}>
            تعديل
          </button>
        ) : (
          <SettingsAddTrigger />
        )
      }
      title={isEdit ? "تعديل العنصر" : "عنصر جديد"}
      onSubmit={handleSubmit}
      submitLabel="حفظ"
      isPending={isPending}
    >
      <label className="flex flex-col gap-1.5">
        <SettingsFieldLabel required>الاسم بالعربية</SettingsFieldLabel>
        <Input
          placeholder="مثال: توثيق عقد إيجار سكني"
          value={form.name_ar}
          onChange={(e) => setField("name_ar", e.target.value)}
          className={settingsFieldClass}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <SettingsFieldLabel>الاسم بالإنجليزية</SettingsFieldLabel>
        <Input
          placeholder="Example: Housing contract certification"
          value={form.name_en}
          onChange={(e) => setField("name_en", e.target.value)}
          className={settingsFieldClass}
          dir="ltr"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <SettingsFieldLabel required>السعر</SettingsFieldLabel>
        <Input
          type="number"
          min="0"
          step="0.01"
          placeholder="150"
          value={form.price}
          onChange={(e) => setField("price", e.target.value)}
          className={settingsFieldClass}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <SettingsFieldLabel required>نوع العقد</SettingsFieldLabel>
        <Select dir="rtl" value={form.contract_type} onValueChange={(value) => setField("contract_type", value)}>
          <SelectTrigger className={settingsFieldClass}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent dir="rtl">
            <SelectItem value="housing">سكني</SelectItem>
            <SelectItem value="commercial">تجاري</SelectItem>
          </SelectContent>
        </Select>
      </label>
    </SettingsFormDialog>
  );
}
