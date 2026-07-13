import * as XLSX from "xlsx";

export const CONTRACT_PAID_API = "/admin/contract-paid-by-employees";
export const CONTRACT_PAID_QUERY_KEY = "contractPaidByEmployees";

export function normalizeContractPaidList(response) {
  const payload = response?.data?.data ?? response?.data ?? response;

  if (Array.isArray(payload?.items)) {
    return { items: payload.items, pagination: payload.pagination ?? null };
  }

  if (Array.isArray(payload)) {
    return { items: payload, pagination: null };
  }

  return { items: [], pagination: null };
}

export function extractContractPaidRecord(response) {
  const payload = response?.data?.data ?? response?.data ?? response;
  return payload?.record ?? payload ?? null;
}

export function extractPaymentFromResponse(response) {
  const payload = response?.data?.data ?? response?.data ?? response;
  const paymentUrl = payload?.payment_url || payload?.Payment_url;

  return {
    paymentUrl,
    cartAmount: payload?.cart_amount ?? payload?.record?.amount,
    record: payload?.record ?? payload,
    contractUuid: payload?.contract_uuid ?? payload?.record?.contract_uuid,
  };
}

export function getContractPaidTypeLabel(row) {
  if (row?.contract_type_label) return row.contract_type_label;
  if (row?.contract_type === "commercial") return "تجاري";
  if (row?.contract_type === "housing") return "سكني";
  return "—";
}

export function getContractPaidPeriodLabel(row) {
  return (
    row?.contract_period?.period ||
    row?.contract_period?.note ||
    row?.contract_period_label ||
    "—"
  );
}

export function mapContractPaidToExportRow(row) {
  const isPaid = row?.is_paid === true || row?.is_paid === 1;

  return {
    "رقم العقد": row?.contract_uuid ?? "",
    "رقم جوال العميل": row?.customer_mobile ?? "",
    "نوع العقد": getContractPaidTypeLabel(row),
    "مدة العقد": getContractPaidPeriodLabel(row),
    "رقم مسودة العقد": row?.draft_contract_number ?? "",
    المبلغ: row?.amount ?? "",
    الموظف: row?.employee_name ?? "",
    "حالة الدفع": isPaid ? "تم الدفع" : "لم يتم الدفع",
    الملاحظات: row?.notes ?? "",
    "تاريخ الإنشاء": row?.created_at ?? "",
    "آخر تحديث": row?.updated_at ?? "",
  };
}

export function exportContractPaidToExcel(rows, { filename = "contract-paid" } = {}) {
  if (!rows?.length) {
    return false;
  }

  const data = rows.map(mapContractPaidToExportRow);
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "العقود المدفوعة");

  const dateStamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `${filename}-${dateStamp}.xlsx`);
  return true;
}
