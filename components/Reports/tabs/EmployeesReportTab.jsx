"use client";

import { cn } from "@/lib/utils";
import { ReportKpiGrid } from "../shared/ReportKpiCard";
import HorizontalBarChart from "../shared/HorizontalBarChart";
import ReportSectionCard from "../shared/ReportSectionCard";
import {
  COMPLETED_BY_EMPLOYEE,
  EMPLOYEE_DETAIL,
  EMPLOYEES_KPIS,
  SHIFT_PERFORMANCE,
} from "../mock-data";

const TH =
  "px-3 py-3 text-[12px] font-semibold text-[#9CA3AF] border-b border-[#EEF1F0] whitespace-nowrap text-right";

const TD = "px-3 py-3 text-[13px] text-[#374151] border-b border-[#F3F4F6] whitespace-nowrap";

function StatusPill({ status }) {
  const onDuty = status === "on_duty";
  return (
    <span
      className={cn(
        "inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold",
        onDuty
          ? "bg-[#DCFCE7] text-[#15803D]"
          : "bg-[#F3F4F6] text-[#6B7280]"
      )}
    >
      {onDuty ? "في الخدمة" : "خارج الخدمة"}
    </span>
  );
}

export default function EmployeesReportTab() {
  return (
    <div className="flex flex-col gap-5">
      <ReportKpiGrid items={EMPLOYEES_KPIS} columns="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" />

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <ReportSectionCard
          title="ملخص الورديات والأداء – SLA استلام 5 دقائق"
          className="xl:col-span-3"
        >
          <div className="overflow-x-auto -mx-1">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr>
                  <th className={TH}>الموظف</th>
                  <th className={TH}>الوردية</th>
                  <th className={TH}>الحالة</th>
                  <th className={TH}>مستلم</th>
                  <th className={TH}>مفتوح</th>
                  <th className={TH}>متأخر (+24 س)</th>
                  <th className={TH}>منجز</th>
                  <th className={TH}>متوسط الاستلام</th>
                  <th className={TH}>التزام الاستلام</th>
                  <th className={TH}>الدرجة</th>
                </tr>
              </thead>
              <tbody>
                {SHIFT_PERFORMANCE.map((row) => (
                  <tr key={row.name}>
                    <td className={cn(TD, "font-semibold text-[#111827]")}>{row.name}</td>
                    <td className={TD}>{row.shift}</td>
                    <td className={TD}>
                      <StatusPill status={row.status} />
                    </td>
                    <td className={TD}>{row.received}</td>
                    <td className={cn(TD, row.open > 0 && "text-[#DC2626] font-semibold")}>
                      {row.open}
                    </td>
                    <td className={TD}>{row.late}</td>
                    <td className={TD}>{row.done}</td>
                    <td className={TD}>{row.avgReceipt}</td>
                    <td className={TD}>{row.sla}</td>
                    <td className={cn(TD, "font-bold")}>{row.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-[#9CA3AF] mt-2">
            * يُحسب SLA الاستلام من لحظة وصول الطلب حتى أول إجراء من الموظف.
          </p>
        </ReportSectionCard>

        <ReportSectionCard title="أداء الموظفين – تفصيلي" className="xl:col-span-2">
          <div className="overflow-x-auto -mx-1">
            <table className="w-full min-w-[480px] border-collapse">
              <thead>
                <tr>
                  <th className={TH}>الموظف</th>
                  <th className={TH}>مسند</th>
                  <th className={TH}>مكتمل</th>
                  <th className={TH}>متأخر</th>
                  <th className={TH}>مسترجع</th>
                  <th className={TH}>متوسط المعالجة</th>
                  <th className={TH}>إيراد محقق</th>
                </tr>
              </thead>
              <tbody>
                {EMPLOYEE_DETAIL.map((row) => (
                  <tr key={row.name}>
                    <td className={cn(TD, "font-semibold text-[#111827]")}>{row.name}</td>
                    <td className={TD}>{row.assigned}</td>
                    <td className={TD}>{row.completed}</td>
                    <td className={TD}>{row.late}</td>
                    <td className={TD}>{row.returned}</td>
                    <td className={TD}>{row.avgProcess}</td>
                    <td className={cn(TD, "tabular-nums")}>
                      {row.revenue.toLocaleString("en-US")} ريال
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportSectionCard>
      </div>

      <ReportSectionCard title="العقود المكتملة حسب الموظف" className="max-w-xl">
        <HorizontalBarChart items={COMPLETED_BY_EMPLOYEE} />
      </ReportSectionCard>
    </div>
  );
}
