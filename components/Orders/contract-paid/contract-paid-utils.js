import { writeExcelFile } from "@/src/lib/xlsx-export";
import { normalizePaymentLinkPayload } from "@/components/Orders/shared/payment-gateway";

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
  const root = response?.data ?? response;
  const nested = root?.data && typeof root.data === "object" ? root.data : null;
  const normalized = normalizePaymentLinkPayload(root);

  return {
    paymentUrl: normalized.paymentUrl,
    alreadyPaid: normalized.alreadyPaid,
    message: normalized.message,
    cartAmount: normalized.cartAmount,
    record: nested?.record ?? nested ?? root?.record ?? root,
    contractUuid: normalized.contractUuid,
    payment: normalized.payment,
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

export async function exportContractPaidToExcel(rows, { filename = "contract-paid" } = {}) {
  const data = rows?.map(mapContractPaidToExportRow);
  return writeExcelFile(data, { filename, sheetName: "العقود المدفوعة" });
}
