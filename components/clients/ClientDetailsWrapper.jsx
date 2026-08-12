"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Ban,
  ChevronLeft,
  FileText,
  Home,
  Tag,
  TriangleAlert,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  CLIENT_ORDER_STATUS,
  PLATFORM,
  getMockClientDetail,
} from "./mock-data";

const FILTER_TABS = [
  { id: "all", label: "الكل" },
  { id: "completed", label: "مكتمل" },
  { id: "draft", label: "مسودة" },
  { id: "incomplete", label: "غير مكتمل" },
  { id: "returned", label: "مسترجع" },
  { id: "canceled", label: "ملغي" },
  { id: "processing", label: "قيد المعالجة" },
];

const STAT_DEFS = [
  { key: "completed", label: "مكتمل", bar: "#10B981", barDark: "#34D399" },
  { key: "draft", label: "مسودة", bar: "#94A3B8", barDark: "#94A3B8" },
  { key: "incomplete", label: "غير مكتمل", bar: "#F97316", barDark: "#FB923C" },
  { key: "properties", label: "عقارات", bar: "#0B5345", barDark: "#34D399" },
  { key: "units", label: "وحدات", bar: "#0B5345", barDark: "#6EE7B7" },
  {
    key: "returned",
    label: "مسترجع (ر.س)",
    bar: "#EF4444",
    barDark: "#F87171",
    money: true,
  },
  {
    key: "paid",
    label: "مدفوع (ر.س)",
    bar: "#14B8A6",
    barDark: "#2DD4BF",
    money: true,
  },
  {
    key: "net",
    label: "الصافي (ر.س)",
    bar: "#0D9488",
    barDark: "#5EEAD4",
    money: true,
  },
];

function formatMoney(value) {
  const n = Number(value) || 0;
  return n.toLocaleString("en-US");
}

