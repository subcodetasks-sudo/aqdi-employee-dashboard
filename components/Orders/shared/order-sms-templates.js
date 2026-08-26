"use client";

/**
 * Order SMS / WhatsApp copy templates used in the order details actions menu
 * and the SMS compose dialog.
 */

export function buildOrderPaymentUrl(uuid) {
  const id = String(uuid ?? "").trim();
  if (!id) return "";
  return `https://aqdi.sa/pay/${id}`;
}

export function getOrderSmsTemplates(uuid) {
  const id = String(uuid ?? "").trim() || "—";
  const payUrl = buildOrderPaymentUrl(id);

  return [
    {
      id: "pay_reminder",
      label: "تذكير بسداد رسوم التوثيق",
      body: `مرحبًا، نذكركم بسداد رسوم توثيق العقد رقم ${id} لإتمام التوثيق في إيجار. رابط الدفع: ${payUrl}`,
    },
    {
      id: "missing_doc",
      label: "طلب إرفاق مستند ناقص",
      body: `مرحبًا، لإكمال طلبكم رقم ${id} نحتاج إرفاق المستند الناقص. يمكنكم الرفع من نفس رابط الطلب.`,
    },
    {
      id: "draft_ready",
      label: "مسودة العقد جاهزة للمراجعة",
      body: `مرحبًا، مسودة عقدكم رقم ${id} جاهزة للمراجعة. بعد موافقتكم يمكنكم إتمام الدفع مباشرة.`,
    },
  ];
}
