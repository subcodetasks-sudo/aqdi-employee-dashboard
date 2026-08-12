export const MARKETING_TABS = [
  { value: "overview", label: "نظرة عامة" },
  { value: "campaigns", label: "الحملات" },
  { value: "seo", label: "SEO" },
  { value: "content", label: "إدارة المحتوى" },
  { value: "reports", label: "التقارير" },
  { value: "pixels", label: "الربط والبكسلات" },
];

export const DATE_RANGE_LABEL = "آخر 30 يومًا · حتى 24/07";
export const SCOPE_BREADCRUMB = "الحملات · المدونة · SEO · ROI";

/* ---------------- Overview ---------------- */

export const OVERVIEW_ROAS = {
  value: "x2.28",
  hint: "لكل 1 ريال صرف على الإعلانات، رجع 2.28 ريال إيرادًا مُسنَدًا",
  netProfit: "89,300+",
  attributedRevenue: "158,800",
  totalSpend: "69,500",
};

export const OVERVIEW_STATS = [
  { value: "125 ريال", label: "تكلفة العميل CAC" },
  { value: "1.4%", label: "معدل التحويل زائر←عميل" },
  { value: "868", label: "عملاء دفعوا" },
  { value: "868", label: "طلبات من التسويق" },
  { value: "18,600", label: "زيارات التطبيق", trend: { direction: "up", value: "15%" } },
  { value: "42,800", label: "زيارات الموقع", trend: { direction: "up", value: "9%" } },
];

export const CHANNEL_SPEND_REVENUE = [
  { label: "قوقل", spend: 32500, revenue: 93100 },
  { label: "ميتا", spend: 12800, revenue: 27900 },
  { label: "تيك توك", spend: 9300, revenue: 19100 },
  { label: "سناب", spend: 9100, revenue: 13800 },
  { label: "إكس", spend: 5800, revenue: 4900 },
];

export const MARKETING_FUNNEL = [
  { label: "ظهور", value: 5215000 },
  { label: "نقرات", value: 71000, dropPct: "-99%" },
  { label: "عملاء محتملون", value: 2125, dropPct: "-97%" },
  { label: "تحويلات", value: 555, dropPct: "-74%" },
];

export const CHANNEL_ROI = [
  { source: "قوقل", spend: 32500, revenue: 93100, roas: "x2.86", cac: 101, conversions: 323, profit: "60,600+" },
  { source: "ميتا", spend: 12800, revenue: 27900, roas: "x2.18", cac: 133, conversions: 96, profit: "15,100+" },
  { source: "تيك توك", spend: 9300, revenue: 19100, roas: "x2.05", cac: 141, conversions: 66, profit: "9,800+" },
  { source: "سناب", spend: 9100, revenue: 13800, roas: "x1.52", cac: 175, conversions: 52, profit: "4,700+" },
  { source: "إكس", spend: 5800, revenue: 4900, roas: "x0.84", cac: 322, conversions: 18, profit: "900-" },
];

export const TOP_GOOGLE_KEYWORDS = [
  { rank: 1, label: "عقد إيجار إلكتروني", trend: "ثابتة" },
  { rank: 2, label: "توثيق عقد إيجار", trend: "ارتفعت" },
  { rank: 3, label: "عقد إيجار سكني", trend: "ارتفعت" },
  { rank: 3, label: "رسوم عقد إيجار", trend: "انخفضت" },
  { rank: 4, label: "نقل عداد الكهرباء للمستأجر", trend: "ارتفعت" },
];

export const TOP_PAGES_VISITED = [
  { label: "الصفحة الرئيسية", type: "صفحة", visits: 18200 },
  { label: "الأسعار والرسوم", type: "صفحة", visits: 9400 },
  { label: "توثيق عقد إيجار", type: "خدمة", visits: 7100 },
  { label: "دليل توثيق عقد الإيجار", type: "مقال", visits: 4820 },
  { label: "العقود السكنية", type: "خدمة", visits: 4300 },
];

export const TOP_CAMPAIGNS_BY_LEADS = [
  { label: "بحث قوقل – كلمات النية العالية", source: "قوقل", leads: 214 },
  { label: "ميتا – إنستغرام وفيسبوك", source: "ميتا", leads: 96 },
  { label: "قوقل – إعادة الاستهداف", source: "قوقل", leads: 78 },
  { label: "تيك توك – فيديوهات قصيرة", source: "تيك توك", leads: 66 },
  { label: "سناب شات – الوعي", source: "سناب", leads: 52 },
];

export const BEST_CAMPAIGN = {
  title: "قوقل – إعادة الاستهداف",
  source: "قوقل",
  roas: "x3.7",
  profitLabel: "ربح 16,500 ريال",
};

