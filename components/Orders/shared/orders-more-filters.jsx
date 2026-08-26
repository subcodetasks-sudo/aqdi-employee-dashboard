"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const fieldClass =
  "h-[46px] rounded-14 border-surface-border bg-surface-input text-sm";

export default function OrdersMoreFilters({
  filters,
  onChange,
  showStatusField = true,
}) {
  const update = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white rounded-20 border border-neutral-200 p-5 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[#616161]">رقم الطلب</label>
        <Input
          value={filters.uuid}
          onChange={(e) => update("uuid", e.target.value)}
          placeholder="ابحث برقم الطلب"
          className={fieldClass}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[#616161]">رقم الجوال</label>
        <Input
          value={filters.user_mobile}
          onChange={(e) => update("user_mobile", e.target.value)}
          placeholder="ابحث برقم الجوال"
          className={fieldClass}
          dir="ltr"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[#616161]">نوع العقد</label>
        <Input
          value={filters.contract_type}
          onChange={(e) => update("contract_type", e.target.value)}
          placeholder="سكني / تجاري"
          className={fieldClass}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[#616161]">نوع الوثيقة</label>
        <Input
          value={filters.instrument_type}
          onChange={(e) => update("instrument_type", e.target.value)}
          placeholder="صك إلكتروني..."
          className={fieldClass}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[#616161]">اسم المستلم</label>
        <Input
          value={filters.employee_name}
          onChange={(e) => update("employee_name", e.target.value)}
          placeholder="اسم الموظف"
          className={fieldClass}
        />
      </div>

      {showStatusField && (
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#616161]">حالة الطلب</label>
          <Input
            value={filters.status_name}
            onChange={(e) => update("status_name", e.target.value)}
            placeholder="قيد المعالجة..."
            className={fieldClass}
          />
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[#616161]">حالة الدفع</label>
        <Select
          value={filters.payment_status || "all"}
          onValueChange={(value) => update("payment_status", value === "all" ? "" : value)}
        >
          <SelectTrigger className={fieldClass}>
            <SelectValue placeholder="الكل" />
          </SelectTrigger>
          <SelectContent dir="rtl">
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="paid">مدفوع</SelectItem>
            <SelectItem value="unpaid">غير مدفوع</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[#616161]">المبلغ من</label>
        <Input
          type="number"
          value={filters.amount_min}
          onChange={(e) => update("amount_min", e.target.value)}
          placeholder="0"
          className={fieldClass}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[#616161]">المبلغ إلى</label>
        <Input
          type="number"
          value={filters.amount_max}
          onChange={(e) => update("amount_max", e.target.value)}
          placeholder="999"
          className={fieldClass}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[#616161]">من تاريخ</label>
        <Input
          type="date"
          value={filters.date_from}
          onChange={(e) => update("date_from", e.target.value)}
          className={fieldClass}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[#616161]">إلى تاريخ</label>
        <Input
          type="date"
          value={filters.date_to}
          onChange={(e) => update("date_to", e.target.value)}
          className={fieldClass}
        />
      </div>
    </div>
  );
}
