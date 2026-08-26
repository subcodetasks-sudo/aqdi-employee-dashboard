"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2, Plus, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import NewRequestCard from "./NewRequestCard";
import NewRequestStatCard from "./NewRequestStatCard";
import { RT } from "./theme";

async function enterBrowserFullscreen(el) {
  if (!el) return;
  const request =
    el.requestFullscreen ||
    el.webkitRequestFullscreen ||
    el.msRequestFullscreen;
  if (request) await request.call(el);
}

async function exitBrowserFullscreen() {
  const doc = document;
  if (!doc.fullscreenElement && !doc.webkitFullscreenElement) return;
  const exit =
    doc.exitFullscreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
  if (exit) await exit.call(doc);
}

function isBrowserFullscreen() {
  return Boolean(
    document.fullscreenElement || document.webkitFullscreenElement
  );
}

export default function NewRequestsDialog({
  open,
  onOpenChange,
  orders,
  total,
  cards,
  onReceive,
  receivingId,
  canReceive,
  autoRefresh,
  onAutoRefreshChange,
  dark,
  isLoading,
}) {
  const contentRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const sync = () => setIsFullscreen(isBrowserFullscreen());
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
    };
  }, []);

  useEffect(() => {
    if (!open && isBrowserFullscreen()) {
      exitBrowserFullscreen().catch(() => {});
    }
    if (!open) setIsFullscreen(false);
  }, [open]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (isBrowserFullscreen()) {
        await exitBrowserFullscreen();
      } else {
        await enterBrowserFullscreen(contentRef.current);
      }
    } catch {
      /* user denied or unsupported */
    }
  }, []);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          exitBrowserFullscreen().catch(() => {});
          setIsFullscreen(false);
        }
        onOpenChange?.(next);
      }}
    >
      <DialogContent
        ref={contentRef}
        closeButton={false}
        dir="rtl"
        className={cn(
          "w-full p-0 gap-0 overflow-hidden border-0 shadow-2xl flex flex-col",
          isFullscreen
            ? "!fixed !inset-0 !left-0 !top-0 !h-screen !w-screen !max-w-none !max-h-none !translate-x-0 !translate-y-0 !rounded-none"
            : "max-w-[min(1200px,calc(100vw-2rem))] max-h-[min(920px,calc(100vh-2rem))] rounded-2xl translate-x-[-50%] translate-y-[-50%]",
          dark ? "bg-[#0B1411]" : "bg-[#F4F6F5]"
        )}
      >
        <DialogTitle className="sr-only">الطلبات الجديدة</DialogTitle>
        <DialogDescription className="sr-only">
          {total} طلب بانتظار الاستلام
        </DialogDescription>

        <div
          className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 shrink-0"
          style={{ backgroundColor: RT.brandDeep }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="size-8 rounded-lg bg-white/10 text-white flex items-center justify-center shrink-0">
              <Plus className="size-4" strokeWidth={2.5} />
            </span>
            <div className="min-w-0">
              <h2 className="text-base sm:text-[17px] font-black text-white leading-tight">
                الطلبات الجديدة
              </h2>
              <p className="flex items-center gap-1.5 text-[11.5px] text-white/75 mt-0.5 font-medium">
                <span className="size-1.5 rounded-full bg-[#34D399] shrink-0 animate-pulse" />
                {total} طلب بانتظار الاستلام
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onAutoRefreshChange?.(!autoRefresh)}
              className={cn(
                "h-9 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors",
                autoRefresh
                  ? "bg-white text-[#064E3B]"
                  : "bg-white/10 text-white hover:bg-white/15"
              )}
            >
              <RefreshCw
                className={cn(
                  "size-3.5",
                  autoRefresh && "animate-spin [animation-duration:3s]"
                )}
              />
              تحديث تلقائي
            </button>
            <button
              type="button"
              aria-label={isFullscreen ? "تصغير" : "توسيع"}
              onClick={toggleFullscreen}
              className="size-9 rounded-lg bg-white/10 text-white flex items-center justify-center hover:bg-white/15 transition-colors"
            >
              {isFullscreen ? (
                <Minimize2 className="size-4" />
              ) : (
                <Maximize2 className="size-4" />
              )}
            </button>
            <button
              type="button"
              onClick={() => onOpenChange?.(false)}
              aria-label="إغلاق"
              className="size-9 rounded-lg bg-white/10 text-white flex items-center justify-center hover:bg-white/15 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div
          className={cn(
            "p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 min-h-0",
            dark ? "bg-[#0B1411]" : "bg-[#F4F6F5]"
          )}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {cards.map((card, index) => {
              const count = card.count ?? 0;
              const isTotal = card.key === "total_new_orders" || index === 0;
              const isCritical = card.key === "exceeded_30_minutes";
              return (
                <NewRequestStatCard
                  key={card.key || card.label}
                  value={count}
                  total={isTotal ? Math.max(count, 1) : total}
                  label={card.label}
                  hint={
                    isTotal
                      ? "بانتظار الاستلام"
                      : `${count} من ${total} طلباً`
                  }
                  barColor={
                    isTotal ? RT.brand : isCritical ? RT.dangerBar : RT.warningBar
                  }
                  valueColor={
                    isTotal
                      ? dark
                        ? "#6EE7B7"
                        : RT.brand
                      : isCritical
                        ? RT.dangerNum
                        : RT.warningNum
                  }
                  dark={dark}
                />
              );
            })}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
            {isLoading ? (
              Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={`new-order-dialog-skeleton-${index}`}
                  className={cn(
                    "h-[120px] rounded-xl border animate-pulse",
                    dark
                      ? "bg-card border-white/[0.08]"
                      : "bg-white border-[#E8EEEC]"
                  )}
                />
              ))
            ) : orders.length === 0 ? (
              <p
                className={cn(
                  "col-span-full py-10 text-center text-13 font-medium",
                  dark ? "text-white/40" : "text-gray-400"
                )}
              >
                لا توجد طلبات جديدة بانتظار الاستلام
              </p>
            ) : (
              orders.map((order) => (
                <NewRequestCard
                  key={order.id}
                  order={order}
                  onReceive={canReceive ? onReceive : undefined}
                  receiving={receivingId != null && receivingId === order.id}
                  dark={dark}
                  dense
                  className="min-w-0"
                />
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
