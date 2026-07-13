"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Maximize2, Minus, Plus, Share2, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useImageZoomPan } from "./use-image-zoom-pan";

function isPdfUrl(url) {
  if (!url || typeof url !== "string") return false;
  return url.split("?")[0].toLowerCase().endsWith(".pdf");
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

export function DeedInstrumentViewer({
  images = [],
  variant = "inline",
  onExpand,
  onClose,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const isDialog = variant === "dialog";
  const current = images[activeIndex];
  const currentUrl = current?.original;
  const isPdf = isPdfUrl(currentUrl);

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
    enabled: !isPdf,
    resetDeps: [activeIndex, currentUrl],
  });

  const handleShare = async () => {
    if (!currentUrl) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: current?.description || "صورة الصك",
          url: currentUrl,
        });
        return;
      }
    } catch {
      /* cancelled */
    }

    try {
      await navigator.clipboard.writeText(currentUrl);
      toast.success("تم نسخ رابط الصورة");
    } catch {
      window.open(currentUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (!images.length) return null;

  const viewportMinHeight = isDialog ? "min-h-[min(72vh,680px)]" : "min-h-[420px]";
  const imageMaxHeight = isDialog
    ? "max-h-[min(68vh,640px)]"
    : "max-h-[min(64vh,560px)]";

  return (
    <div className="rounded-[28px] bg-[#E8E8E8] p-5">
      <div
        className={`relative overflow-hidden rounded-[20px] bg-[#E8E8E8] ${viewportMinHeight}`}
      >
        {isDialog && onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-30 flex size-9 items-center justify-center rounded-full bg-white/90 text-[#737373] shadow-md transition-colors hover:bg-white hover:text-[#E24444]"
            aria-label="إغلاق"
          >
            <X className="size-5" />
          </button>
        ) : null}

        <div className="absolute left-4 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-2.5">
          <ViewerToolButton icon={Share2} label="مشاركة" onClick={handleShare} />
          <ViewerToolButton
            icon={Minus}
            label="تصغير"
            onClick={zoomOut}
            disabled={isPdf}
          />
          {!isDialog && onExpand ? (
            <ViewerToolButton
              icon={Maximize2}
              label="توسيع العرض"
              onClick={onExpand}
            />
          ) : null}
          <ViewerToolButton
            icon={Plus}
            label="تكبير"
            onClick={zoomIn}
            disabled={isPdf}
          />
        </div>

        <div
          ref={containerRef}
          className={`flex h-full w-full items-center justify-center p-4 pb-24 ${viewportMinHeight} ${
            isPdf ? "" : cursorClass
          }`}
          onMouseDown={handleMouseDown}
          onDoubleClick={resetTransform}
        >
          {isPdf ? (
            <iframe
              src={currentUrl}
              title={current?.description || "صورة الصك"}
              className={`w-full max-w-full rounded-xl border-0 bg-white shadow-md ${
                isDialog ? "h-[min(68vh,600px)]" : "h-[min(68vh,520px)]"
              }`}
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
                src={currentUrl}
                alt={current?.description || "صورة الصك"}
                width={720}
                height={1020}
                className={`h-auto w-auto max-w-full select-none object-contain ${imageMaxHeight}`}
                draggable={false}
                unoptimized
                priority
              />
            </div>
          )}
        </div>

        {images.length > 1 ? (
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-3">
            {images.map((image, index) => {
              const isActive = index === activeIndex;
              const thumbIsPdf = isPdfUrl(image.original);

              return (
                <button
                  key={`${image.original}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  title={image.description}
                  className={`relative size-[62px] shrink-0 overflow-hidden rounded-lg  shadow-md transition-all ${
                    isActive ? "border-[#10B981] " : "border-white opacity-70 hover:opacity-100"
                  }`}
                >
                  {thumbIsPdf ? (
                    <span className="flex size-full items-center justify-center bg-[#F5F5F5] text-[10px] font-bold text-[#616161]">
                      PDF
                    </span>
                  ) : (
                    <Image
                      src={image.thumbnail || image.original}
                      alt={image.description || ""}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  )}
                  {isActive ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                      <span className="flex size-7 items-center justify-center rounded-full bg-[#10B981] text-white shadow">
                        <Check className="size-4" strokeWidth={3} />
                      </span>
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function DeedInstrumentViewerDialog({ open, onOpenChange, images = [] }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        closeButton={false}
        className="gap-0 overflow-hidden rounded-[28px] border-0 bg-transparent p-0 shadow-none sm:max-w-[min(1100px,calc(100vw-32px))]"
        dir="ltr"
        onWheel={(event) => event.stopPropagation()}
      >
        {open ? (
          <DeedInstrumentViewer
            images={images}
            variant="dialog"
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
