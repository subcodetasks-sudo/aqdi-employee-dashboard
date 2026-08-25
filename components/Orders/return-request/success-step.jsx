"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { RETURN_ACCENT } from "./primitives";

export default function ReturnRequestSuccessStep({ open, order, onClose, onDone }) {
    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v) onClose();
            }}
        >
            <DialogContent className="sm:max-w-[420px] p-8 rounded-[18px] border-0" dir="rtl" closeButton={false}>
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="text-[72px] leading-none">🧐</div>
                    <h2 className="text-[20px] font-bold text-[#22302C] leading-relaxed">
                        تم تصنيف الطلب رقم <span style={{ color: RETURN_ACCENT }}>{order?.uuid}</span>
                    </h2>
                    <p className="text-22 font-black text-[#22302C]">
                        الى <span style={{ color: RETURN_ACCENT }}>مسترجع</span> بنجاح!
                    </p>
                    <button
                        type="button"
                        onClick={onDone}
                        style={{ backgroundColor: RETURN_ACCENT }}
                        className="w-full h-[50px] text-white rounded-[11px] font-bold text-15 hover:brightness-110 transition-all mt-4"
                    >
                        تم
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
