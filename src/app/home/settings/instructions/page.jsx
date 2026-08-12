"use client";

import { useMemo, useState } from "react";
import { INSTRUCTION_IMAGE_SECTIONS } from "@/components/analysis/settings/instructions/instruction-images-data";
import EditInstructionImageDialog from "@/components/analysis/settings/instructions/edit-instruction-image-dialog";
import ViewInstructionImageDialog from "@/components/analysis/settings/instructions/view-instruction-image-dialog";
import {
  SETTINGS_EDIT_TRIGGER_CLASS,
  SETTINGS_VIEW_TRIGGER_CLASS,
  SettingsEmptyRow,
  SettingsListHeader,
  SettingsTable,
  SettingsTableRow,
  SettingsTd,
  StatusBadge,
} from "@/components/SystemSettings/shared";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const HEADERS = [
  "القسم",
  "الوصف",
  { label: "الحالة", className: "text-center" },
  { label: "الإجراءات", className: "text-left" },
];

export default function InstructionsPage() {
  const [enabledMap, setEnabledMap] = useState(() =>
    Object.fromEntries(INSTRUCTION_IMAGE_SECTIONS.map((s) => [s.id, s.enabled]))
  );
  const [editItem, setEditItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);

  const handleToggle = (id, checked) => {
    setEnabledMap((prev) => ({ ...prev, [id]: checked }));
    toast.success(checked ? "تم تفعيل القسم" : "تم تعطيل القسم");
  };

  const editDialogItem = useMemo(
    () => INSTRUCTION_IMAGE_SECTIONS.find((s) => s.id === editItem?.id) ?? editItem,
    [editItem]
  );

  return (
    <div className="flex flex-col gap-5 min-h-full" dir="rtl">
      <SettingsListHeader title="التعليمات (صور إرشادية)" />

      <SettingsTable headers={HEADERS} minWidth="760px">
        {INSTRUCTION_IMAGE_SECTIONS.length === 0 ? (
          <SettingsEmptyRow colSpan={4} />
        ) : (
          INSTRUCTION_IMAGE_SECTIONS.map((item) => {
            const enabled = enabledMap[item.id] ?? false;
            return (
              <SettingsTableRow key={item.id}>
                <SettingsTd className="font-bold">{item.title}</SettingsTd>
                <SettingsTd className="text-[#6B7280]">{item.description}</SettingsTd>
                <SettingsTd className="text-center">
                  <div className="inline-flex items-center gap-2">
                    <StatusBadge active={enabled} />
                    <Switch
                      dir="ltr"
                      checked={enabled}
                      onCheckedChange={(checked) => handleToggle(item.id, checked)}
                    />
                  </div>
                </SettingsTd>
                <SettingsTd>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      className={SETTINGS_VIEW_TRIGGER_CLASS}
                      onClick={() => setViewItem(item)}
                    >
                      عرض
                    </button>
                    <button
                      type="button"
                      className={SETTINGS_EDIT_TRIGGER_CLASS}
                      onClick={() => setEditItem(item)}
                    >
                      تعديل
                    </button>
                  </div>
                </SettingsTd>
              </SettingsTableRow>
            );
          })
        )}
      </SettingsTable>

      <EditInstructionImageDialog
        item={editDialogItem}
        open={Boolean(editItem)}
        onOpenChange={(open) => {
          if (!open) setEditItem(null);
        }}
      />

      <ViewInstructionImageDialog
        item={viewItem}
        open={Boolean(viewItem)}
        onOpenChange={(open) => {
          if (!open) setViewItem(null);
        }}
      />
    </div>
  );
}
