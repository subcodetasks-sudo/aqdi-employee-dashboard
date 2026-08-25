"use client";

import Loader from "@/components/home/loader";
import { usePerformanceReport } from "@/src/hooks/use-reports";
import { ReportKpiGrid } from "../shared/ReportKpiCard";
import HorizontalBarChart, { VerticalBarChart } from "../shared/HorizontalBarChart";
import ReportSectionCard, { ReportLineList } from "../shared/ReportSectionCard";
import ReportError from "../shared/ReportError";
import EmptyNote from "../shared/EmptyNote";
import { money, toArabicDigits } from "../shared/report-format";
import ConversionFunnel from "./performance/ConversionFunnel";
import UnitEconomicsTable from "./performance/UnitEconomicsTable";
import FinancialSettingsCard from "./performance/FinancialSettingsCard";
import { usePerformanceReportViewModel } from "./performance/usePerformanceReportViewModel";

export default function PerformanceReportTab({ period, dateFrom, dateTo, contractType, employee }) {
  const { data, isLoading, isError, error } = usePerformanceReport(
    period,
    dateFrom,
    dateTo,
    contractType,
    employee
  );

  const vm = usePerformanceReportViewModel(data, period);

  if (isLoading) return <Loader />;
  if (isError) return <ReportError title="لوحة الأداء" error={error} fallback="تعذّر تحميل لوحة الأداء." />;

  return (
    <div className="flex flex-col gap-5" dir="rtl">
      <ReportKpiGrid items={vm.kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReportSectionCard title="قمع التحويل">
          <ConversionFunnel stages={vm.funnelRaw} leakage={vm.leakage} />
        </ReportSectionCard>

        <ReportSectionCard title="معدّلات التحويل">
          {vm.conversionRateItems.length ? <ReportLineList items={vm.conversionRateItems} /> : <EmptyNote />}
        </ReportSectionCard>

        <ReportSectionCard
          title={`الاتجاه اليومي للطلبات (آخر ${toArabicDigits(vm.dailyTitleDays)} ${vm.dailyTitleDays <= 10 ? "أيام" : "يومًا"})`}
        >
          {vm.dailyOrders.length ? <VerticalBarChart items={vm.dailyOrders} height={160} showValues /> : <EmptyNote />}
        </ReportSectionCard>

        <ReportSectionCard title="الطلبات حسب الحالة">
          {vm.ordersByStatus.length ? <HorizontalBarChart items={vm.ordersByStatus} /> : <EmptyNote />}
        </ReportSectionCard>

        <ReportSectionCard title="توزيع نوع العقد">
          {vm.byContract.length ? <HorizontalBarChart items={vm.byContract} /> : <EmptyNote />}
        </ReportSectionCard>

        <ReportSectionCard title="أداء الموظفين (طلبات مُستلمة)">
          {vm.byEmployee.length ? (
            <HorizontalBarChart items={vm.byEmployee} />
          ) : (
            <EmptyNote>لا استلامات في هذه الفترة.</EmptyNote>
          )}
        </ReportSectionCard>

        <ReportSectionCard title="الأداء التشغيلي — طابور الاستلام">
          <ReportLineList items={vm.operationalItems} />
        </ReportSectionCard>

        <ReportSectionCard title="الإيرادات حسب طريقة الدفع">
          {vm.paymentMethods.length ? (
            <HorizontalBarChart items={vm.paymentMethods.map((row) => ({ ...row, suffix: row.suffix ?? "ريال" }))} />
          ) : (
            <EmptyNote />
          )}
        </ReportSectionCard>

        <ReportSectionCard title={`قائمة الدخل (P&L) — ${vm.periodLabel}`}>
          {vm.pnl.length ? <ReportLineList items={vm.pnl} /> : <EmptyNote />}
        </ReportSectionCard>

        <ReportSectionCard title="اقتصاد العقد الواحد (بعد إيجار وموياسر)">
          <UnitEconomicsTable rows={vm.unitEconomics} note={vm.unitEconomicsNote} />
        </ReportSectionCard>

        <FinancialSettingsCard />

        <ReportSectionCard title="الملخّص المالي الشامل — حسب المصدر">
          {vm.financialSummary.length ? <ReportLineList items={vm.financialSummary} /> : <EmptyNote />}
        </ReportSectionCard>

        <ReportSectionCard title="الطلبات حسب نوع الوثيقة">
          {vm.byDocType.length ? <HorizontalBarChart items={vm.byDocType} /> : <EmptyNote />}
        </ReportSectionCard>

        <ReportSectionCard title="أكثر أخطاء التصحيح شيوعًا">
          {vm.correctionErrors.length ? (
            <HorizontalBarChart items={vm.correctionErrors} />
          ) : (
            <EmptyNote>لا طلبات تصحيح بعد.</EmptyNote>
          )}
        </ReportSectionCard>

        <ReportSectionCard title="طلبات الاسترجاع وحالاتها">
          {vm.refundBars.length ? (
            <div className="flex flex-col gap-3">
              <HorizontalBarChart items={vm.refundBars} />
              {vm.refundTotal != null && (
                <div className="flex items-center justify-between pt-2 border-t border-surface-border-soft text-13 dark:border-white/10">
                  <span className="font-bold text-gray-600 dark:text-white/60">إجمالي المبالغ المسترجعة</span>
                  <b className="tabular-nums text-[#557086] dark:text-slate-300">{money(vm.refundTotal)}</b>
                </div>
              )}
            </div>
          ) : (
            <EmptyNote>لا طلبات استرجاع.</EmptyNote>
          )}
        </ReportSectionCard>
      </div>
    </div>
  );
}
