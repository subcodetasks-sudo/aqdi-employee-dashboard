export const PRIMARY_TABS = [
  { id: "general", label: "الإعدادات العامة" },
  { id: "contracts", label: "إعدادات العقود" },
];

export const CONTRACT_SUB_TABS = [
  { id: "guidance", label: "محتوى إرشادي للعقود" },
  { id: "instrument-types", label: "أنواع الصكوك" },
  { id: "sms", label: "إعدادات رسائل SMS" },
  { id: "meter-fees", label: "رسوم العدادات" },
  { id: "payment-messages", label: "إعدادات رسائل الدفع" },
];

export const SYSTEM_CATEGORIES = [
  { id: "unit-types", label: "أنواع الوحدات", subtitle: "قائمة بـ 10 عناصر", href: "/home/settings/unit-types" },
  { id: "unit-usage", label: "استخدام الوحدة", subtitle: "قائمة بـ 5 عناصر", href: "/home/settings/unit-usage" },
  { id: "regions", label: "المناطق", subtitle: "قائمة بـ 8 عناصر", href: "/home/settings/regions" },
  { id: "cities", label: "المدن", subtitle: "قائمة بـ 10 عناصر", href: "/home/settings/cities" },
  { id: "property-types", label: "أنواع العقار", subtitle: "قائمة بـ 10 عناصر", href: "/home/settings/property-types" },
  { id: "property-usage", label: "استخدام العقار", subtitle: "قائمة بـ 5 عناصر", href: "/home/settings/property-usage" },
  { id: "order-duration", label: "مدة الطلب", subtitle: "سجلات 4 عناصر", href: "/home/settings/order-duration" },
  { id: "message-sections", label: "أقسام الرسائل", subtitle: "سجلات 5 عناصر", href: "/home/settings/message-sections" },
  { id: "message-section-items", label: "بنود أقسام الرسائل", subtitle: "قائمة بـ 3 عناصر", href: "/home/settings/message-section-items" },
  { id: "customer-app-messages", label: "الرسائل التطبيقية للعميل", subtitle: "رسائل موجهة 2 عنصر", href: "/home/settings/customer-app-messages" },
  { id: "message-for-employee", label: "رسائل توضيحية للموظفين", subtitle: "رسائل موجهة 1 عنصر", href: "/home/settings/message-for-employee" },
  { id: "message-for-property", label: "رسائل توضيحية للعقار", subtitle: "رسائل موجهة 1 عنصر", href: "/home/settings/message-for-property" },
  { id: "coupons", label: "الخصومات (الكوبونات)", subtitle: "كوبونات 5 عناصر", href: "/home/settings/coupons" },
  { id: "blogs", label: "المدونة", subtitle: "رابط", href: "/home/settings/blogs" },
  { id: "faqs", label: "الأسئلة الشائعة", subtitle: "أسئلة وأجوبة 2 عنصر", href: "/home/settings/faqs" },
  { id: "instructions", label: "التعليمات (صور إرشادية)", subtitle: "سجلات 9 عناصر", href: "/home/settings/instructions" },
  { id: "terms", label: "الشروط والأحكام", subtitle: "محتوى نصي", href: "/home/settings/terms" },
  { id: "privacy", label: "سياسة الخصوصية", subtitle: "محتوى نصي", href: "/home/settings/privacy" },
  { id: "notifications", label: "الإشعارات", subtitle: "نموذج إرسال", href: "/home/settings/notifications" },
  { id: "payments", label: "المدفوعات", subtitle: "سجل العمليات", href: "/home/settings/payments" },
  { id: "payment-types", label: "طرق الدفع", subtitle: "سجلات 5 عناصر", href: "/home/settings/payment-types" },
  { id: "tenant-roles", label: "صلاحيات المستأجر", subtitle: "سجلات 3 عناصر", href: "/home/settings/tenant-roles" },
  { id: "paperworks", label: "أوراق العمل", subtitle: "سجلات 4 عناصر", href: "/home/settings/paperworks" },
];

export const DOCUMENT_TYPES = [
  "ورقة مبايعة",
  "صك ملكية ورقي",
  "صك ملكية إلكتروني من وزارة العدل",
  "صك ملكية إلكتروني من وزارة العدل والسجل العيني",
  "صك ملكية إلكتروني من السجل العقاري",
  "صك ملكية والمالك متوفى",
  "حجة استحكام",
  "عقد إيجار من الباطن",
  "تجديد عقد إيجار",
];

