"use client";

import { Copy } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import SendOrderSmsButton from "@/components/Orders/shared/send-order-sms-button";

export default function UserContractsTable({ contracts = [], userId = null }) {
  const tableHeaders = [
    "رقم الطلب",
    "نوع العقد",
    "المبلغ",
    "حالة الدفع",
    "تاريخ الإنشاء",
    "الحالة",
    "الاستلام",
    "الإجراءات",
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="mt-4">
      <h2 className="text-lg font-bold">طلبات المستخدم :</h2>
      <div className="w-full overflow-x-auto bg-white rounded-[24px] border border-[#E4E4E4] mt-4 shadow-sm">
        <table className="w-full border-collapse">
          <thead className="bg-[#FAFAFA]">
            <tr>
              {tableHeaders.map((header, index) => (
                <th
                  key={index}
                  className="text-right p-[15px_20px] text-[#A3A3A3] text-[13px] font-medium border-b border-[#E4E4E4] whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contracts.length > 0 ? (
              contracts.map((contract) => (
                <tr
                  key={contract.id}
                  className="border-b border-[#F5F5F5] last:border-0 hover:bg-[#fafafa] transition-all"
                >
                  <td className="p-[15px_20px]">
                    <div className="flex items-center gap-2">
                      <span className="text-black text-xs font-bold">{contract.uuid || "—"}</span>
                      {contract.uuid && (
                        <Copy
                          onClick={() => {
                            navigator.clipboard.writeText(String(contract.uuid));
                            toast.success("تم نسخ رقم الطلب");
                          }}
                          size={14}
                          className="text-[#A3A3A3] cursor-pointer hover:text-brand-main"
                        />
                      )}
                    </div>
                  </td>
                  <td className="p-[15px_20px] text-black text-[13px]">{contract.contract_type || "—"}</td>
                  <td className="p-[15px_20px] text-green-600 font-bold text-[13px]">
                    {parseFloat(contract.amount_payment || 0).toLocaleString("ar-EG")}
                  </td>
                  <td className="p-[15px_20px]">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        contract.is_paid ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {contract.payment_label_ar || "—"}
                    </span>
                  </td>
                  <td className="p-[15px_20px] text-[#616161] text-[12px] whitespace-nowrap">
                    {formatDate(contract.created_at)}
                  </td>
                  <td className="p-[15px_20px]">
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{
                        backgroundColor: `${contract.status?.color || "#eee"}33`,
                        color: contract.status?.color || "#616161",
                      }}
                    >
                      {contract.status?.name || "—"}
                    </span>
                  </td>
                  <td className="p-[15px_20px] text-[13px] text-[#616161]">
                    {contract.employee_name || "—"}
                  </td>
                  <td className="p-[15px_20px]">
                    <div className="flex items-center gap-2 justify-center">
                      <SendOrderSmsButton
                        userId={userId ?? contract.user_id}
                        order={contract}
                      />
                      <Link
                        href={`/home/orders/${contract.id}`}
                        aria-label="عرض الطلب"
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-[#F5F5F5] text-[#4D4D4D] hover:bg-brand-main hover:text-white transition-all"
                      >
                        <i className="fa-regular fa-eye text-[13px]" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={tableHeaders.length} className="text-center p-8 text-[#A3A3A3] text-sm">
                  لا يوجد طلبات مرتبطة بهذا المستخدم حالياً.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
