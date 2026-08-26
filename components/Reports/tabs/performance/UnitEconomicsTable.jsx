"use client";

import { cn } from "@/lib/utils";
import { money, pick } from "../../shared/report-format";
import EmptyNote from "../../shared/EmptyNote";

const TH =
  "px-3 py-3 text-xs font-semibold text-gray-400 border-b border-[#EEF1F0] whitespace-nowrap text-right dark:text-white/50 dark:border-white/10";
const TD =
  "px-3 py-3 text-13 text-gray-700 border-b border-status-neutral-bg whitespace-nowrap dark:text-white/70 dark:border-white/10";

const DEFAULT_NOTE = "⚠ هامش السنة الإضافية للسكني منخفض (~14%) — يستحق مراجعة التسعير";

function PathBreakdownTable({ rows }) {
  return (
    <table className="w-full min-w-[640px] border-collapse">
      <thead>
        <tr>
          <th className={TH}>المسار</th>
          <th className={`${TH} text-center`}>يدفع العميل</th>
          <th className={`${TH} text-center`}>إيجار</th>
          <th className={`${TH} text-center`}>موياسر</th>
          <th className={`${TH} text-center`}>الهامش</th>
          <th className={`${TH} text-center`}>%</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const label = row.label ?? row.path ?? row.service ?? row.name;
          const pay = pick(row, "customer_pays", "pay", "client_pays");
          const ejar = pick(row, "ejar", "ejar_fee", "ejar_cost");
          const moyasar = pick(row, "moyasar", "gateway_fee", "moyasar_fee");
          const margin = pick(row, "margin", "value");
          const pct = pick(row, "margin_percent", "percent", "pct");
          const warn = row.highlight || row.warn;

          return (
            <tr key={label} className={cn(warn && "bg-[#FFF7ED] dark:bg-amber-500/10")}>
              <td className={`${TD} font-semibold text-gray-900 dark:text-white`}>{label}</td>
              <td className={`${TD} text-center tabular-nums`}>{Number(pay ?? 0).toLocaleString("en-US")}</td>
              <td className={`${TD} text-center tabular-nums`}>{Number(ejar ?? 0).toLocaleString("en-US")}</td>
              <td className={`${TD} text-center tabular-nums`}>{Number(moyasar ?? 0).toLocaleString("en-US")}</td>
              <td className={`${TD} text-center tabular-nums font-bold`}>{Number(margin ?? 0).toLocaleString("en-US")}</td>
              <td className={`${TD} text-center`}>{pct ?? 0}%</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function ServiceValueTable({ rows }) {
  return (
    <table className="w-full min-w-[480px] border-collapse">
      <thead>
        <tr>
          <th className={TH}>الخدمة</th>
          <th className={TH}>الكمية</th>
          <th className={TH}>القيمة</th>
          <th className={TH}>النسبة</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.service ?? row.label} className={cn(row.highlight && "bg-[#FFF7ED] dark:bg-amber-500/10")}>
            <td className={`${TD} font-semibold text-gray-900 dark:text-white`}>{row.label ?? row.service}</td>
            <td className={TD}>{row.qty}</td>
            <td className={`${TD} tabular-nums`}>{money(row.value)}</td>
            <td className={TD}>{row.percent ?? row.pct ?? 0}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function UnitEconomicsTable({ rows, note }) {
  if (!rows.length) return <EmptyNote />;

  const isPathBreakdown = rows.some(
    (row) => row.customer_pays != null || row.pay != null || row.ejar != null || row.moyasar != null || row.gateway_fee != null
  );

  return (
    <>
      <div className="overflow-x-auto -mx-1">
        {isPathBreakdown ? <PathBreakdownTable rows={rows} /> : <ServiceValueTable rows={rows} />}
      </div>
      <p className="text-xs text-[#9A6100] mt-3 dark:text-amber-300">{note ?? DEFAULT_NOTE}</p>
    </>
  );
}
