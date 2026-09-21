import { printHtmlDocument } from "@/src/lib/print";
import {
  getOrderAddressStep,
  getOrderDeedStep,
  getOrderEndowmentNazir,
  getOrderFinancialStep,
  getOrderOwnerStep,
  getOrderTenantStep,
  getOrderUnits,
  getOrderUnitsStep,
  hasEndowmentNazir,
  hasLegalAgent,
  pickAgentRelatedField,
  resolveOrderContractTypeKey,
} from "@/src/lib/order-detail-steps";
import { getContractTypeLabel } from "@/src/lib/contract-period-utils";
import { absolutizeMediaUrl } from "@/src/lib/media-url";

const display = (value) => {
  if (value === null || value === undefined || value === "") return "---";
  if (Array.isArray(value)) return value.filter(Boolean).join("، ") || "---";
  if (typeof value === "boolean") return value ? "نعم" : "لا";
  return String(value);
};

const section = (title, rows) => {
  const items = rows
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(
      ([label, value]) => `
      <tr>
        <td class="label">${label}</td>
        <td class="value">${display(value)}</td>
      </tr>`
    )
    .join("");

  if (!items) return "";

  return `
    <section class="section">
      <h2>${title}</h2>
      <table>${items}</table>
    </section>
  `;
};

const CONTRACT_PRINT_STYLES = `
    /* margin:0 removes the browser-injected page URL/date footer & header */
    @page { margin: 0; }
    * { box-sizing: border-box; }
    body {
      font-family: Arial, Tahoma, sans-serif;
      margin: 24px;
      color: #111;
      line-height: 1.6;
    }
    .contract-doc + .contract-doc { padding-top: 8px; }
    .header {
      text-align: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #0c6055;
    }
    .header h1 { margin: 0 0 8px; font-size: 22px; color: #0c6055; }
    .header p { margin: 4px 0; font-size: 13px; color: #555; }
    .section { margin-bottom: 22px; page-break-inside: avoid; }
    .section h2 {
      font-size: 16px;
      margin: 0 0 10px;
      padding: 8px 12px;
      background: #f5f5f5;
      border-right: 4px solid #0c6055;
    }
    table { width: 100%; border-collapse: collapse; }
    td {
      border: 1px solid #e5e5e5;
      padding: 8px 10px;
      font-size: 13px;
      vertical-align: top;
    }
    td.label {
      width: 35%;
      background: #fafafa;
      font-weight: bold;
      color: #444;
    }
    .images {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 10px;
    }
    .images img {
      max-width: 220px;
      max-height: 180px;
      border: 1px solid #ddd;
      border-radius: 8px;
      object-fit: contain;
    }
    @media print {
      /* keep readable page padding now that @page margin is 0 */
      body { margin: 14mm 12mm; }
      .section { page-break-inside: avoid; }
    }
`;

