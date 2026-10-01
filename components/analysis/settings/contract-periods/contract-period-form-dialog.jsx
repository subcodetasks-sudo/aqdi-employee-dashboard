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
  ADMIN_CONTRACT_PERIODS_API,
  CONTRACT_PERIODS_QUERY_KEY,
  KNOWN_PERIODS,
  buildContractPeriodPayload,
  getKnownPeriodMonths,
} from "@/src/hooks/use-admin-contract-periods";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const CUSTOM_PERIOD = "__custom__";

const EMPTY_FORM = {
  periodChoice: "سنوي",
  customPeriod: "",
  note_ar: "",
  note_en: "",
  contract_type: "housing",
  price: "",
};

function itemToForm(item) {
  if (!item) return { ...EMPTY_FORM };
  const isKnown = KNOWN_PERIODS.some((period) => period.value === item.period);
  return {
    periodChoice: isKnown ? item.period : CUSTOM_PERIOD,
    customPeriod: isKnown ? "" : item.period || "",
    note_ar: item.note_ar || item.note || "",
    note_en: item.note_en || "",
    contract_type: item.contract_type || "housing",
    price: item.price == null || item.price === "" ? "" : String(item.price),
  };
}

function resolvePeriod(form) {
  return form.periodChoice === CUSTOM_PERIOD
    ? form.customPeriod
    : form.periodChoice;
}

export default function ContractPeriodFormDialog({ item = null }) {
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

  const selectedPeriod = resolvePeriod(form);
  const computedMonths = getKnownPeriodMonths(selectedPeriod.trim());

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const payload = buildContractPeriodPayload(
        { ...form, period: selectedPeriod },
        { isEdit }
      );
      if (isEdit) {
        return axiosInstance.post(`${ADMIN_CONTRACT_PERIODS_API}/${item.id}`, payload);
      }
      return axiosInstance.post(`${ADMIN_CONTRACT_PERIODS_API}/create`, payload);
    },
    onSuccess: (res) => {
      toast.success(
        res?.data?.message ||
          (isEdit ? "تم تعديل مدة العقد بنجاح" : "تم إضافة مدة العقد بنجاح")
      );
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: [CONTRACT_PERIODS_QUERY_KEY] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          (isEdit ? "حدث خطأ أثناء تعديل مدة العقد" : "حدث خطأ أثناء إضافة مدة العقد")
      );
    },
  });

  const handleSubmit = () => {
    if (!selectedPeriod.trim() || !form.note_ar.trim() || !form.contract_type) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    if (form.price !== "" && form.price != null) {
      const price = Number(form.price);
      if (!Number.isFinite(price) || price < 0) {
        toast.error("السعر يجب أن يكون رقماً أكبر من أو يساوي صفر");
        return;
      }
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
        <SettingsFieldLabel required>مدة العقد</SettingsFieldLabel>
        <Select dir="rtl" value={form.periodChoice} onValueChange={(value) => setField("periodChoice", value)}>
          <SelectTrigger className={settingsFieldClass}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent dir="rtl">
            {KNOWN_PERIODS.map((period) => (
              <SelectItem key={period.value} value={period.value}>
                {period.value}
              </SelectItem>
            ))}
            <SelectItem value={CUSTOM_PERIOD}>أخرى</SelectItem>
          </SelectContent>
        </Select>
      </label>

      {form.periodChoice === CUSTOM_PERIOD ? (
        <label className="flex flex-col gap-1.5">
          <SettingsFieldLabel required>اسم المدة</SettingsFieldLabel>
          <Input
            placeholder="أدخل اسم المدة ..."
            value={form.customPeriod}
            onChange={(e) => setField("customPeriod", e.target.value)}
            className={settingsFieldClass}
          />
        </label>
      ) : null}

      <p className="text-[12px] font-medium text-[#6B7280] dark:text-white/55">
        {computedMonths
          ? `يُحسب إجمالي الأشهر تلقائياً: ${computedMonths}`
          : "قيمة أخرى = بدون عدد أشهر محدد"}
      </p>

      <label className="flex flex-col gap-1.5">
        <SettingsFieldLabel required>الملاحظة بالعربية</SettingsFieldLabel>
        <Input
          placeholder="مثال: سنة واحدة"
          value={form.note_ar}
          onChange={(e) => setField("note_ar", e.target.value)}
          className={settingsFieldClass}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <SettingsFieldLabel>الملاحظة بالإنجليزية</SettingsFieldLabel>
        <Input
          placeholder="Example: One year"
          value={form.note_en}
          onChange={(e) => setField("note_en", e.target.value)}
          className={settingsFieldClass}
          dir="ltr"
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

      <label className="flex flex-col gap-1.5">
        <SettingsFieldLabel>السعر</SettingsFieldLabel>
        <Input
          type="number"
          min="0"
          step="0.01"
          placeholder="اختياري"
          value={form.price}
          onChange={(e) => setField("price", e.target.value)}
          className={settingsFieldClass}
        />
      </label>
    </SettingsFormDialog>
  );
}
