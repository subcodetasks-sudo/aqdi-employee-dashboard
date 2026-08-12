"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { MOCK_INSTRUMENT_TYPES } from "../mock-data";
import { OutlineButton, PrimaryButton, SectionHeading, SettingsTable } from "../shared";

const TABLE_HEADERS = ["اسم الصك", "الاسم الظاهر", "إظهار في العقار", "إظهار في العقد"];

export default function InstrumentTypesTab() {
  const [rows, setRows] = useState(MOCK_INSTRUMENT_TYPES);
  const [editing, setEditing] = useState(null);
  const [label, setLabel] = useState("");

  const toggle = (id, key) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [key]: !row[key] } : row))
    );
  };

  const openEdit = (row) => {
    setEditing(row);
    setLabel(row.label);
  };

  const saveLabel = () => {
    if (!editing) return;
    setRows((prev) =>
      prev.map((row) => (row.id === editing.id ? { ...row, label } : row))
    );
    toast.success("تم تحديث الاسم الظاهر (واجهة تجريبية)");
    setEditing(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <SectionHeading
        title="أنواع الصكوك"
        description="إظهار أو إخفاء كل نوع صك في العقار والعقد، مع تعديل الاسم الظاهر"
      />

      <SettingsTable headers={TABLE_HEADERS}>
        {rows.map((row) => (
          <tr key={row.id} className="border-t border-[#EEF1F0] dark:border-white/[0.06]">
            <td className="px-4 py-4 text-[13px] font-bold text-[#111827] dark:text-white">
              {row.name}
            </td>
            <td className="px-4 py-4">
              <button
                type="button"
                onClick={() => openEdit(row)}
                className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#111827] hover:text-[#054D44]"
              >
                {row.label}
                <Pencil className="size-3.5 text-[#9CA3AF]" />
              </button>
            </td>
            <td className="px-4 py-4">
              <Switch
                dir="ltr"
                checked={row.showInProperty}
                onCheckedChange={() => toggle(row.id, "showInProperty")}
                className="data-[state=checked]:bg-[#054D44]"
              />
            </td>
            <td className="px-4 py-4">
              <Switch
                dir="ltr"
                checked={row.showInContract}
                onCheckedChange={() => toggle(row.id, "showInContract")}
                className="data-[state=checked]:bg-[#054D44]"
              />
            </td>
          </tr>
        ))}
      </SettingsTable>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">تعديل الاسم الظاهر</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-[#9CA3AF]">{editing?.name}</p>
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="h-11 rounded-xl"
          />
          <div className="flex justify-end gap-2">
            <OutlineButton onClick={() => setEditing(null)}>إلغاء</OutlineButton>
            <PrimaryButton onClick={saveLabel}>حفظ</PrimaryButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