/** Builds the inner markup for a single contract (no <html>/<head>/<body> wrapper). */
export function buildContractPrintSections(orderData) {
  if (!orderData) return "";

  const summary = orderData.contract_summary ?? {};
  const deed = getOrderDeedStep(orderData);
  const address = getOrderAddressStep(orderData);
  const owner = getOrderOwnerStep(orderData);
  const tenant = getOrderTenantStep(orderData);
  const unitsStep = getOrderUnitsStep(orderData);
  const unit = getOrderUnits(orderData)[0] ?? unitsStep.unit ?? {};
  const financial = getOrderFinancialStep(orderData);
  const user = orderData.user ?? {};
  const contractTypeKey = resolveOrderContractTypeKey(orderData);
  const contractTypeLabel =
    contractTypeKey === "housing" || contractTypeKey === "commercial"
      ? getContractTypeLabel(contractTypeKey)
      : summary.contract_type || orderData.contract_type_trans || orderData.contract_type;

  const resolveImageUrl = (value) => absolutizeMediaUrl(value);

  const images = [
    summary.image_instrument,
    deed.image_instrument,
    summary.image_instrument_from_the_front,
    deed.image_instrument_from_the_front,
    summary.image_instrument_from_the_back,
    deed.image_instrument_from_the_back,
    summary.copy_power_of_attorney_from_heirs_to_agent,
    deed.copy_power_of_attorney_from_heirs_to_agent,
    pickAgentRelatedField(orderData, "copy_power_of_attorney_from_heirs_to_agent"),
    pickAgentRelatedField(orderData, "copy_of_the_authorization_or_agency"),
    pickAgentRelatedField(orderData, "Image_inheritance_certificate"),
    pickAgentRelatedField(orderData, "copy_of_the_endowment_registration_certificate"),
    pickAgentRelatedField(orderData, "copy_of_the_trusteeship_deed"),
    pickAgentRelatedField(orderData, "copy_of_guardians_power_of_attorney_for_agent"),
  ]
    .map(resolveImageUrl)
    .filter(Boolean);

  const uniqueImages = [...new Set(images)];

  const imagesHtml = uniqueImages.length
    ? `<div class="images">${uniqueImages
        .map((src) => `<img src="${src}" alt="صورة الصك" />`)
        .join("")}</div>`
    : "";

  return `
  <div class="header">
    <h1>عقد إيجار - تفاصيل الطلب</h1>
    <p>رقم الطلب: ${display(orderData.uuid)}</p>
    <p>حالة الطلب: ${display(summary.contract_status_name || orderData.status_label)}</p>
    <p>رقم جوال العميل: ${display(user.mobile)}</p>
    <p>تاريخ الطباعة: ${new Date().toLocaleString("ar-SA")}</p>
  </div>

  ${section("الصك - الملاك", [
    ["رقم الهوية", owner.property_owner_id_num ?? summary.property_owner_id_num],
    ["تاريخ الميلاد", owner.property_owner_dob ?? summary.property_owner_dob],
    ["رقم الجوال", owner.property_owner_mobile ?? summary.property_owner_mobile],
    ["المنطقة", summary.relation_labels?.property_region || address.property_place_name],
    ["المدينة", summary.relation_labels?.property_city || address.city_name],
    ["الحي", address.neighborhood ?? summary.neighborhood],
    ["الشارع", address.street ?? summary.street],
  ])}

  ${hasLegalAgent(orderData)
    ? section("بيانات الوكيل", [
        ["اسم الوكيل", summary.name_of_property_owner_agent ?? summary.property_owner_agent_name],
        ["رقم الهوية", pickAgentRelatedField(orderData, "id_num_of_property_owner_agent")],
        ["تاريخ الميلاد", pickAgentRelatedField(orderData, "dob_of_property_owner_agent")],
        ["رقم الجوال", pickAgentRelatedField(orderData, "mobile_of_property_owner_agent")],
        [
          "رقم الوكالة",
          pickAgentRelatedField(orderData, "agency_number_in_instrument_of_property_owner"),
        ],
        [
          "تاريخ الوكالة",
          pickAgentRelatedField(orderData, "agency_instrument_date_of_property_owner"),
        ],
      ])
    : ""}

  ${hasEndowmentNazir(orderData)
    ? (() => {
        const nazir = getOrderEndowmentNazir(orderData);
        return section("ناظر الوقف", [
          ["رقم الهوية", nazir.id_num_of_property_owner_agent],
          ["رقم الجوال", nazir.mobile_of_property_owner_agent],
          ["أكثر من صك نظارة", nazir.is_multiple_trusteeship_deed_copy],
        ]);
      })()
    : ""}

  ${imagesHtml ? `<section class="section"><h2>صور الصك</h2>${imagesHtml}</section>` : ""}

  ${section("العنوان الوطني للعقار", [
    ["المدينة", address.city_name || address.property_city_id],
    ["المنطقة", address.property_place_name || address.property_place_id],
    ["الشارع", address.street],
    ["الحي", address.neighborhood],
    ["رقم الإضافي", address.extra_figure],
    ["رقم المبنى", address.building_number],
    ["الرمز البريدي", address.postal_code],
  ])}

  ${section("تفاصيل الوحدة", [
    ["رقم الوحدة", unit.unit_number || unitsStep.unit_number],
    ["نوع الوحدة", unit.unit_type_name || unitsStep.unit_type_name || unitsStep.unit_type?.name_ar],
    ["استخدام الوحدة", unit.unit_usage_name || unitsStep.unit_usage_name || unitsStep.unit_usage?.name_ar],
    ["رقم الطابق", unit.floor_number || unitsStep.floor_number],
    ["مساحة الوحدة", unit.unit_area || unitsStep.unit_area],
    ["عدد الغرف", unit.tootal_rooms || unitsStep.tootal_rooms],
    ["مؤثثة", unit.furnished ?? unitsStep.furnished],
    ["مطبخ راكب", unit.kitchen_tank ?? unitsStep.kitchen_tank],
    ["دورة مياه", unit.The_number_of_the_toilet || unit.The_number_of_toilets || unitsStep.The_number_of_the_toilet],
    ["الصالة", unit.The_number_of_halls || unitsStep.The_number_of_halls],
    ["مكيف سبليت", unit.split_ac || unitsStep.split_ac || "لا يوجد"],
    ["مكيف شباك", unit.window_ac || unitsStep.window_ac || "لا يوجد"],
    ["مطبخ", unit.The_number_of_kitchens || unitsStep.The_number_of_kitchens],
    ["عداد الكهرباء", unit.electricity_meter_number || unitsStep.electricity_meter_number],
    ["عداد المياه", unit.water_meter_number || unitsStep.water_meter_number],
  ])}

  ${section("العقد - المستأجر", [
    ["نوع العقد", contractTypeLabel],
    ["تاريخ بدء العقد", financial.contract_starting_date],
    ["مدة العقد", summary.contract_period || financial.contract_term_name],
    ["صلاحيات المستأجر", (() => {
      const details = orderData?.tenant_roles_details || financial.tenant_roles_details;
      if (Array.isArray(details) && details.length) {
        return details
          .map((item) => {
            const label = item?.text_of_reason || item?.name || "";
            const value = item?.value;
            return value != null && value !== ""
              ? `${label} (${value})`
              : label;
          })
          .filter(Boolean)
          .join("، ");
      }
      const names =
        orderData?.tenant_role_names ||
        financial.tenant_role_names ||
        tenant.tenant_role_names;
      return Array.isArray(names) ? names.join("، ") : names;
    })()],
    ["رقم هوية المستأجر", tenant.tenant_id_num],
    ["تاريخ ميلاد المستأجر", tenant.tenant_dob],
    ["رقم جوال المستأجر", tenant.tenant_mobile],
  ])}

  ${section("البيانات المالية", [
    ["مبلغ الإيجار السنوي للوحدة", financial.annual_rent_amount_for_the_unit],
    ["نوع الدفع", financial.payment_type_name],
    ["الغرامة اليومية", financial.daily_fine],
    ["إجمالي السعر", financial.contract_term_in_years?.price],
    ["مدة العقد", financial.contract_term_name],
    ["تاريخ بداية العقد", financial.contract_starting_date],
    ["نوع التاريخ", financial.type_contract_starting_date === "hijri" ? "هجري" : financial.type_contract_starting_date === "gregorian" ? "ميلادي" : financial.type_contract_starting_date],
    ["شروط أخرى", (() => {
      const list =
        orderData?.other_conditions_list || financial.other_conditions_list;
      if (Array.isArray(list) && list.length) {
        return list.filter(Boolean).join("، ");
      }
      return financial.other_conditions || orderData?.other_conditions || null;
    })()],
    ["نص الشروط الإضافية", financial.text_additional_terms],
  ])}`;
}

function wrapPrintDocument(title, innerHtml) {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <style>${CONTRACT_PRINT_STYLES}</style>
</head>
<body>
${innerHtml}
</body>
</html>`;
}

export function buildContractPrintHtml(orderData) {
  if (!orderData) return "";
  return wrapPrintDocument(
    `طباعة العقد - ${display(orderData.uuid)}`,
    buildContractPrintSections(orderData)
  );
}

/** Builds one print document containing every contract, one per page. */
export function buildBatchContractPrintHtml(ordersData = []) {
  const valid = (ordersData ?? []).filter(Boolean);
  if (!valid.length) return "";

  const articles = valid
    .map((orderData, index) => {
      const breakAfter =
        index < valid.length - 1 ? ' style="page-break-after: always;"' : "";
      return `<article class="contract-doc"${breakAfter}>${buildContractPrintSections(
        orderData
      )}</article>`;
    })
    .join("\n");

  return wrapPrintDocument(`طباعة العقود (${valid.length})`, articles);
}

export function printOrderContract(orderData) {
  return printHtmlDocument(buildContractPrintHtml(orderData));
}

export function printOrderContracts(ordersData) {
  return printHtmlDocument(buildBatchContractPrintHtml(ordersData));
}
