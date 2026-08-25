"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Ban,
  ChevronLeft,
  ChevronRight,
  FileText,
  Home,
  Loader2,
  ShieldCheck,
  Tag,
  Trash2,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useClientDetail, useBlockClient, useDeleteClient } from "@/src/hooks/use-clients";
import { isDraftOrderRow } from "@/src/lib/draft-contract-statuses";

const FILTER_TABS = [
  { id: "all", label: "الكل" },
  { id: "completed", label: "مكتمل" },
  { id: "draft", label: "مسودة" },
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
    key: "refundedAmount",
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

/** Best-effort status bucket for the filter tabs — mirrors the substring conventions
 *  already used by src/lib/contract-statuses.js (no canonical status enum from the API). */
function classifyOrderStatus(order = {}) {
  const statusName = order?.status?.name || order?.status_name || "";
  if (order?.return_contract === true || /مسترجع|استرجاع/.test(statusName)) {
    return "returned";
  }
  if (/ملغ/.test(statusName)) return "canceled";
  if (isDraftOrderRow(order)) return "draft";
  if (order?.is_completed) return "completed";
  return "processing";
}

export default function ClientDetailsWrapper() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const clientId = params?.userId;
  const from = searchParams.get("from") || "/home/clients";
  const backUrl = from.startsWith("/") ? from : "/home/clients";

  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ORDERS_PAGE_SIZE = 10;

  const { client, contracts, isLoading, isError } = useClientDetail(clientId);
  const { mutate: toggleBlock, isPending: isBlocking } = useBlockClient();
  const { mutate: deleteClient, isPending: isDeleting } = useDeleteClient();

  const orders = useMemo(
    () =>
      (contracts ?? []).map((order) => ({
        ...order,
        statusKey: classifyOrderStatus(order),
      })),
    [contracts]
  );

  const filterCounts = useMemo(() => {
    const counts = { all: orders.length };
    for (const tab of FILTER_TABS) {
      if (tab.id === "all") continue;
      counts[tab.id] = orders.filter((o) => o.statusKey === tab.id).length;
    }
    return counts;
  }, [orders]);

  const filteredOrders =
    filter === "all" ? orders : orders.filter((o) => o.statusKey === filter);

  const totalOrders = filteredOrders.length;
  const ordersLastPage = Math.max(1, Math.ceil(totalOrders / ORDERS_PAGE_SIZE));
  const ordersPage = Math.min(currentPage, ordersLastPage);
  const ordersStart = totalOrders === 0 ? 0 : (ordersPage - 1) * ORDERS_PAGE_SIZE + 1;
  const ordersEnd = Math.min(ordersPage * ORDERS_PAGE_SIZE, totalOrders);
  const paginatedOrders = filteredOrders.slice(
    (ordersPage - 1) * ORDERS_PAGE_SIZE,
    ordersPage * ORDERS_PAGE_SIZE
  );

  const handleFilterChange = (tabId) => {
    setFilter(tabId);
    setCurrentPage(1);
  };

  const handleBlock = () => {
    if (!clientId) return;
    toggleBlock(clientId);
  };

  const handleDelete = () => {
    if (!clientId) return;
    if (!window.confirm("هل أنت متأكد من حذف هذا العميل؟ لا يمكن التراجع عن هذا الإجراء.")) {
      return;
    }
    deleteClient(clientId, {
      onSuccess: () => router.push(backUrl),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]" dir="rtl">
        <Loader2 className="size-6 animate-spin text-brand-dark dark:text-emerald-300" />
      </div>
    );
  }

  if (isError || !client) {
    return (
      <div className="flex flex-col gap-4 min-h-full" dir="rtl">
        <button
          type="button"
          onClick={() => router.push(backUrl)}
          className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-status-neutral dark:text-white/50 hover:text-brand-dark dark:hover:text-emerald-300 transition-colors"
        >
          <ChevronLeft className="size-4 shrink-0" />
          رجوع للعملاء
        </button>
        <div className="rounded-2xl border border-[#E8EEEC] bg-white dark:bg-[#0F1C16] dark:border-white/[0.08] p-10 text-center text-[#FA5252] text-15 font-medium">
          تعذر تحميل ملف العميل من الخادم
        </div>
      </div>
    );
  }

  const wa = whatsappHref(client.mobile);

  return (
    <div className="flex flex-col gap-5 min-h-full transition-colors" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-2 min-w-0">
          <button
            type="button"
            onClick={() => router.push(backUrl)}
            className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-status-neutral dark:text-white/50 hover:text-brand-dark dark:hover:text-emerald-300 transition-colors"
          >
            <ChevronLeft className="size-4 shrink-0" />
            رجوع للعملاء
          </button>
          <div>
            <h1 className="text-[20px] sm:text-22 font-bold text-gray-900 dark:text-white leading-tight">
              ملف العميل – {client.name}
            </h1>
            <p className="mt-1 text-xs text-gray-400 dark:text-white/45 font-medium tabular-nums">
              {client.clientCode} · انضم {formatJoinedLabel(client.joinedAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBlock}
              disabled={isBlocking}
              className={cn(
                "inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full border text-xs font-bold transition-colors disabled:opacity-50",
                client.blocked
                  ? "border-emerald-200 bg-white text-brand-dark hover:bg-emerald-50 dark:border-emerald-400/30 dark:bg-transparent dark:text-emerald-300 dark:hover:bg-emerald-500/10"
                  : "border-red-200 bg-white text-red-600 hover:bg-red-50 dark:border-rose-400/30 dark:bg-transparent dark:text-rose-300 dark:hover:bg-rose-500/10"
              )}
            >
              {isBlocking ? (
                <Loader2 className="size-3.5 shrink-0 animate-spin" />
              ) : client.blocked ? (
                <ShieldCheck className="size-3.5 shrink-0" />
              ) : (
                <Ban className="size-3.5 shrink-0" />
              )}
              {client.blocked ? "إلغاء حظر العميل" : "حظر العميل"}
            </button>
            <button
              type="button"
              onClick={() =>
                toast.message("خصم/إعفاء مخصص (غير مربوط بالباك اند بعد)")
              }
              className={cn(
                "inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full border text-xs font-bold transition-colors",
                "border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F9FAFB]",
                "dark:border-white/15 dark:bg-transparent dark:text-white/70 dark:hover:bg-white/[0.04]"
              )}
            >
              <Tag className="size-3.5 shrink-0" />
              خصم/إعفاء مخصص
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className={cn(
                "inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full border text-xs font-bold transition-colors disabled:opacity-50",
                "border-red-200 bg-white text-red-600 hover:bg-red-50",
                "dark:border-rose-400/30 dark:bg-transparent dark:text-rose-300 dark:hover:bg-rose-500/10"
              )}
            >
              {isDeleting ? (
                <Loader2 className="size-3.5 shrink-0 animate-spin" />
              ) : (
                <Trash2 className="size-3.5 shrink-0" />
              )}
              حذف العميل
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
          <div className="size-16 sm:size-[72px] shrink-0 rounded-full bg-[#DBEAFE] dark:bg-sky-500/20 flex items-center justify-center text-[28px] font-bold text-[#1D4ED8] dark:text-sky-300 overflow-hidden">
            {client.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={client.photo} alt={client.name} className="size-full object-cover" />
            ) : (
              (client.name || "؟").trim().charAt(0)
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col gap-2.5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
              {client.name}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-13 font-bold text-brand-dark dark:text-emerald-300 tabular-nums">
                {client.clientCode}
              </span>
              <span
                className="text-13 font-medium text-gray-700 dark:text-white/70 tabular-nums"
                dir="ltr"
              >
                {client.mobile}
              </span>
              {client.email ? (
                <span className="text-xs font-medium text-gray-400 dark:text-white/45">
                  {client.email}
                </span>
              ) : null}
              {client.platformLabel ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-11 font-bold bg-[#DCFCE7] text-green-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                  {client.platformLabel}
                </span>
              ) : null}
              {client.blocked ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-11 font-bold bg-[#FEE2E2] text-red-600 dark:bg-rose-500/20 dark:text-rose-300">
                  محظور
                </span>
              ) : null}
              <span className="text-xs font-medium text-gray-400 dark:text-white/45 tabular-nums">
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
                "inline-flex items-center justify-center gap-2 h-10 px-5 rounded-full text-13 font-bold text-white shrink-0 transition-colors",
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
            <p className="text-11 font-medium text-gray-400 dark:text-white/45 mb-1.5 pr-1">
              {def.label}
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white tabular-nums leading-none pr-1">
              {def.money ? formatMoney(client[def.key]) : client[def.key] ?? 0}
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
            <FileText className="size-4 text-brand-dark dark:text-emerald-300 shrink-0" />
            <h3 className="text-15 font-bold text-gray-900 dark:text-white">
              طلبات العميل
            </h3>
          </div>
          <p className="text-xs font-medium text-gray-400 dark:text-white/45">
            إجمالي طلبات العميل:{" "}
            <span className="tabular-nums text-gray-700 dark:text-white/70 font-bold">
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
                  onClick={() => handleFilterChange(tab.id)}
                  className={cn(
                    "inline-flex items-center gap-1 h-8 px-3 rounded-full text-xs font-bold transition-colors whitespace-nowrap",
                    active
                      ? "bg-brand-dark text-white dark:bg-emerald-500 dark:text-[#0B1411]"
                      : "bg-transparent text-status-neutral border border-[#E5E7EB] hover:bg-[#F9FAFB] dark:text-white/55 dark:border-white/12 dark:hover:bg-white/[0.04]"
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
                {["الطلب", "النوع", "الحالة", "حالة الدفع", ""].map((h) => (
                  <th
                    key={h || "actions"}
                    className="px-4 py-3 text-xs font-semibold text-gray-400 dark:text-white/45 text-right whitespace-nowrap border-b border-[#EEF1F0] dark:border-white/[0.08]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-13 text-gray-400 dark:text-white/40"
                  >
                    لا توجد طلبات في هذا التصنيف
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-status-neutral-bg dark:border-white/[0.05] last:border-0 hover:bg-[#F8FAF9]/80 dark:hover:bg-white/[0.04] transition-colors"
                  >
                    <td className="px-4 py-3.5 text-13 font-bold text-gray-900 dark:text-white tabular-nums whitespace-nowrap">
                      #{order.id}
                    </td>
                    <td className="px-4 py-3.5 text-13 font-medium text-gray-700 dark:text-white/70 whitespace-nowrap">
                      {order.contract_type || "—"}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold">
                        <span
                          className="size-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: order.status?.color || "#9CA3AF" }}
                          aria-hidden
                        />
                        <span style={{ color: order.status?.color || undefined }}>
                          {order.status?.name || order.status_name || "—"}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-13 font-medium text-gray-700 dark:text-white/70 whitespace-nowrap">
                      {order.payment_label_ar || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-left">
                      <Link
                        href={`/home/orders/${order.id}?from=${encodeURIComponent(
                          `/home/users/${clientId}?from=${encodeURIComponent(backUrl)}`
                        )}`}
                        className={cn(
                          "inline-flex items-center justify-center h-8 px-3.5 rounded-full border text-xs font-bold transition-colors",
                          "border-brand-dark/25 bg-[#E8F5F1] text-brand-dark hover:bg-brand-dark hover:text-white",
                          "dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-emerald-500 dark:hover:text-white"
                        )}
                      >
                        فتح
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalOrders > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-t border-[#EEF1F0] dark:border-white/[0.06] text-13">
            <div className="text-status-neutral dark:text-white/45 font-medium">
              يعرض {ordersStart}-{ordersEnd} من {totalOrders} طلب
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                disabled={ordersPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 text-gray-700 dark:text-white/70 font-medium hover:text-brand-dark dark:hover:text-emerald-300 disabled:opacity-40 disabled:hover:text-gray-700 dark:disabled:hover:text-white/70 transition-colors"
              >
                <ChevronRight className="size-3.5" />
                السابق
              </button>

              <span className="min-w-12 text-center tabular-nums text-gray-900 dark:text-white font-semibold">
                {ordersPage}/{ordersLastPage}
              </span>

              <button
                type="button"
                disabled={ordersPage >= ordersLastPage}
                onClick={() => setCurrentPage((p) => Math.min(ordersLastPage, p + 1))}
                className="inline-flex items-center gap-1 text-gray-700 dark:text-white/70 font-medium hover:text-brand-dark dark:hover:text-emerald-300 disabled:opacity-40 disabled:hover:text-gray-700 dark:disabled:hover:text-white/70 transition-colors"
              >
                التالي
                <ChevronLeft className="size-3.5" />
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {/* Properties CTA */}
      <section className="flex flex-col gap-3">
        <div className="inline-flex items-center gap-2">
          <Home className="size-4 text-brand-dark dark:text-emerald-300 shrink-0" />
          <h3 className="text-15 font-bold text-gray-900 dark:text-white">
            عقارات العميل ووحداته
          </h3>
        </div>
        <Link
          href={`/home/users/${clientId}/properties?from=${encodeURIComponent(
            `/home/users/${clientId}?from=${encodeURIComponent(backUrl)}`
          )}`}
          className={cn(
            "w-full inline-flex items-center justify-center gap-2.5 h-12 px-4 rounded-xl text-13 font-bold transition-colors",
            "bg-[#E8F5F1] text-brand-dark hover:bg-[#D5EFE8]",
            "dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-emerald-500/25"
          )}
        >
          <Home className="size-4 shrink-0" />
          فتح عقارات ووحدات العميل ({client.properties} عقار – {client.units}{" "}
          وحدة)
        </Link>
      </section>
    </div>
  );
}
