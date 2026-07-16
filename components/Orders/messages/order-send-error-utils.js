import {
  formatSectionDataBlock,
  getOrderId,
  getOrderPhoneForContext,
  getOrderSectionFields,
  getWhatsAppRecipientLabel,
  buildWhatsAppUrl,
  normalizeWhatsAppPhone,
} from "./order-section-message-utils";

export { getOrderPhoneForContext, getWhatsAppRecipientLabel, buildWhatsAppUrl, normalizeWhatsAppPhone };

/** قوالب ثابتة — غير مرتبطة برسائل الأقسام أو الـ API */
const SEND_ERROR_CONFIG = {
  owner: {
    title: "بيانات المالك غير صحيحة",
    intro: `عميلنا العزيز،
يوجد خطأ في إحدى بيانات المالك الموضحة أدناه:`,
    includeDataBlock: true,
    includeNotes: false,
    footer:
      "نرجو تزويدنا بالبيانات الصحيحة هنا في المحادثة ليتمكن فريقنا من استكمال الإجراء",
  },
  agent: {
    title: "بيانات الوكيل غير صحيحة",
    intro: `عميلنا العزيز،
يوجد خطأ في إحدى بيانات وكيل المالك الموضحة أدناه:`,
    includeDataBlock: true,
    footer:
      "نرجو تزويدنا بالبيانات الصحيحة هنا في المحادثة ليتمكن فريقنا من استكمال الإجراء",
  },
  propertyAddress: {
    title: "خطأ في العنوان الوطني",
    intro: `عميلنا العزيز،
يوجد خطأ في بيانات العنوان الوطني للعقار الموضحة أدناه:`,
    includeDataBlock: true,
    footer:
      "نرجو تزويدنا بالبيانات الصحيحة هنا في المحادثة ليتمكن فريقنا من استكمال الإجراء",
  },
  propertyDetails: {
    title: "خطأ في تفاصيل العقار",
    intro: `عميلنا العزيز،
يوجد خطأ في تفاصيل العقار الموضحة أدناه:`,
    includeDataBlock: true,
    footer:
      "نرجو تزويدنا بالبيانات الصحيحة هنا في المحادثة ليتمكن فريقنا من استكمال الإجراء",
  },
  unitDetails: {
    title: "خطأ في تفاصيل الوحدات",
    intro: `عميلنا العزيز،
يوجد خطأ في بيانات الوحدة الموضحة أدناه:`,
    includeDataBlock: true,
    footer:
      "نرجو تزويدنا بالبيانات الصحيحة هنا في المحادثة ليتمكن فريقنا من استكمال الإجراء",
  },
  contractTenant: {
    title: "خطأ في بيانات المستأجر",
    intro: `عميلنا العزيز،
يوجد خطأ في بيانات المستأجر الموضحة أدناه:`,
    includeDataBlock: true,
    footer:
      "نرجو تزويدنا بالبيانات الصحيحة هنا في المحادثة ليتمكن فريقنا من استكمال الإجراء",
  },
  financialTerms: {
    title: "خطأ في البيانات المالية والشروط",
    intro: `عميلنا العزيز،
يوجد خطأ في البيانات المالية أو شروط العقد الموضحة أدناه:`,
    includeDataBlock: true,
    footer:
      "نرجو تزويدنا بالبيانات الصحيحة هنا في المحادثة ليتمكن فريقنا من استكمال الإجراء",
  },
};

export function getSendErrorTitle(context) {
  return SEND_ERROR_CONFIG[context]?.title ?? "إرسال تنبيه للعميل";
}

export function composeSendErrorMessage(orderData, context) {
  const config = SEND_ERROR_CONFIG[context];
  const parts = [];

  if (config?.intro) parts.push(config.intro);

  if (config?.includeNotes) {
    const notes = orderData?.contract_summary?.notes_edits;
    if (notes != null && String(notes).trim()) {
      parts.push(String(notes).trim());
    }
  }

  if (config?.includeDataBlock && context) {
    const fields = getOrderSectionFields(orderData, context).filter(
      (f) => f.label !== "رقم الطلب"
    );
    const dataBlock = formatSectionDataBlock(fields);
    if (dataBlock) parts.push(dataBlock);
  }

  if (config?.footer) parts.push(config.footer);

  const orderId = getOrderId(orderData);
  if (orderId) parts.push(`رقم الطلب: ${orderId}`);

  return parts.join("\n\n");
}