export const WORST_CAMPAIGN = {
  title: "إكس (تويتر) – ترويج",
  source: "إكس",
  roas: "x0.84",
  profitLabel: "خسارة 900 ريال",
};

/* ---------------- Campaigns ---------------- */

export const SYNC_PLATFORMS = [
  { label: "Google Ads", connected: true },
  { label: "Meta Ads", connected: true },
  { label: "TikTok Ads", connected: true },
  { label: "Snap Ads", connected: true },
  { label: "X Ads", connected: false },
];

export const CAMPAIGN_STATS = [
  { value: "89,300+ريال", label: "ربح صافي" },
  { value: "x2.28", label: "ROAS عام" },
  { value: "158,800 ريال", label: "الإيراد" },
  { value: "69,500 ريال", label: "الصرف" },
  { value: "4", label: "حملات نشطة" },
];

export const CAMPAIGNS = [
  {
    name: "قوقل – إعادة الاستهداف",
    source: "قوقل",
    account: "Aqdi – Google Ads",
    linked: true,
    status: "نشطة",
    spend: 6100,
    revenue: 22600,
    roas: "x3.7",
    leads: 190,
    conversions: 78,
    cac: 78,
    profit: "16,500+ريال",
  },
  {
    name: "قوقل – بحث كلمات النية العالية",
    source: "قوقل",
    account: "Aqdi – Google Ads",
    linked: true,
    status: "نشطة",
    spend: 18400,
    revenue: 61900,
    roas: "x3.36",
    leads: 610,
    conversions: 214,
    cac: 86,
    profit: "43,500+ريال",
  },
  {
    name: "ميتا – إنستغرام وفيسبوك",
    source: "ميتا",
    account: "Aqdi – Meta Business",
    linked: true,
    status: "نشطة",
    spend: 12800,
    revenue: 27900,
    roas: "x2.18",
    leads: 360,
    conversions: 96,
    cac: 133,
    profit: "15,100+ريال",
  },
  {
    name: "تيك توك – فيديوهات قصيرة",
    source: "تيك توك",
    account: "Aqdi – TikTok Ads",
    linked: true,
    status: "نشطة",
    spend: 9300,
    revenue: 19100,
    roas: "x2.05",
    leads: 410,
    conversions: 66,
    cac: 141,
    profit: "9,800+ريال",
  },
  {
    name: "سناب شات – الوعي",
    source: "سناب",
    account: "Aqdi – Snap Ads",
    linked: true,
    status: "موقوفة",
    spend: 9100,
    revenue: 13800,
    roas: "x1.52",
    leads: 300,
    conversions: 52,
    cac: 175,
    profit: "4,700+ريال",
  },
  {
    name: "قوقل – حملة تعريفية (عرض)",
    source: "قوقل",
    account: "Aqdi – Google Ads",
    linked: true,
    status: "منتهية",
    spend: 8000,
    revenue: 8600,
    roas: "x1.08",
    leads: 160,
    conversions: 31,
    cac: 258,
    profit: "600+ريال",
  },
  {
    name: "إكس (تويتر) – ترويج",
    source: "إكس",
    account: "Aqdi – X Ads",
    linked: false,
    status: "منتهية",
    spend: 5800,
    revenue: 4900,
    roas: "x0.84",
    leads: 95,
    conversions: 18,
    cac: 322,
    profit: "900-ريال",
  },
];

/* ---------------- SEO ---------------- */

export const SEO_KEYWORD_STATS = [
  { value: "90,850 ريال", label: "إيراد عضوي" },
  { value: "13,840", label: "زيارات عضوية" },
  { value: "2", label: "انخفضت", tone: "red" },
  { value: "6", label: "ارتفعت", tone: "green" },
  { value: "4.8", label: "متوسط الترتيب" },
  { value: "10", label: "كلمات مستهدفة" },
];

