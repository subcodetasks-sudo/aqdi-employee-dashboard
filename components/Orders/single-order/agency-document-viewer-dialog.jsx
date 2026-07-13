"use client";

import { useCallback } from "react";
import Image from "next/image";
import {
  Minus,
  Plus,
  Share2,
  UserPlus,
  X,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useImageZoomPan } from "./use-image-zoom-pan";

function isPdfUrl(url) {
  if (!url || typeof url !== "string") return false;
  return url.split("?")[0].toLowerCase().endsWith(".pdf");
}

export function resolveAgencyDocumentUrl(summary) {
  if (!summary) return null;
  const raw = summary.copy_of_the_authorization_or_agency;
  if (!raw) return null;
  if (typeof raw === "string") return raw.trim() || null;
  if (typeof raw === "object") {
    return raw.url || raw.path || raw.full_url || raw.src || null;
  }
  return null;
}

export default function AgencyDocumentViewerDialog({
  open,
  onOpenChange,
  documentUrl,
  title = "صورة الوكالة",
}) {
  const isPdf = isPdfUrl(documentUrl);

  const {
    scale,
    position,
    containerRef,
    resetTransform,
    handleMouseDown,
    zoomIn,
    zoomOut,
    cursorClass,
  } = useImageZoomPan({
    enabled: open && !isPdf,
    resetDeps: [open, documentUrl],
  });

  const handleShare = useCallback(async () => {
    if (!documentUrl) return;
    try {
      if (navigator.share) {
        await navigator.share({ title, url: documentUrl });
        return;
      }
    } catch {
      /* user cancelled or unsupported */
    }
    window.open(documentUrl, "_blank", "noopener,noreferrer");
  }, [documentUrl, title]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        closeButton={false}
        className="gap-0 overflow-hidden rounded-[28px] border-0 bg-[#E8E8E8] p-0 sm:max-w-[min(920px,calc(100vw-32px))]"
        dir="rtl"
      >
        <div className="flex items-center justify-between border-b border-[#EBEBEB] bg-white px-6 py-4">
          <h2 className="text-[18px] font-bold text-black">{title}</h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex size-9 items-center justify-center rounded-full text-[#A3A3A3] transition-colors hover:bg-[#F5F5F5] hover:text-[#E24444]"
            aria-label="إغلاق"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="relative overflow-hidden bg-[#E8E8E8] p-6">
          {open && documentUrl ? (
            <>
              <div className="absolute left-5 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2">
                <ViewerToolButton
                  icon={Share2}
                  label="مشاركة"
                  onClick={handleShare}
                />
                <ViewerToolButton
                  icon={Minus}
                  label="تصغير"
                  onClick={zoomOut}
                  disabled={isPdf}
                />
                <ViewerToolButton
                  icon={Plus}
                  label="تكبير"
                  onClick={zoomIn}
                  disabled={isPdf}
                />
              </div>

              <div
                ref={containerRef}
                className={`flex min-h-[min(70vh,640px)] w-full items-center justify-center ${
                  isPdf ? "" : cursorClass
                }`}
                onMouseDown={handleMouseDown}
                onDoubleClick={resetTransform}
              >
                {isPdf ? (
                  <iframe
                    src={documentUrl}
                    title={title}
                    className="min-h-[min(68vh,600px)] w-full max-w-[min(720px,100%)] rounded-xl border-0 bg-white shadow-lg"
                  />
                ) : (
                  <div
                    className="relative will-change-transform"
                    style={{
                      transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                      transformOrigin: "center center",
                      transition: cursorClass === "cursor-grabbing" ? "none" : "transform 0.15s ease-out",
                    }}
                  >
                    <Image
                      src={documentUrl}
                      alt={title}
                      width={640}
                      height={900}
                      className="h-auto max-h-[min(64vh,560px)] w-auto max-w-full select-none object-contain"
                      draggable={false}
                      unoptimized
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="min-h-[min(70vh,640px)] text-center text-[15px] text-[#737373]">
              لا يوجد ملف وكالة مرفق
            </p>
          )}
        </div>

        <div className="flex justify-center border-t border-[#EBEBEB] bg-white px-6 py-5">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-[52px] min-w-[200px] rounded-xl bg-brand-hover text-[16px] font-bold text-white transition-colors hover:bg-brand-hover/90"
          >
            إغلاق
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ViewerToolButton({ icon: Icon, label, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="flex size-11 items-center justify-center rounded-full bg-[#1A1A1A] text-white shadow-lg transition-colors hover:bg-black disabled:pointer-events-none disabled:opacity-40"
    >
      <Icon className="size-5" strokeWidth={2} />
    </button>
  );
}

export function LegalAgentStatusBadge() {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[#F0E6FF] px-4 py-2.5 text-[13px] font-bold text-[#7C3AED]">
      <UserPlus className="size-4 shrink-0" />
      يوجد وكيل للمالك
    </span>
  );
}
