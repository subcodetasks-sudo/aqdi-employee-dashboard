/** Mock analytics data — replace with API when endpoints are ready. */

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

export const ORDERS_KPIS = [
  { key: "total", label: "إجمالي الطلبات", value: 72, icon: "file" },
  { key: "new", label: "طلبات جديدة", value: 36, icon: "filePlus", tone: "danger" },
  { key: "paid", label: "مدفوعة", value: 61, icon: "creditCard" },
  { key: "draft", label: "مسودة عقد", value: 8, icon: "fileEdit", tone: "warning" },
  { key: "incomplete", label: "غير مكتمل", value: 2, icon: "xCircle", tone: "warning" },
  { key: "canceled", label: "ملغية", value: 3, icon: "xCircle", tone: "danger" },
  { key: "returned", label: "مسترجعة", value: 3, icon: "undo", tone: "muted" },
  { key: "avgTime", label: "متوسط مدة الإنجاز", value: "1 س و 55 د", icon: "clock", isText: true },
];

export const ORDERS_BY_EMPLOYEE = [
  { label: "ريان", value: 30, color: "#0B5345" },
  { label: "أحمد", value: 2, color: "#6EE7B7" },
  { label: "نورة", value: 1, color: "#34D399" },
];

export const ORDERS_BY_CONTRACT = [
  { label: "سكني", value: 46, color: "#0B5345" },
  { label: "تجاري", value: 26, color: "#1E40AF" },
];

export const ORDERS_BY_STAGE = [
  { label: "طلب جديد", value: 36, color: "#EA580C" },
  { label: "مستلم", value: 14, color: "#0B5345" },
  { label: "مرفوع تحديث العقار", value: 2, color: "#CA8A04" },
  { label: "ينتظر مسودة العقد", value: 4, color: "#CA8A04" },
  { label: "موثق في إيجار", value: 8, color: "#0B5345" },
  { label: "طلب غير مكتمل", value: 2, color: "#CA8A04" },
  { label: "مسترجع", value: 3, color: "#9CA3AF" },
  { label: "ملغي", value: 3, color: "#DC2626" },
];

export const SALES_KPIS = [
  { key: "totalSales", label: "إجمالي المبيعات (ريال)", value: 18859, icon: "wallet" },
  { key: "payments", label: "عدد عمليات الدفع", value: 61, icon: "receipt" },
  { key: "avgOrder", label: "متوسط قيمة الطلب", value: 309, icon: "creditCard" },
  { key: "discounts", label: "الخصومات المستخدمة", value: 0, icon: "tag" },
  { key: "refunds", label: "المبالغ المسترجعة", value: 847, icon: "undo" },
  { key: "netRevenue", label: "صافي الإيرادات", value: 18012, icon: "banknote" },
];

export const SALES_BY_PERIOD = [
  { label: "اليوم", value: 2743, suffix: "ريال" },
  { label: "هذا الشهر", value: 18859, suffix: "ريال" },
  { label: "هذه السنة", value: 18859, suffix: "ريال" },
];

export const DAILY_SALES = [
  { date: "15/7", value: 1200 },
  { date: "16/7", value: 800 },
  { date: "17/7", value: 1500 },
  { date: "18/7", value: 900 },
  { date: "19/7", value: 10200 },
  { date: "20/7", value: 1100 },
  { date: "21/7", value: 700 },
];

export const REVENUE_BY_CONTRACT = [
  { label: "سكني", value: 10639, suffix: "ريال", color: "#0B5345" },
  { label: "تجاري", value: 8220, suffix: "ريال", color: "#1E40AF" },
];

export const REVENUE_BY_DURATION = [
  { label: "سنة واحدة", value: 16732, suffix: "ريال", color: "#0B5345" },
  { label: "3 سنوات", value: 2127, suffix: "ريال", color: "#0D9488" },
];

export const SALES_SUMMARY = [
  { label: "الخصومات الممنوحة", value: "0 ريال", tone: "gold" },
  { label: "عدد الطلبات المخصومة", value: "0 طلب" },
  { label: "المبالغ المسترجعة", value: "847 ريال" },
  { label: "نسبة الاسترجاع من المبيعات", value: "4%" },
  { label: "صافي الإيرادات بعد الاسترجاع =", value: "18,012 ريال", tone: "green", bold: true },
];