export const SEO_KEYWORDS = [
  { keyword: "عقد إيجار إلكتروني", page: "/aqdi", current: 1, previous: 1, volume: 14200, competition: "عالية", trend: "ثابتة", revenue: 27600, highlight: false },
  { keyword: "توثيق عقد إيجار", page: "/tawtheeq-ejar", current: 2, previous: 4, volume: 9600, competition: "عالية", trend: "ارتفعت", revenue: 18200, highlight: true },
  { keyword: "عقد إيجار سكني", page: "/residential", current: 3, previous: 5, volume: 6700, competition: "متوسطة", trend: "ارتفعت", revenue: 13400, highlight: false },
  { keyword: "رسوم عقد إيجار", page: "/pricing", current: 3, previous: 2, volume: 3300, competition: "منخفضة", trend: "انخفضت", revenue: 8300, highlight: false },
  { keyword: "نقل عداد الكهرباء للمستأجر", page: "/blog/meter", current: 4, previous: 7, volume: 2100, competition: "منخفضة", trend: "ارتفعت", revenue: 3700, highlight: false },
  { keyword: "كيف توثق عقد ايجار", page: "/blog/how-to", current: 5, previous: 9, volume: 5100, competition: "منخفضة", trend: "ارتفعت", revenue: 6400, highlight: false },
  { keyword: "منصة ايجار توثيق", page: "/vs-ejar", current: 6, previous: 6, volume: 2700, competition: "عالية", trend: "ثابتة", revenue: 2600, highlight: false },
  { keyword: "وسيط عقاري معتمد", page: "/brokers", current: 7, previous: 10, volume: 2900, competition: "متوسطة", trend: "ارتفعت", revenue: 4600, highlight: false },
  { keyword: "عقد إيجار تجاري", page: "/commercial", current: 8, previous: 12, volume: 4400, competition: "متوسطة", trend: "ارتفعت", revenue: 4900, highlight: false },
  { keyword: "صك ملكية إلكتروني", page: "/blog/deed", current: 9, previous: 8, volume: 1800, competition: "منخفضة", trend: "انخفضت", revenue: 1150, highlight: false },
];

export const SEO_CRAWL_META = {
  lastScan: "آخر فحص: 09:14 22-07-2026",
};

export const SEO_CRAWL_STATS = [
  { value: "33", label: "مشاكل On-page" },
  { value: "11", label: "صفحات/روابط معطلة" },
  { value: "121", label: "صفحات سليمة" },
  { value: "148", label: "صفحات مفهرسة" },
];

export const SEO_CRAWL_DETAILS = [
  { value: "8", label: "أوصاف مكررة", tone: "amber" },
  { value: "2", label: "عناوين مفقودة", tone: "red" },
  { value: "6", label: "عناوين مكررة", tone: "amber" },
  { value: "5", label: "غير قابلة للفهرسة", tone: "amber" },
  { value: "9", label: "صفحات بطيئة", tone: "amber" },
  { value: "4", label: "صفحات خطأ 404", tone: "red" },
  { value: "7", label: "روابط معطلة", tone: "red" },
  { value: "121", label: "صفحات سليمة", tone: "green" },
  { value: "12", label: "روابط داخلية ضعيفة", tone: "amber" },
  { value: "3", label: "صفحات بدون H1", tone: "red" },
  { value: "23", label: "صور بدون نص بديل", tone: "amber" },
  { value: "5", label: "أوصاف مفقودة", tone: "red" },
];

export const SEO_PAGE_ISSUES = [
  { page: "/blog/old-guide", issue: "رابط داخلي معطل (404)", severity: "عالية" },
  { page: "/promo/2024", issue: "صفحة خطأ 404", severity: "عالية" },
  { page: "/commercial", issue: "وصف ميتا مفقود", severity: "متوسطة" },
  { page: "/residential", issue: "عنوان صفحة مكرر مع /commercial", severity: "متوسطة" },
  { page: "/blog/deed", issue: "زمن تحميل بطيء (3.8ث)", severity: "متوسطة" },
  { page: "/pricing", issue: "صور بدون نص بديل (4 صور)", severity: "منخفضة" },
  { page: "/brokers", issue: "لا يوجد عنوان H1 رئيسي", severity: "متوسطة" },
  { page: "/faq", issue: "روابط داخلية ضعيفة", severity: "منخفضة" },
  { page: "/blog/meter", issue: "وصف ميتا مكرر", severity: "منخفضة" },
];

/* ---------------- Content management ---------------- */

export const SERVICE_PAGE_STATS = [
  { value: "1", label: "مسودات", tone: "amber" },
  { value: "2", label: "منشورة", tone: "green" },
  { value: "3", label: "إجمالي الصفحات" },
];

export const SERVICE_PAGES = [
  { title: "توثيق عقد إيجار سكني", link: "/residential", keyword: "عقد إيجار سكني", status: "منشور", date: "2026-05-12" },
  { title: "توثيق عقد إيجار تجاري", link: "/commercial", keyword: "عقد إيجار تجاري", status: "منشور", date: "2026-05-12" },
  { title: "الأسعار والرسوم", link: "/pricing", keyword: "رسوم عقد إيجار", status: "مسودة", date: "–" },
];

