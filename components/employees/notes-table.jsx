import { Image } from 'lucide-react';
import React from 'react'
import ryal from '@/public/images/greenRial.svg';

export default function NotesTable({ notes }) {
  /*-------------------------------------------------------------------------------------*/
  // table headers
  const tableHeaders = [
    "تاريخ الإضافة",
    "الملاحظة",
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

  return (
    <div className='mt-4'>
      <h2 className="text-lg font-bold">ملاحظات :</h2>
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
            {notes && notes.length > 0 ? (
              notes.map((note) => (
                <tr key={note.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-all">
                  <td className="p-[15px_20px] whitespace-nowrap">
                    <span className='text-black text-sm'>{formatDate(note.addition_date)}</span>
                  </td>
                  <td className="p-[15px_20px]">
                    <span className='text-black text-xs'>{note.note}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={tableHeaders.length} className="text-center p-8 text-ink-placeholder text-sm">
                  لا يوجد ملاحظات للموظف حالياً.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div >
    </div >
  )
}