export const MOCK_GUIDANCE_ROWS = [
  {
    id: 1,
    documentType: "ورقة مبايعة",
    contractPopup: true,
    propertyPopup: false,
    content: "محتوى إرشادي لورقة المبايعة",
    buttonText: "واتساب",
    buttonLink: "",
  },
  {
    id: 2,
    documentType: "صك ملكية ورقي",
    contractPopup: true,
    propertyPopup: true,
    content: "يحتاج الصك الورقي معالجة إضافية قبل الإدخال",
    buttonText: "start",
    buttonLink: "https://aqdi.sa/start",
  },
  {
    id: 3,
    documentType: "صك ملكية إلكتروني من وزارة العدل",
    contractPopup: true,
    propertyPopup: false,
    content:
      "عميلنا العزيز، نود تنبيهك بأن الصك الإلكتروني يُستخرج مباشرة من وزارة العدل، ويُفضّل التأكد من صحة البيانات قبل المتابعة.",
    buttonText: "واتساب",
    buttonLink: "https://aqdi.sa/wa",
  },
];

export const MOCK_INSTRUMENT_TYPES = [
  { id: 1, name: "صك ملكية إلكتروني من وزارة العدل", label: "صك إلكتروني", showInProperty: true, showInContract: true },
  { id: 2, name: "صك ملكية ورقي", label: "صك ورقي", showInProperty: true, showInContract: true },
  { id: 3, name: "ورقة مبايعة", label: "ورقة مبايعة", showInProperty: false, showInContract: true },
  { id: 4, name: "حجة استحكام", label: "حجة استحكام", showInProperty: true, showInContract: false },
  { id: 5, name: "عقد إيجار من الباطن", label: "إيجار من الباطن", showInProperty: false, showInContract: true },
  { id: 6, name: "تجديد عقد إيجار", label: "تجديد إيجار", showInProperty: false, showInContract: true },
];

export const MOCK_SMS_SETTINGS = {
  sms_user: "مرحباً، تم استلام طلبك بنجاح وسيتم التواصل معك قريباً.",
  sms_owner: "تم تسجيل طلب جديد على عقارك. يمكنك متابعة الحالة من لوحة المالك.",
  sms_employee: "تم إسناد طلب جديد إليك. يرجى مراجعته واستكمال الإجراءات.",
};

export const SMS_FIELDS = [
  { key: "sms_user", label: "رسالة للمستخدم", description: "رسالة SMS عامة للمستخدم على مستوى المشروع" },
  { key: "sms_owner", label: "رسالة للمالك", description: "رسالة SMS عامة للمالك على مستوى المشروع" },
  { key: "sms_employee", label: "رسالة للموظف", description: "رسالة SMS عامة للموظف على مستوى المشروع" },
];

export const MOCK_METER_FEES = {
  electricity_meter_fee_commercial_tenant: "150",
  electricity_meter_fee_housing_tenant: "80",
  water_meter_fee_commercial_tenant: "90",
  water_meter_fee_housing_tenant: "45",
};

export const METER_FEE_FIELDS = [
  { key: "electricity_meter_fee_commercial_tenant", label: "رسوم العداد الكهربائي تجاري للمستأجر" },
  { key: "electricity_meter_fee_housing_tenant", label: "رسوم العداد الكهربائي منزلي للمستأجر" },
  { key: "water_meter_fee_commercial_tenant", label: "رسوم عداد المياه تجاري للمستأجر" },
  { key: "water_meter_fee_housing_tenant", label: "رسوم عداد المياه منزلي للمستأجر" },
];

export const MOCK_PAYMENT_MESSAGES = [
  {
    type: "success",
    label: "رسالة نجاح الدفع",
    description: "تظهر للعميل بعد إتمام عملية الدفع بنجاح",
    message: "تم الدفع بنجاح. شكراً لثقتك في عقدي.",
    buttonText: "عرض العقد",
    buttonLink: "https://aqdi.sa/contract",
    buttonText2: "الرئيسية",
    buttonLink2: "https://aqdi.sa",
  },
  {
    type: "failed",
    label: "رسالة فشل الدفع",
    description: "تظهر للعميل عند فشل عملية الدفع",
    message: "تعذر إتمام عملية الدفع. يرجى المحاولة مرة أخرى أو اختيار وسيلة دفع أخرى.",
    buttonText: "إعادة المحاولة",
    buttonLink: "https://aqdi.sa/pay",
    buttonText2: "الدعم",
    buttonLink2: "https://aqdi.sa/support",
  },
];