function formatJoinedLabel(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const date = d.toLocaleDateString("en-GB").replace(/\//g, "-");
  const time = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${date} · ${time}`;
}

function formatJoinedShort(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString("en-GB").replace(/\//g, "-");
}

function whatsappHref(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return null;
  const normalized = digits.startsWith("0")
    ? `966${digits.slice(1)}`
    : digits.startsWith("966")
      ? digits
      : `966${digits}`;
  return `https://wa.me/${normalized}`;
}

export default function ClientDetailsWrapper() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const clientId = params?.userId;
  const from = searchParams.get("from") || "/home/clients";
  const backUrl = from.startsWith("/") ? from : "/home/clients";

  const detail = useMemo(() => getMockClientDetail(clientId), [clientId]);
  const [filter, setFilter] = useState("all");

  const orders = detail?.orders ?? [];
  const filterCounts = useMemo(() => {
    const counts = { all: orders.length };
    for (const tab of FILTER_TABS) {
      if (tab.id === "all") continue;
      counts[tab.id] = orders.filter((o) => o.status === tab.id).length;
    }
    return counts;
  }, [orders]);

  if (!detail) {
    return (
      <div className="flex flex-col gap-4 min-h-full" dir="rtl">
        <button
          type="button"
          onClick={() => router.push(backUrl)}
          className="inline-flex items-center gap-1.5 self-start text-[14px] font-medium text-[#6B7280] dark:text-white/50 hover:text-[#0B5345] dark:hover:text-emerald-300 transition-colors"
        >
          <ChevronLeft className="size-4 shrink-0" />
          رجوع للعملاء
        </button>
        <div className="rounded-2xl border border-[#E8EEEC] bg-white dark:bg-[#0F1C16] dark:border-white/[0.08] p-10 text-center text-[#FA5252] text-[15px] font-medium">
          لم يتم العثور على ملف العميل
        </div>
      </div>
    );
  }

  const { client, stats, notice } = detail;
  const platform = PLATFORM[client.platform] || PLATFORM.website;
  const wa = whatsappHref(client.displayPhone || client.mobile);
  const filteredOrders =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="flex flex-col gap-5 min-h-full transition-colors" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-2 min-w-0">
          <button
            type="button"
            onClick={() => router.push(backUrl)}
            className="inline-flex items-center gap-1.5 self-start text-[14px] font-medium text-[#6B7280] dark:text-white/50 hover:text-[#0B5345] dark:hover:text-emerald-300 transition-colors"
          >
            <ChevronLeft className="size-4 shrink-0" />
            رجوع للعملاء
          </button>
          <div>
            <h1 className="text-[20px] sm:text-[22px] font-bold text-[#111827] dark:text-white leading-tight">
              ملف العميل – {client.name}
            </h1>
            <p className="mt-1 text-[12px] text-[#9CA3AF] dark:text-white/45 font-medium tabular-nums">
              {client.clientCode} · انضم {formatJoinedLabel(client.joinedAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          {notice ? (
            <div className="inline-flex items-start gap-2 max-w-md rounded-xl border border-[#FCD34D]/60 bg-[#FFFBEB] dark:bg-amber-500/10 dark:border-amber-400/30 px-3 py-2 text-[11px] leading-relaxed text-[#92400E] dark:text-amber-200">
              <TriangleAlert className="size-3.5 shrink-0 mt-0.5" />
              <span>{notice}</span>
            </div>
          ) : null}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                toast.message("حظر العميل (واجهة تجريبية — غير مربوط بعد)")
              }
              className={cn(
                "inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full border text-[12px] font-bold transition-colors",
                "border-red-200 bg-white text-[#DC2626] hover:bg-red-50",
                "dark:border-rose-400/30 dark:bg-transparent dark:text-rose-300 dark:hover:bg-rose-500/10"
              )}
            >
              <Ban className="size-3.5 shrink-0" />
              حظر العميل
            </button>
            <button
              type="button"
              onClick={() =>
                toast.message("خصم/إعفاء مخصص (واجهة تجريبية — غير مربوط بعد)")
              }
              className={cn(
                "inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full border text-[12px] font-bold transition-colors",
                "border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F9FAFB]",
                "dark:border-white/15 dark:bg-transparent dark:text-white/70 dark:hover:bg-white/[0.04]"
              )}
            >
              <Tag className="size-3.5 shrink-0" />
              خصم/إعفاء مخصص
            </button>
          </div>
        </div>
      </div>

      {/* Profile card */}
      <div
        className={cn(
          "rounded-2xl border bg-white p-5 sm:p-6",
          "border-[#E8EEEC] shadow-[0_1px_3px_rgba(11,83,69,0.04)]",
          "dark:bg-[#0F1C16] dark:border-white/[0.08] dark:shadow-none"
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
          <div className="size-16 sm:size-[72px] shrink-0 rounded-full bg-[#DBEAFE] dark:bg-sky-500/20 flex items-center justify-center text-[28px] font-bold text-[#1D4ED8] dark:text-sky-300">
            {client.initial || (client.name || "؟").charAt(0)}
          </div>

          <div className="flex-1 min-w-0 flex flex-col gap-2.5">
            <h2 className="text-[18px] font-bold text-[#111827] dark:text-white leading-tight">
              {client.name}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-bold text-[#0B5345] dark:text-emerald-300 tabular-nums">
                {client.clientCode}
              </span>
              <span
                className="text-[13px] font-medium text-[#374151] dark:text-white/70 tabular-nums"
                dir="ltr"
              >
                {client.displayPhone || client.mobile}
              </span>
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold",
                  platform.badgeClass
                )}
              >
                {platform.label}
              </span>
              <span className="text-[12px] font-medium text-[#9CA3AF] dark:text-white/45 tabular-nums">
                انضم {formatJoinedShort(client.joinedAt)}
              </span>
            </div>
          </div>

          {wa ? (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center justify-center gap-2 h-10 px-5 rounded-full text-[13px] font-bold text-white shrink-0 transition-colors",
                "bg-[#25D366] hover:bg-[#1EBE57]"
              )}
            >
              <FaWhatsapp className="size-4" />
              واتساب
            </a>
          ) : null}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2.5">
        {STAT_DEFS.map((def) => (
          <div
            key={def.key}
            className={cn(
              "relative overflow-hidden rounded-xl border bg-white px-3 py-3",
              "border-[#E8EEEC] shadow-[0_1px_2px_rgba(11,83,69,0.03)]",
              "dark:bg-[#0F1C16] dark:border-white/[0.08] dark:shadow-none"
            )}
          >
            <span
              className="absolute inset-y-0 right-0 w-[3px] dark:hidden"
              style={{ backgroundColor: def.bar }}
              aria-hidden
            />
            <span
              className="absolute inset-y-0 right-0 w-[3px] hidden dark:block"
              style={{ backgroundColor: def.barDark }}
              aria-hidden
            />
            <p className="text-[11px] font-medium text-[#9CA3AF] dark:text-white/45 mb-1.5 pr-1">
              {def.label}
            </p>
            <p className="text-[18px] font-bold text-[#111827] dark:text-white tabular-nums leading-none pr-1">
              {def.money ? formatMoney(stats[def.key]) : stats[def.key] ?? 0}
            </p>
          </div>
        ))}
      </div>

      {/* Orders */}
      <section
        className={cn(
          "rounded-2xl border bg-white overflow-hidden",
          "border-[#E8EEEC] shadow-[0_1px_3px_rgba(11,83,69,0.04)]",
          "dark:bg-[#0F1C16] dark:border-white/[0.08] dark:shadow-none"
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-5 pt-5 pb-3">
          <div className="inline-flex items-center gap-2">
            <FileText className="size-4 text-[#0B5345] dark:text-emerald-300 shrink-0" />
            <h3 className="text-[15px] font-bold text-[#111827] dark:text-white">
              طلبات العميل
            </h3>
          </div>
          <p className="text-[12px] font-medium text-[#9CA3AF] dark:text-white/45">
            إجمالي طلبات العميل:{" "}
            <span className="tabular-nums text-[#374151] dark:text-white/70 font-bold">
              {orders.length}
            </span>
          </p>
        </div>

        <div className="px-5 pb-4 overflow-x-auto">
          <div className="inline-flex items-center gap-1.5 min-w-max">
            {FILTER_TABS.map((tab) => {
              const active = filter === tab.id;
              const count = filterCounts[tab.id] ?? 0;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={cn(
                    "inline-flex items-center gap-1 h-8 px-3 rounded-full text-[12px] font-bold transition-colors whitespace-nowrap",
                    active
                      ? "bg-[#0B5345] text-white dark:bg-emerald-500 dark:text-[#0B1411]"
                      : "bg-transparent text-[#6B7280] border border-[#E5E7EB] hover:bg-[#F9FAFB] dark:text-white/55 dark:border-white/12 dark:hover:bg-white/[0.04]"
                  )}
                >
                  {tab.label}
                  <span
                    className={cn(
                      "tabular-nums",
                      active ? "opacity-90" : "opacity-70"
                    )}
                  >
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-full overflow-x-auto border-t border-[#EEF1F0] dark:border-white/[0.06]">
          <table className="w-full border-collapse min-w-[720px]">
            <thead>
              <tr className="bg-[#FAFBFA] dark:bg-white/[0.03]">
                {["الطلب", "النوع", "الحالة", "الرسوم", ""].map((h) => (
                  <th
                    key={h || "actions"}
                    className="px-4 py-3 text-[12px] font-semibold text-[#9CA3AF] dark:text-white/45 text-right whitespace-nowrap border-b border-[#EEF1F0] dark:border-white/[0.08]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-[13px] text-[#9CA3AF] dark:text-white/40"
                  >
                    لا توجد طلبات في هذا التصنيف
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const status =
                    CLIENT_ORDER_STATUS[order.status] ||
                    CLIENT_ORDER_STATUS.processing;
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-[#F3F4F6] dark:border-white/[0.05] last:border-0 hover:bg-[#F8FAF9]/80 dark:hover:bg-white/[0.04] transition-colors"
                    >
                      <td className="px-4 py-3.5 text-[13px] font-bold text-[#111827] dark:text-white tabular-nums whitespace-nowrap">
                        #{order.id}
                      </td>
                      <td className="px-4 py-3.5 text-[13px] font-medium text-[#374151] dark:text-white/70 whitespace-nowrap">
                        {order.type}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 text-[12px] font-bold",
                            status.text
                          )}
                        >
                          <span
                            className="size-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: status.dot }}
                            aria-hidden
                          />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[13px] font-bold text-[#111827] dark:text-white tabular-nums whitespace-nowrap">
                        {formatMoney(order.fee)} ر.س
                      </td>
                      <td className="px-4 py-3.5 text-left">
                        <Link
                          href={`/home/realtime-orders/${order.id}?from=${encodeURIComponent(
                            `/home/users/${clientId}?from=${encodeURIComponent(backUrl)}`
                          )}`}
                          className={cn(
                            "inline-flex items-center justify-center h-8 px-3.5 rounded-full border text-[12px] font-bold transition-colors",
                            "border-[#0B5345]/25 bg-[#E8F5F1] text-[#0B5345] hover:bg-[#0B5345] hover:text-white",
                            "dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-emerald-500 dark:hover:text-white"
                          )}
                        >
                          فتح
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Properties CTA */}
      <section className="flex flex-col gap-3">
        <div className="inline-flex items-center gap-2">
          <Home className="size-4 text-[#0B5345] dark:text-emerald-300 shrink-0" />
          <h3 className="text-[15px] font-bold text-[#111827] dark:text-white">
            عقارات العميل ووحداته
          </h3>
        </div>
        <Link
          href={`/home/users/${clientId}/properties?from=${encodeURIComponent(
            `/home/users/${clientId}?from=${encodeURIComponent(backUrl)}`
          )}`}
          className={cn(
            "w-full inline-flex items-center justify-center gap-2.5 h-12 px-4 rounded-xl text-[13px] font-bold transition-colors",
            "bg-[#E8F5F1] text-[#0B5345] hover:bg-[#D5EFE8]",
            "dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-emerald-500/25"
          )}
        >
          <Home className="size-4 shrink-0" />
          فتح عقارات ووحدات العميل ({stats.properties} عقار – {stats.units}{" "}
          وحدة)
        </Link>
      </section>
    </div>
  );
}
