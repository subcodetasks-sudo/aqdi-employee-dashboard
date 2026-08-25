/** Static filter/label config for the Reports tabs — actual analytics data comes
 *  from src/hooks/use-reports.js and related report hooks, not mock data. */

export const REPORT_TABS = [
  { id: "orders", label: "الطلبات" },
  { id: "sales", label: "المبيعات والإيرادات", badge: "Financial" },
  { id: "profits", label: "الأرباح والتكاليف", badge: "Financial" },
  { id: "operating-expenses", label: "المصروفات التشغيلية", badge: "Financial" },
  { id: "employees", label: "الموظفون" },
  { id: "customers", label: "العملاء" },
  { id: "marketing", label: "المصادر والتسويق" },
  { id: "performance", label: "لوحة الأداء" },
];

export const PERIOD_FILTERS = [
  { id: "all", label: "الكل" },
  { id: "last_30_days", label: "آخر 30 يوماً" },
  { id: "last_7_days", label: "آخر 7 أيام" },
  { id: "today", label: "اليوم" },
  { id: "custom", label: "مدة محددة" },
];

export const CONTRACT_TYPES = [
  { id: "all", label: "كل الأنواع" },
  { id: "housing", label: "سكني" },
  { id: "commercial", label: "تجاري" },
];

export const EMPLOYEE_FILTERS = [
  { id: "all", label: "كل الموظفين" },
  { id: "rayan", label: "ريان" },
  { id: "ahmed", label: "أحمد" },
  { id: "noura", label: "نورة" },
];
