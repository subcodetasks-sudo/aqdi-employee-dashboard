"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Calendar, Trash2, Eye, User, Edit, FilePenLine, Plus, Wallet, Clock, Ban } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import AddNoteDialog from "./add-note-dialog";
import AddSalaryDialog from "./add-salary-dialog";
import AddNewEmployeeDialog from "./add-employee-dialog";
import BlockEmployeeDialog from "./block-employee-dialog";
import DeleteEmployeeDialog from "./delete-employee-dialog";
import SendOrderSmsButton from "@/components/Orders/shared/send-order-sms-button";

export default function EmployeeDetailsCard({ employee, readOnly = false }) {
  const formatDate = (dateString) => {
    if (!dateString) return "---";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div dir="rtl" className="text-right">
      <h2 className="text-lg font-bold">بيــانــات الموظـف :</h2>
      <div dir="rtl" className="grid grid-cols-3 gap-4  mt-4">
        {/* Right Profile Card */}
        <div className="bg-gray-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center">

          <div className="relative size-28 rounded-full overflow-hidden border border-gray-200">
            <Image
              src={employee?.profile_image || "/images/defaultUser.jpg"}
              width={112}
              height={112}
              alt={employee?.name || "avatar"}
              className="size-full rounded-full object-cover"
            />
          </div>

          <h3 className="mt-3 font-bold text-lg">{employee?.name || "---"}</h3>
          <p className="text-sm text-muted-foreground">
            {employee?.role || "موظف"}
          </p>

          {employee?.phone && (
            <a
              href={`https://wa.me/${employee.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 bg-green-600 hover:bg-green-700 text-white rounded-full p-2.5 flex items-center justify-center transition-all"
            >
              <FaWhatsapp size={18} />
            </a>
          )}

          <div className="mt-3">
            <SendOrderSmsButton
              employee={employee}
              employeeId={employee?.id}
              label="إرسال رسالة"
            />
          </div>
        </div>
        {/* Left Section */}
        <div dir='rtl' className="col-span-2 bg-gray-100 rounded-2xl p-4 flex flex-col justify-between">

          {/* Top Actions */}
          {!readOnly && (
            <div className="flex justify-end items-center gap-3">
              <AddNewEmployeeDialog isEdit={true} employee={employee} />
              <AddNoteDialog employee={employee} />
              <AddSalaryDialog employee={employee} />
            </div>
          )}

          {/* Middle Info */}
          <div className="flex items-center gap-8 mt-6">
            {/* Email */}
            <div className="flex items-center gap-3">
              <div className="bg-brand-hover text-white p-4 rounded-full">
                <Mail size={20} />
              </div>
              <div className="text-right">
                <p className="font-medium">{employee?.email || "---"}</p>
                <p className="text-sm text-muted-foreground">
                  البريد الإلكتروني
                </p>
              </div>
            </div>
            {/* salary */}
            <div className="flex items-center gap-3">
              <div className="bg-brand-hover text-white p-4 rounded-full">
                <Wallet size={20} />
              </div>
              <div className="text-right">
                <p className="font-medium">
                  {employee?.base_salary ? parseFloat(employee.base_salary).toLocaleString('ar-EG') : "---"}
                </p>
                <p className="text-sm text-muted-foreground">
                  الراتب الأساسي
                </p>
              </div>
            </div>
          </div>
          {/* Middle Info */}
          <div className="flex items-center gap-8 mt-10">
            {/* create date */}
            <div className="flex items-center gap-3">
              <div className="bg-black text-white p-4 rounded-full">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-sm font-medium">{formatDate(employee?.created_at)}</p>
                <p className="text-muted-foreground text-xs">تاريخ الإنشاء</p>
              </div>
            </div>
            {/* update date */}
            <div className="flex items-center gap-3">
              <div className="bg-black text-white p-4 rounded-full">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-sm font-medium">{formatDate(employee?.updated_at)}</p>
                <p className="text-muted-foreground text-xs">تاريخ التحديث</p>
              </div>
            </div>

          </div>


          {!readOnly && (
            <div className="flex gap-3 mt-4 justify-end ">
              <BlockEmployeeDialog employee={employee} />
              <DeleteEmployeeDialog isSingle={true} employee={employee} />
            </div>
          )}
        </div>


      </div>
    </div>
  );
}