"use client";

import { Check, Copy } from 'lucide-react';
import React from 'react'
import { toast } from 'sonner';

export default function ContractEmployeeTable({ receivedContracts = [], refundableContracts = [] }) {
  /*-------------------------------------------------------------------------------------*/
  // table headers
  const tableHeaders = [
    "رقم العقد",
    "رقــم جوال العميل",
    "نــوع العقــد",
    "الدفـــع / المبلغ",
    "مستلم منذ",
    "الحالة",
    "الاسـتلام"
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "---";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const allContracts = [
    ...(receivedContracts || []).map(c => ({ ...c, kind: 'received' })),
    ...(refundableContracts || []).map(c => ({ ...c, kind: 'refundable' }))
  ];

  return (
    <div className='mt-4'>

      <h2 className="text-lg font-bold">العقــود التي وثقــها الموظــف :</h2>
      < div className="w-full overflow-x-auto bg-white rounded-3xl border border-neutral-200 mt-4 shadow-sm" >
        <table className="w-full border-collapse">
          <thead className="bg-neutral-50">
            <tr>
              {tableHeaders.map((header, index) => (
                <th key={index} className="text-right p-[15px_20px] text-ink-placeholder text-13 font-medium border-b border-neutral-200 whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='max-h-[50vh]! overflow-y-auto no-scrollbar'>
            {allContracts.length > 0 ? (
              allContracts.map((item, index) => {
                const contractId = item.contract_id || item.id || "---";
                const phone = item.contract?.user?.phone || item.user?.phone || "---";
                const typeLabel = item.kind === 'refundable' ? 'استرجاع طلب' : 'توثيق عقد';
                const amount = item.refund_amount || item.contract?.amount || "---";
                const dateStr = formatDate(item.created_at);
                const statusLabel = item.admin_confirmed ? "تم التوكيد" : "قيد المعالجة";
                const receiverName = item.contract?.employee?.name || "---";

                return (
                  <tr key={index} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-all">
                    <td className="p-[15px_20px]">
                      <div className='flex items-center gap-2'>
                        <span className='text-black text-xs'>{contractId}</span>
                        {contractId !== "---" && (
                          <Copy onClick={() => {
                            navigator.clipboard.writeText(String(contractId))
                            toast.success("تم نسخ رقم العقد")
                          }} size={14} className='text-black cursor-pointer' />
                        )}
                      </div>
                    </td>
                    <td className='p-[15px_20px]'>
                      <div className='flex items-center gap-2'>
                        <span className='text-black text-xs'>{phone}</span>
                        {phone !== "---" && (
                          <Copy onClick={() => {
                            navigator.clipboard.writeText(phone)
                            toast.success("تم نسخ رقم الجوال")
                          }} size={14} className='text-black cursor-pointer' />
                        )}
                      </div>
                    </td>
                    <td className="p-[15px_20px]">
                      <div className="flex items-center gap-1.5 ">
                        <span className={`text-xs p-2 rounded ${item.kind === 'refundable' ? 'bg-amber-600/20 text-amber-700' : 'bg-blue-600/20 text-blue-600'}`}>
                          {typeLabel}
                        </span>
                      </div>
                    </td>
                    <td className="p-[15px_20px]">
                      <div className="flex items-center gap-1.5 text-green-600 font-bold text-13">
                        <span>{amount !== "---" ? parseFloat(amount).toLocaleString('ar-EG') : "---"}</span>
                        {item.admin_confirmed && <Check size={14} className='text-green-600' />}
                      </div>
                    </td>
                    <td className="p-[15px_20px]">
                      <div className="flex items-center gap-1.5 text-black font-bold text-13">
                        <span>{dateStr}</span>
                      </div>
                    </td>
                    <td className='p-[15px_20px]'>
                      <div className="flex items-center gap-1.5 ">
                        <span className={`text-xs rounded p-2 ${item.admin_confirmed ? 'bg-green-600/20 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {statusLabel}
                        </span>
                      </div>
                    </td>
                    <td className='p-[15px_20px]'>
                      <div className="flex items-center gap-1.5 ">
                        <span className=' text-sm p-2'>{receiverName}</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={tableHeaders.length} className="text-center p-8 text-ink-placeholder text-sm">
                  لا يوجد عقود مرتبطة بهذا الموظف حالياً.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div >
    </div >
  )
}
