"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/src/stores/user-store";

const PERIOD_OPTIONS = [
  { value: "all", label: "كل الفترات" },
  { value: "morning", label: "وردية الصباح" },
  { value: "evening", label: "وردية المساء" },
];

const TIME_FILTERS = [
  { value: "today", label: "اليوم" },
  { value: "yesterday", label: "أمس" },
  { value: "7days", label: "آخر 7 أيام" },
  { value: "30days", label: "آخر 30 يومًا" },
];

const MOCK_PERFORMANCE = [
  {
    id: 1,
    name: "ريان",
    isCurrentUser: true,
    shift: "وردية الصباح 9:00ص - 5:00م",
    onDuty: true,
    score: 72,
    stats: {
      openNow: 19,
      receivedToday: 11,
      completed: 0,
      lateOver24h: 4,
    },
    metrics: [
      { label: "سرعة الاستلام أثناء الدوام", value: 100, color: "bg-[#0B5345]" },
      { label: "التزام المعالجة (بدون تأخير > 24س)", value: 79, color: "bg-[#F59E0B]" },
      { label: "حجم الإنجاز مقارنة بالأعلى", value: 0, color: "bg-[#D1D5DB]" },
    ],
  },
  {
    id: 2,
    name: "أحمد",
    isCurrentUser: false,
    shift: "وردية المساء 5:00م - 1:00ص",
    onDuty: false,
    score: 80,
    stats: {
      openNow: 1,
      receivedToday: 0,
      completed: 0,
      lateOver24h: 0,
    },
    metrics: [
      { label: "سرعة الاستلام أثناء الدوام", value: 100, color: "bg-[#0B5345]" },
      { label: "التزام المعالجة (بدون تأخير > 24س)", value: 100, color: "bg-[#0B5345]" },
      { label: "حجم الإنجاز مقارنة بالأعلى", value: 0, color: "bg-[#D1D5DB]" },
    ],
  },
];

function ScoreRing({ score }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#0B5345" : score >= 60 ? "#F59E0B" : "#DC2626";

  return (
    <div className="relative size-[130px] shrink-0">
      <svg className="size-full -rotate-90" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={radius} fill="none" stroke="#F3F4F6" strokeWidth="10" />
        <circle
          cx="65"
          cy="65"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[28px] font-black text-[#111827] leading-none">{score}</span>
        <span className="text-[11px] text-[#9CA3AF] mt-1">من 100</span>
      </div>
    </div>
  );
}

function PerformanceCard({ employee, timeFilter }) {
  const displayName = employee.isCurrentUser ? `${employee.name} (أنت)` : employee.name;

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
      <div className="p-5 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-[16px] font-bold text-[#111827]">{displayName}</h3>
            <p className="text-[12px] text-[#9CA3AF] mt-1">{employee.shift}</p>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-[11px] font-semibold",
                employee.onDuty
                  ? "bg-[#D1FAE5] text-[#047857]"
                  : "bg-[#F3F4F6] text-[#6B7280]"
              )}
            >
              {employee.onDuty && (
                <span className="size-1.5 rounded-full bg-[#10B981]" />
              )}
              {employee.onDuty ? "داخل الدوام الآن" : "خارج الدوام"}
            </span>
          </div>
          <ScoreRing score={employee.score} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-[#F9FAFB] p-3 text-center">
            <p className="text-[18px] font-black text-[#111827]">{employee.stats.openNow}</p>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">مفتوح الآن</p>
          </div>
          <div className="rounded-xl bg-[#F9FAFB] p-3 text-center">
            <p className="text-[18px] font-black text-[#111827]">{employee.stats.receivedToday}</p>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">
              استلم ({timeFilter === "today" ? "اليوم" : "الفترة"})
            </p>
          </div>
          <div className="rounded-xl bg-[#F9FAFB] p-3 text-center">
            <p className="text-[18px] font-black text-[#111827]">{employee.stats.completed}</p>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">منجز بالفترة</p>
          </div>
          <div className="rounded-xl bg-[#F9FAFB] p-3 text-center">
            <p
              className={cn(
                "text-[18px] font-black",
                employee.stats.lateOver24h > 0 ? "text-[#DC2626]" : "text-[#111827]"
              )}
            >
              {employee.stats.lateOver24h}
            </p>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">متأخر &gt; 24س</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {employee.metrics.map((metric) => (
            <div key={metric.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-[#6B7280]">{metric.label}</span>
                <span className="text-[11px] font-bold text-[#374151]">{metric.value}%</span>
              </div>
              <div className="h-2 rounded-full bg-[#F3F4F6] overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", metric.color)}
                  style={{ width: `${metric.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-dashed border-[#E5E7EB] p-4">
          <p className="text-[12px] font-semibold text-[#374151] mb-1">آخر التحركات</p>
          <p className="text-[12px] text-[#9CA3AF]">لا تحركات مسجلة بعد</p>
        </div>
      </div>

      <Link
        href={`/home/roles-and-employees/employees/${employee.id}`}
        className="flex items-center justify-center gap-1.5 py-3.5 border-t border-[#E5E7EB] text-[13px] font-semibold text-[#0B5345] hover:bg-[#F0F7F4] transition-colors"
      >
        التفاصيل الكاملة
        <ChevronLeft className="size-4" />
      </Link>
    </div>
  );
}

export default function PerformanceTab() {
  const [timeFilter, setTimeFilter] = useState("today");
  const [periodFilter, setPeriodFilter] = useState("all");
  const { user } = useUserStore();

  const employees = useMemo(() => {
    return MOCK_PERFORMANCE.map((emp) => ({
      ...emp,
      isCurrentUser: user?.name ? emp.name === user.name.split(" ")[0] : emp.isCurrentUser,
    }));
  }, [user?.name]);

  const timeLabel = TIME_FILTERS.find((f) => f.value === timeFilter)?.label || "اليوم";

  return (
    <div className="flex flex-col gap-5" dir="rtl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-[#111827]">
            أداء الموظفين حسب الورديات ({timeLabel})
          </h2>
          <p className="text-[12px] text-[#9CA3AF] mt-1 max-w-xl">
            يُحسب التوقيت للطلبات المستلمة خلال ساعات الوردية — البيانات تجريبية حتى ربط واجهة الأداء
          </p>
        </div>

        <select
          value={periodFilter}
          onChange={(e) => setPeriodFilter(e.target.value)}
          className="h-9 px-3 rounded-lg border border-[#E5E7EB] bg-white text-[13px] text-[#374151] focus:outline-none focus:border-[#0B5345]"
        >
          {PERIOD_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1 border-b border-[#E5E7EB]">
        {TIME_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setTimeFilter(filter.value)}
            className={cn(
              "px-4 py-2.5 text-[13px] font-semibold transition-colors border-b-2 -mb-px",
              timeFilter === filter.value
                ? "text-[#0B5345] border-[#0B5345]"
                : "text-[#9CA3AF] border-transparent hover:text-[#374151]"
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {employees.map((employee) => (
          <PerformanceCard key={employee.id} employee={employee} timeFilter={timeFilter} />
        ))}
      </div>
    </div>
  );
}