export const ARTICLE_STATS = [
  { value: "57,200 ريال", label: "إيراد مُسند" },
  { value: "14,430", label: "مشاهدات" },
  { value: "0", label: "مؤرشفة" },
  { value: "1", label: "مجدولة", tone: "amber" },
  { value: "4", label: "منشورة", tone: "green" },
  { value: "6", label: "إجمالي المقالات" },
];

export const ARTICLE_CATEGORIES = [
  "الكل",
  "نصائح للمستأجرين",
  "نصائح للملاك",
  "أخبار تنظيمية",
  "مقارنات",
  "أدلة إرشادية",
];

export const ARTICLES = [
  {
    title: "دليلك الكامل لتوثيق عقد الإيجار إلكترونيًا 2026",
    category: "أدلة إرشادية",
    author: "ريان",
    status: "منشور",
    date: "2026-07-15",
    words: 1840,
    views: 4820,
    leads: 186,
    revenue: "20,400ريال",
  },
  {
    title: "الفرق بين إيجار وعقدي: أيهما أسرع وأوفر؟",
    category: "مقارنات",
    author: "فريق المحتوى",
    status: "منشور",
    date: "2026-07-10",
    words: 1520,
    views: 3110,
    leads: 132,
    revenue: "12,600ريال",
  },
  {
    title: "كيف تنقل عداد الكهرباء باسم المستأجر بخطوات",
    category: "نصائح للملاك",
    author: "نورة",
    status: "منشور",
    date: "2026-07-06",
    words: 1120,
    views: 2540,
    leads: 98,
    revenue: "9,400ريال",
  },
  {
    title: "رسوم توثيق العقود التجارية: ما تحتاج معرفته",
    category: "أخبار تنظيمية",
    author: "فريق المحتوى",
    status: "مجدول",
    date: "2026-07-27",
    words: 980,
    views: 0,
    leads: 0,
    revenue: "0ريال",
  },
  {
    title: "صك الملكية الإلكتروني وأنواعه في السعودية",
    category: "أدلة إرشادية",
    author: "أحمد",
    status: "مسودة",
    date: "–",
    words: 640,
    views: 0,
    leads: 0,
    revenue: "0ريال",
  },
  {
    title: "7 أخطاء شائعة عند كتابة عقد الإيجار",
    category: "نصائح للمستأجرين",
    author: "نورة",
    status: "منشور",
    date: "2026-06-28",
    words: 1330,
    views: 3960,
    leads: 151,
    revenue: "14,800ريال",
  },
];

export const EDITORIAL_QUEUE = [
  {
    title: "صك الملكية الإلكتروني وأنواعه في السعودية",
    tag: "أدلة إرشادية",
    date: "غير مجدول",
  },
  {
    title: "رسوم توثيق العقود التجارية: ما تحتاج معرفته",
    tag: "أخبار تنظيمية",
    date: "2026-07-27",
    status: "مجدول",
  },
];

/* ---------------- Reports ---------------- */

export const REPORT_HIGHLIGHTS = [
  { title: "أفضل صفحة", label: "الصفحة الرئيسية", detail: "18,200 زيارة" },
  { title: "أفضل كلمة بحث", label: "عقد إيجار إلكتروني", badge: "1", detail: "14,200 بحث/شهر · 27,600ريال" },
  { title: "أفضل حملة", label: "بحث قوقل – كلمات النية العالية", badge: "قوقل", detail: "ROAS x3.36 · 214 طلب" },
  { title: "أفضل مصدر للعملاء", label: "قوقل", badge: "قوقل", detail: "323 عميل · 93,100ريال إيراد" },
];

export const PERIOD_COMPARISON = {
  title: "مقارنة الفترات – الحالية مقابل السابقة (31 يومًا)",
  items: [
    { value: "512", label: "الطلبات", change: "1119%" },
    { value: "57,371ريال", label: "الصرف الإعلاني", change: "389%" },
    { value: "146,711ريال", label: "الإيراد المُسند", change: "1147%" },
  ],
};

export const REPORT_STATS = [
  { value: "x3.59", label: "إيراد لكل ريال تسويق" },
  { value: "249,650ريال", label: "إجمالي الإيراد" },
  { value: "69,500ريال", label: "تكلفة التسويق" },
  { value: "203", label: "عملاء عائدون", trend: { direction: "up", value: "19%" } },
  { value: "612", label: "عملاء جدد", trend: { direction: "up", value: "12%" } },
];

export const REPORT_PERIODS = [
  { id: "all", label: "الكل" },
  { id: "90d", label: "90 يوم" },
  { id: "month", label: "شهر" },
  { id: "week", label: "أسبوع" },
  { id: "day", label: "اليوم" },
];

