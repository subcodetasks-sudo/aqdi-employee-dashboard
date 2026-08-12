"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DOCUMENT_TYPES, MOCK_GUIDANCE_ROWS } from "../mock-data";
import {
  GhostAddButton,
  OutlineButton,
  PrimaryButton,
  SectionHeading,
  SettingsTable,
  StatusBadge,
} from "../shared";

const EMPTY_FORM = {
  documentType: DOCUMENT_TYPES[0],
  contractPopup: true,
  propertyPopup: false,
  content: "",
  buttonText: "",
  buttonLink: "",
};

const TABLE_HEADERS = [
  "نوع الوثيقة",
  "بوب أب العقد",
  "بوب أب العقار",
  "محتوى البوب أب",
  "نص الزر",
  "رابط الزر",
  "الإجراءات",
];

export default function GuidanceContentTab() {
  const [rows, setRows] = useState(MOCK_GUIDANCE_ROWS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const unusedTypes = useMemo(
    () => DOCUMENT_TYPES.filter((type) => !rows.some((row) => row.documentType === type)),
    [rows]
  );

  const availableTypes = editingId
    ? [form.documentType, ...unusedTypes.filter((type) => type !== form.documentType)]
    : unusedTypes;

  const openAdd = () => {
    if (unusedTypes.length === 0) return;
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      documentType: unusedTypes[0],
    });
    setDialogOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({
      documentType: row.documentType,
      contractPopup: row.contractPopup,
      propertyPopup: row.propertyPopup,
      content: row.content,
      buttonText: row.buttonText,
      buttonLink: row.buttonLink,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.content.trim()) {
      toast.error("أدخل محتوى البوب أب");
      return;
    }

    if (editingId) {
      setRows((prev) =>
        prev.map((row) => (row.id === editingId ? { ...row, ...form } : row))
      );
      toast.success("تم تحديث المحتوى (واجهة تجريبية)");
    } else {
      setRows((prev) => [...prev, { id: Date.now(), ...form }]);
      toast.success("تمت إضافة المحتوى (واجهة تجريبية)");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
    toast.success("تم الحذف (واجهة تجريبية)");
  };

  return (
    <div className="flex flex-col gap-4">
      <SectionHeading
        title="محتوى إرشادي للعقود"
        description="إدارة محتوى البوب أب حسب نوع الوثيقة"
        action={
          <GhostAddButton onClick={openAdd} disabled={unusedTypes.length === 0}>
            + إضافة
          </GhostAddButton>
        }
      />

      <SettingsTable headers={TABLE_HEADERS}>
        {rows.length === 0 ? (
          <tr>
            <td
              colSpan={TABLE_HEADERS.length}
              className="px-4 py-16 text-center text-[13px] text-[#9CA3AF]"
            >
              لا يوجد محتوى إرشادي بعد
            </td>
          </tr>
        ) : (
          rows.map((row) => (
            <tr key={row.id} className="border-t border-[#EEF1F0] dark:border-white/[0.06]">
              <td className="px-4 py-4 text-[13px] font-bold text-[#111827] dark:text-white whitespace-nowrap">
                {row.documentType}
              </td>
              <td className="px-4 py-4">
                <StatusBadge active={row.contractPopup} />
              </td>
              <td className="px-4 py-4">
                <StatusBadge active={row.propertyPopup} />
              </td>
              <td className="px-4 py-4 text-[13px] text-[#374151] dark:text-white/70 max-w-[280px]">
                <span className="line-clamp-2">{row.content}</span>
              </td>
              <td className="px-4 py-4 text-[13px] font-medium text-[#111827] dark:text-white whitespace-nowrap">
                {row.buttonText || "-"}
              </td>
              <td className="px-4 py-4 text-[12px] text-[#6B7280] whitespace-nowrap" dir="ltr">
                {row.buttonLink || "-"}
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <OutlineButton onClick={() => openEdit(row)}>تعديل</OutlineButton>
                  <OutlineButton tone="danger" onClick={() => handleDelete(row.id)}>
                    حذف
                  </OutlineButton>
                </div>
              </td>
            </tr>
          ))
        )}
      </SettingsTable>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">
              {editingId ? "تعديل المحتوى الإرشادي" : "إضافة محتوى إرشادي"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 text-right">
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-bold">نوع الوثيقة</span>
              <select
                value={form.documentType}
                onChange={(e) => setForm((prev) => ({ ...prev, documentType: e.target.value }))}
                className="h-11 rounded-xl border border-[#E6EBE9] bg-white px-3 text-[13px] focus:outline-none focus:border-[#054D44]"
              >
                {availableTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center justify-between rounded-xl border border-[#E6EBE9] px-3 py-2.5">
                <span className="text-[13px] font-bold">بوب أب العقد</span>
                <Switch
                  dir="ltr"
                  checked={form.contractPopup}
                  onCheckedChange={(checked) => setForm((prev) => ({ ...prev, contractPopup: checked }))}
                  className="data-[state=checked]:bg-[#054D44]"
                />
              </label>
              <label className="flex items-center justify-between rounded-xl border border-[#E6EBE9] px-3 py-2.5">
                <span className="text-[13px] font-bold">بوب أب العقار</span>
                <Switch
                  dir="ltr"
                  checked={form.propertyPopup}
                  onCheckedChange={(checked) => setForm((prev) => ({ ...prev, propertyPopup: checked }))}
                  className="data-[state=checked]:bg-[#054D44]"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-bold">محتوى البوب أب</span>
              <Textarea
                rows={4}
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                className="rounded-xl resize-none"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-bold">نص الزر</span>
                <Input
                  value={form.buttonText}
                  onChange={(e) => setForm((prev) => ({ ...prev, buttonText: e.target.value }))}
                  className="h-11 rounded-xl"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[13px] font-bold">رابط الزر</span>
                <Input
                  dir="ltr"
                  value={form.buttonLink}
                  onChange={(e) => setForm((prev) => ({ ...prev, buttonLink: e.target.value }))}
                  className="h-11 rounded-xl"
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <OutlineButton onClick={() => setDialogOpen(false)}>إلغاء</OutlineButton>
              <PrimaryButton onClick={handleSave}>حفظ</PrimaryButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
