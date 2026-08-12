"use client";

import {
  ChevronLeft,
  Maximize2,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import NewRequestCard from "./NewRequestCard";
import { RT } from "./theme";
import { getWaitingMinutes } from "./map-realtime-order";

function StatCard({ value, total, label, hint, barColor, valueColor, dark }) {
  const percent = total ? Math.round((value / total) * 100) : 0;

  return (
    <div
      className={cn(
        "rounded-xl border p-4 flex flex-col gap-2.5 min-w-0",
        dark
          ? "bg-[#13241C] border-white/[0.08]"
          : "bg-white border-[#E8EEEC] shadow-[0_1px_3px_rgba(11,83,69,0.05)]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-right min-w-0">
          <p
            className={cn(
              "text-[13px] font-bold",
              dark ? "text-white/70" : "text-[#374151]"
            )}
          >
            {label}
          </p>
        </div>
        <span
          className="text-[30px] font-black leading-none tabular-nums shrink-0"
          style={{ color: valueColor }}
        >
          {value}
        </span>
      </div>

      <div
        className={cn(
          "h-[6px] rounded-full overflow-hidden",
          dark ? "bg-white/10" : "bg-[#F0F2F1]"
        )}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min(100, Math.max(0, percent))}%`,
            backgroundColor: barColor,
          }}
        />
      </div>

      <p
        className={cn(
          "text-[11px] font-medium",
          dark ? "text-white/40" : "text-[#9CA3AF]"
        )}
      >
        {hint}
      </p>
    </div>
  );
}

/**
 * New requests strip + full dialog on "عرض المزيد".
 */
export default function NewRequestsSection({
  orders = [],
  totalCount,
  expanded,
  onExpandedChange,
  onReceive,
  receivingId,
  canReceive = true,
  autoRefresh = true,
  onAutoRefreshChange,
  previewCount = 7,
  dark = false,
  isLoading = false,
}) {
  const total = totalCount ?? orders.length;
  const over15 = orders.filter((o) => getWaitingMinutes(o) >= 15).length;
  const over30 = orders.filter((o) => getWaitingMinutes(o) >= 30).length;
  const preview = orders.slice(0, previewCount);

  return (
    <>
      {/* Collapsed strip — always on the page */}
      <section
        className={cn(
          "rounded-[22px] border p-4 sm:p-5 space-y-4",
          dark
            ? "bg-[#0F1C16] border-white/[0.08]"
            : "bg-[#EAF3EF] border-[#D7E8E0]"
        )}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="size-8 rounded-full flex items-center justify-center shrink-0 text-white shadow-sm"
              style={{ backgroundColor: RT.brand }}
            >
              <Plus className="size-4" strokeWidth={2.75} />
            </span>
            <h2
              className={cn(
                "text-[15px] font-black truncate",
                dark ? "text-white" : "text-[#0B5345]"
              )}
            >
              طلبات جديدة
              <span
                className={cn(
                  "mx-1.5 font-bold",
                  dark ? "text-white/40" : "text-[#9CA3AF]"
                )}
              >
                –
              </span>
              <span
                className={
                  dark ? "text-white/70 font-bold" : "text-[#4B5563] font-bold"
                }
              >
                {total} طلب
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span
              className={cn(
                "text-[12.5px] font-bold hidden sm:inline",
                dark ? "text-white/55" : "text-[#4B5563]"
              )}
            >
              إجمالي الطلبات : {total}
            </span>
            <button
              type="button"
              onClick={() => onExpandedChange?.(true)}
              className="h-9 px-3.5 rounded-full text-[12.5px] font-bold text-white flex items-center gap-1 shrink-0 transition-colors hover:brightness-110"
              style={{ backgroundColor: RT.brand }}
            >
              عرض المزيد
              <ChevronLeft className="size-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:thin]">
          {isLoading ? (
            Array.from({ length: previewCount }).map((_, index) => (
              <div
                key={`new-order-skeleton-${index}`}
                className={cn(
                  "min-w-[188px] h-[132px] rounded-xl border shrink-0 animate-pulse",
                  dark
                    ? "bg-[#13241C] border-white/[0.08]"
                    : "bg-white border-[#E8EEEC]"
                )}
              />
            ))
          ) : preview.length === 0 ? (
            <p
              className={cn(
                "w-full py-6 text-center text-[13px] font-medium",
                dark ? "text-white/40" : "text-[#9CA3AF]"
              )}
            >
              لا توجد طلبات جديدة بانتظار الاستلام
            </p>
          ) : (
            preview.map((order) => (
              <NewRequestCard
                key={order.id}
                order={order}
                onReceive={canReceive ? onReceive : undefined}
                receiving={receivingId != null && receivingId === order.id}
                dark={dark}
              />
            ))
          )}
        </div>
      </section>

      {/* Full view as dialog */}
      <Dialog open={expanded} onOpenChange={onExpandedChange}>
        <DialogContent
          closeButton={false}
          dir="rtl"
          className={cn(
            "max-w-[min(1200px,calc(100vw-2rem))] w-full p-0 gap-0 overflow-hidden border-0 shadow-2xl",
            "max-h-[min(920px,calc(100vh-2rem))] flex flex-col",
            "rounded-2xl translate-x-[-50%] translate-y-[-50%]",
            dark ? "bg-[#0B1411]" : "bg-[#F4F6F5]"
          )}
        >
          <DialogTitle className="sr-only">الطلبات الجديدة</DialogTitle>
          <DialogDescription className="sr-only">
            {total} طلب بانتظار الاستلام
          </DialogDescription>

          {/* Dark teal header bar */}
          <div
            className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 shrink-0"
            style={{ backgroundColor: RT.brandDeep }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="size-8 rounded-lg bg-white/10 text-white flex items-center justify-center shrink-0">
                <Plus className="size-4" strokeWidth={2.5} />
              </span>
              <div className="min-w-0">
                <h2 className="text-[16px] sm:text-[17px] font-black text-white leading-tight">
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
                  "h-9 px-3 rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-colors",
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
                aria-label="توسيع"
                className="size-9 rounded-lg bg-white/10 text-white flex items-center justify-center hover:bg-white/15 transition-colors"
              >
                <Maximize2 className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => onExpandedChange?.(false)}
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
              <StatCard
                value={total}
                total={Math.max(total, 40)}
                label="إجمالي الطلبات الجديدة"
                hint="بانتظار الاستلام - من سعة 40"
                barColor={RT.brand}
                valueColor={dark ? "#6EE7B7" : RT.brand}
                dark={dark}
              />
              <StatCard
                value={over15}
                total={total}
                label="تجاوزت 15 دقيقة"
                hint={`${over15} من ${total} طلباً - تحذير متوسط`}
                barColor={RT.warningBar}
                valueColor={RT.warningNum}
                dark={dark}
              />
              <StatCard
                value={over30}
                total={total}
                label="تجاوزت 30 دقيقة"
                hint={`${over30} من ${total} طلباً - تحذير حرج`}
                barColor={RT.dangerBar}
                valueColor={RT.dangerNum}
                dark={dark}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, index) => (
                  <div
                    key={`new-order-dialog-skeleton-${index}`}
                    className={cn(
                      "h-[120px] rounded-xl border animate-pulse",
                      dark
                        ? "bg-[#13241C] border-white/[0.08]"
                        : "bg-white border-[#E8EEEC]"
                    )}
                  />
                ))
              ) : orders.length === 0 ? (
                <p
                  className={cn(
                    "col-span-full py-10 text-center text-[13px] font-medium",
                    dark ? "text-white/40" : "text-[#9CA3AF]"
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
    </>
  );
}
