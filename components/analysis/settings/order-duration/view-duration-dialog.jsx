"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  formatContractPeriodPrice,
  getContractPeriodLabel,
} from "@/src/lib/contract-period-utils";
import { getInstrumentTypeLabel } from "@/src/lib/instrument-types";
import { SETTINGS_VIEW_TRIGGER_CLASS } from "@/components/SystemSettings/shared";
import { X } from "lucide-react";
import { useState } from "react";

export default function ViewDurationDialog({ duration }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog dir="rtl" open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className={SETTINGS_VIEW_TRIGGER_CLASS}>
          عرض
        </button>
      </DialogTrigger>
      <DialogContent closeButton={false} className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between border-b pb-6">
            <h2 className="text-xl font-bold">تفاصيل المدة</h2>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4 text-right">
            <div>
              <p className="text-sm text-[#737373] mb-1">مدة العقد</p>
              <p className="text-base font-bold">{getContractPeriodLabel(duration)}</p>
            </div>
            <div>
              <p className="text-sm text-[#737373] mb-1">السعر</p>
              <p className="text-base font-bold text-brand-main">
                {formatContractPeriodPrice(duration?.price) || "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-[#737373] mb-1">تصنيف وثيقة الملكية</p>
              <p className="text-base font-bold">
                {getInstrumentTypeLabel(duration?.instrument_type)}
              </p>
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