export const PROFITS_KPIS = [
  { key: "income", label: "دخل العملاء", value: 18859, icon: "wallet" },
  { key: "totalProfit", label: "إجمالي الربح", value: 7898, icon: "wallet" },
  { key: "netProfit", label: "صافي الربح", value: -15935, icon: "wallet", tone: "danger" },
  { key: "margin", label: "هامش الربح", value: "-88%", icon: "percent", tone: "danger", isText: true },
  { key: "profitPerOrder", label: "ربح لكل طلب", value: 137, icon: "wallet" },
  { key: "adSpend", label: "مصاريف الإعلانات", value: 6500, icon: "wallet", tone: "danger" },
];

export const PNL_LINES = [
  { label: "دخل العملاء (المحصّل)", value: "18,859 ريال", tone: "green" },
  { label: "(−) الاسترجاعات", value: "847 ريال" },
  { label: "= صافي الإيرادات", value: "18,012 ريال", tone: "green", separator: true },
  { label: "(−) رسوم منصة إيجار", value: "9,600 ريال", tone: "red" },
  { label: "(−) رسوم بوابة الدفع (Moyasar 2.5%)", value: "471 ريال", tone: "red" },
  { label: "(−) تكلفة الرسائل", value: "43 ريال", tone: "red" },
  { label: "= إجمالي الربح", value: "7,898 ريال", tone: "green", separator: true },
  { label: "(−) مصاريف الإعلانات", value: "6,500 ريال", tone: "red" },
  { label: "(−) مصاريف تشغيلية", value: "4,333 ريال", tone: "red" },
  { label: "(−) الرواتب (13 يوم)", value: "13,000 ريال", tone: "red" },
  { label: "= صافي الربح", value: "−15,935 ريال (−88%)", tone: "red", bold: true },
];

export const SERVICE_PROFITABILITY = [
  { label: "توثيق سكني – السنة الأولى", value: 118, margin: "47%", medal: true, color: "#0B5345" },
  { label: "توثيق تجاري – السنة الأولى", value: 140, margin: "40%", color: "#0B5345" },
  { label: "تجاري – سنة إضافية", value: 87, margin: "17%", color: "#0D9488" },
  { label: "سكني – سنة إضافية", value: 21, margin: "14%", color: "#DC2626" },
];

export const PROFIT_SETTINGS = [
  { key: "moyasar", label: "رسوم Moyasar", value: "2.5", unit: "%" },
  { key: "salaries", label: "الرواتب الشهرية", value: "30,000", unit: "ريال" },
  { key: "operating", label: "المصاريف التشغيلية", value: "10,000", unit: "ريال" },
  { key: "marketing", label: "ميزانية التسويق", value: "15,000", unit: "ريال" },
];

/**
 * Employees-tab data now comes from the real `/admin/employees/kpis` API
 * (see src/hooks/use-employee-kpis.js) instead of mock data.
 */

export const CUSTOMERS_KPIS = [
  { key: "total", label: "إجمالي العملاء", value: 56, icon: "users" },
  { key: "new", label: "عملاء جدد", value: 54, icon: "userPlus" },
  { key: "returning", label: "عملاء عائدون", value: 2, icon: "userCheck" },
  { key: "avgContracts", label: "متوسط العقود لكل عميل", value: "1.3", icon: "file", isText: true },
  { key: "incomplete", label: "لم يكملوا الطلب", value: 2, icon: "xCircle", tone: "warning" },
];

export const CUSTOMER_SEGMENTS = [
  { label: "عملاء جدد", value: 54, color: "#0B5345" },
  { label: "عملاء عائدون", value: 2, color: "#6EE7B7" },
];

export const TOP_CUSTOMERS = [
  { name: "سعد محمد الغنام", mobile: "0551234567", contracts: 16, paid: 12, spending: 4057 },
  { name: "فهد العتيبي", mobile: "0509876543", contracts: 8, paid: 7, spending: 2890 },
  { name: "نورة السبيعي", mobile: "0531112233", contracts: 5, paid: 4, spending: 1540 },
  { name: "أحمد الشمري", mobile: "0544445566", contracts: 3, paid: 3, spending: 920 },
  { name: "ريم الحربي", mobile: "0567778899", contracts: 2, paid: 2, spending: 618 },
];

export const MARKETING_KPIS = [
  { key: "totalOrders", label: "إجمالي الطلبات", value: 72, icon: "package" },
  { key: "paidCustomers", label: "عملاء مدفوعون", value: 61, icon: "userCheck" },
  { key: "sources", label: "عدد المصادر", value: 5, icon: "layers" },
  { key: "adSpend", label: "الإنفاق الإعلاني", value: 69500, icon: "creditCard" },
];