export const REPORT_CHANNEL_TABLE = {
  rangeLabel: "تقرير القنوات: 24-06-2026 ← 24-07-2026 · 5 صفوف",
  rows: [
    { source: "قوقل", spend: 24500, revenue: 84500, roas: "x3.45", leads: 800, conversions: 292, cac: 84, profit: "60,000+ريال" },
    { source: "ميتا", spend: 12800, revenue: 27900, roas: "x2.18", leads: 360, conversions: 96, cac: 133, profit: "15,100+ريال" },
    { source: "تيك توك", spend: 9300, revenue: 19100, roas: "x2.05", leads: 410, conversions: 66, cac: 141, profit: "9,800+ريال" },
    { source: "سناب", spend: 9100, revenue: 13800, roas: "x1.52", leads: 300, conversions: 52, cac: 175, profit: "4,700+ريال" },
    { source: "إكس", spend: 1671, revenue: 1411, roas: "x0.84", leads: 28, conversions: 6, cac: 279, profit: "260-ريال" },
  ],
  total: { spend: 57371, revenue: 146711, roas: "x2.56", leads: 1898, conversions: 512, cac: 812, profit: "89,340+ريال" },
};

/* ---------------- Linking & pixels ---------------- */

export const PIXELS_STATS = [
  { value: "5/4", label: "حسابات إعلانية" },
  { value: "5", label: "تتبع تحويلات" },
  { value: "96,770", label: "أحداث متتبعة" },
  { value: "8/7", label: "مصادر مربوطة" },
];

export const AD_PIXELS = [
  {
    name: "إكس بكسل (تويتر)",
    connected: false,
    id: null,
    events: [],
    lastEvent: "غير مربوط",
  },
  {
    name: "سناب بكسل",
    connected: true,
    id: "a1b2c3d4-***",
    events: ["PURCHASE", "SIGN_UP", "PAGE_VIEW"],
    lastEvent: "6,120 حدث · آخر حدث قبل 22 دقيقة",
  },
  {
    name: "ميتا بكسل (فيسبوك/إنستغرام)",
    connected: true,
    id: "318742***",
    badge: "+ Conversions API (خادمي)",
    events: ["Purchase", "Lead", "PageView"],
    lastEvent: "20,310 حدث · آخر حدث قبل 6 دقائق",
  },
  {
    name: "تيك توك بكسل",
    connected: true,
    id: "C8QF3ARC77U***",
    badge: "+ Conversions API (خادمي)",
    events: ["CompletePayment", "Lead", "ViewContent", "PageView"],
    lastEvent: "12,840 حدث · آخر حدث قبل 3 دقائق",
  },
];

export const ANALYTICS_SOURCES = [
  {
    name: "Google Search Console",
    connected: true,
    id: "aqdi.sa",
    note: "مصدر بيانات SEO (النقرات والترتيب)",
    lastEvent: "9,300 حدث · آخر حدث قبل 5 دقائق",
  },
  {
    name: "Google Tag Manager",
    connected: true,
    id: "GTM-P4X***",
    note: "حاوية الوسوم – تدير كل البكسلات من مكان واحد",
    lastEvent: "48,200 حدث · آخر حدث قبل دقيقة",
  },
  {
    name: "Google Ads – تتبع التحويل",
    connected: true,
    id: "AW-1129***",
    events: ["purchase", "conversion"],
    lastEvent: "9,300 حدث · آخر حدث قبل 5 دقائق",
  },
  {
    name: "Google Analytics 4",
    connected: false,
    id: "G-7QX***",
    events: ["purchase", "generate_lead", "page_view"],
    lastEvent: "مصدر بيانات نشط",
  },
];

export const TRACKED_EVENTS = [
  { event: "PageView", meaning: "زيارة صفحة", value: "–", platforms: "كل المنصات" },
  { event: "ViewContent", meaning: "عرض باقة/محتوى", value: "–", platforms: "تيك توك، ميتا" },
  { event: "Lead", meaning: "عميل محتمل (بدأ طلبًا)", value: "–", platforms: "قوقل، تيك توك، ميتا" },
  { event: "InitiateCheckout", meaning: "بدء الدفع", value: "–", platforms: "ميتا، تيك توك" },
  { event: "Purchase", meaning: "دفع/توثيق عقد", value: "قيمة العقد (الرسوم)", platforms: "كل المنصات", highlight: true },
];

export const UTM_DEFAULTS = {
  url: "https://aqdi.sa",
  source: "google",
  medium: "cpc",
  campaign: "summer_launch",
  content: "ad_a",
  term: "توثيق_عقد",
};
