"use client";

import { Button } from "@/components/ui/button";
import { ImageUp, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function PaperworkIconField({
  iconUrl,
  file,
  onFileChange,
  onRemove,
  isRemoving = false,
}) {
  const [preview, setPreview] = useState(iconUrl || null);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
      return;
    }

    setPreview(iconUrl || null);
  }, [file, iconUrl]);

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0] ?? null;
    onFileChange(nextFile);
    event.target.value = "";
  };

  const handleRemove = () => {
    onFileChange(null);
    onRemove?.();
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">الأيقونة</label>
      <div className="flex items-center gap-4">
        <label className="flex items-center justify-center gap-2 h-12 px-6 rounded-14 border border-dashed border-[#D4D4D4] bg-neutral-50 cursor-pointer hover:bg-neutral-100 transition-all">
          <ImageUp className="size-5 text-ink-placeholder" />
          <span className="text-13 font-medium text-[#616161]">اختر أيقونة</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        {preview ? (
          <div className="flex items-center gap-2">
            <div className="relative size-16 rounded-xl overflow-hidden border border-surface-border bg-white">
              <Image src={preview} alt="أيقونة ورقة العمل" fill className="object-contain p-1" />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isRemoving}
              onClick={handleRemove}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