export const ORDERS_BY_SOURCE = [
  { label: "Google", orders: 21, paid: 17, revenue: 5200, color: "#0B5345" },
  { label: "إعلان مدفوع", orders: 18, paid: 15, revenue: 4600, color: "#0D9488" },
  { label: "WhatsApp", orders: 15, paid: 13, revenue: 3900, color: "#1E40AF" },
  { label: "TikTok", orders: 10, paid: 8, revenue: 2400, color: "#7C3AED" },
  { label: "مباشر", orders: 8, paid: 8, revenue: 2759, color: "#6B7280" },
];

export const SOURCE_CAC = [
  { source: "Google", orders: 21, paid: 17, revenue: 5200, spend: 32000, cac: 1912, conversion: "81%" },
  { source: "إعلان مدفوع", orders: 18, paid: 15, revenue: 4600, spend: 18000, cac: 1200, conversion: "83%" },
  { source: "WhatsApp", orders: 15, paid: 13, revenue: 3900, spend: 5000, cac: 385, conversion: "87%" },
  { source: "TikTok", orders: 10, paid: 8, revenue: 2400, spend: 9500, cac: 1187, conversion: "80%" },
  { source: "مباشر", orders: 8, paid: 8, revenue: 2759, spend: 0, cac: 0, conversion: "100%" },
];

export const TOP_KEYWORDS = [
  { label: "عقد إيجار إلكتروني", value: 27600, color: "#0B5345" },
  { label: "توثيق عقد سكني", value: 18200, color: "#0D9488" },
  { label: "عقد إيجار تجاري", value: 12400, color: "#1E40AF" },
  { label: "تسجيل عقد إيجار", value: 8900, color: "#6B7280" },
];

export const WEAK_CAMPAIGNS = [
  { name: "إكس (تويتر) – ترويج", roas: "×0.84", profit: "−900 ريال", tone: "danger" },
  { name: "قوقل – حملة تعريفية (عرض)", roas: "×1.08", profit: "+600 ريال", tone: "warning" },
];

export const PERFORMANCE_KPIS = [
  { key: "revenue", label: "إجمالي الإيرادات", value: 16342, icon: "banknote" },
  { key: "refunded", label: "مسترجعة", value: 3, icon: "undo" },
  { key: "delayed", label: "متأخرة", value: 3, icon: "clock", tone: "warning" },
  { key: "canceled", label: "ملغية", value: 20, icon: "xCircle", tone: "danger" },
  { key: "active", label: "نشطة", value: 8, icon: "activity" },
  { key: "total", label: "إجمالي الطلبات", value: 72, icon: "package" },
];

export const CONVERSION_FUNNEL = [
  { label: "زيارة", value: 420, pct: "100%" },
  { label: "بدء الطلب", value: 156, pct: "37%" },
  { label: "دفع", value: 61, pct: "15%" },
  { label: "إتمام", value: 53, pct: "13%" },
];

export const DAILY_ORDERS = [
  { date: "10/8", value: 8 },
  { date: "11/8", value: 12 },
  { date: "12/8", value: 6 },
  { date: "13/8", value: 15 },
  { date: "14/8", value: 9 },
  { date: "15/8", value: 11 },
  { date: "16/8", value: 11 },
];

export const ORDERS_BY_STATUS = [
  { label: "جديد", value: 36, color: "#EA580C" },
  { label: "قيد المعالجة", value: 14, color: "#CA8A04" },
  { label: "مكتمل", value: 8, color: "#0B5345" },
  { label: "ملغي", value: 3, color: "#DC2626" },
  { label: "مسترجع", value: 3, color: "#9CA3AF" },
];

export const REVENUE_BY_PAYMENT = [
  { label: "بطاقة", value: 16200, color: "#0B5345" },
  { label: "Apple Pay", value: 1800, color: "#1E40AF" },
  { label: "تحويل", value: 842, color: "#6B7280" },
];

export const OPERATIONAL_METRICS = [
  { label: "إجمالي الطلبات", value: "72" },
  { label: "متوسط وقت الاستلام", value: "3 د 12 ث" },
  { label: "أطول انتظار", value: "45 د" },
  { label: "نسبة الالتزام SLA", value: "96%" },
  { label: "طلبات متأخرة (+24 س)", value: "0" },
];

export const UNIT_ECONOMICS = [
  { name: "سكني – سنة", qty: 46, value: 10639, pct: "57%" },
  { name: "تجاري – سنة", qty: 26, value: 8220, pct: "43%" },
  { name: "سكني – إضافي", qty: 4, value: 890, pct: "5%", highlight: true },
  { name: "تجاري – إضافي", qty: 2, value: 620, pct: "3%" },
];
