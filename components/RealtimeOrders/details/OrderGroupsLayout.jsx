"use client";

import {
  Building2,
  Check,
  Download,
  Eye,
  FileText,
  Home,
  MapPin,
  Pencil,
  UserRound,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import greenRial from "@/public/images/greenRial.svg";
import { cn } from "@/lib/utils";
import { RT } from "../theme";

function GroupTitle({ children, end }) {
  return (
    <div className="flex items-center justify-between gap-2 mb-3 px-0.5">
      <h3 className="text-[13px] font-black text-[#0B5345] dark:text-[#6EE7B7] truncate">
        {children}
      </h3>
      {end}
    </div>
  );
}

function EditBtn({ className, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "size-8 rounded-full border border-[#E6EBE9] dark:border-white/10 bg-white dark:bg-white/[0.04]",
        "text-[#9CA3AF] hover:text-[#0B5345] hover:border-[#0B5345]/30 flex items-center justify-center transition-colors",
        className
      )}
      aria-label="تعديل"
    >
      <Pencil className="size-3.5" />
    </button>
  );
}

/** Card with colored top accent bar — matches Figma groups. */
function AccentCard({
  accent = RT.brand,
  icon: Icon,
  title,
  badge,
  badgeClassName,
  missingCount,
  onEdit,
  children,
  className,
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-[#E6EBE9] dark:border-white/10 bg-white dark:bg-[#0F1C16]",
        "overflow-hidden shadow-[0_1px_2px_rgba(11,83,69,0.04)]",
        className
      )}
    >
      <div className="h-[4px] w-full" style={{ backgroundColor: accent }} />

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon ? (
              <span
                className="size-8 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: `${accent}18`,
                  color: accent,
                }}
              >
                <Icon className="size-4" />
              </span>
            ) : null}
            <div className="min-w-0">
              <h4 className="text-[14px] font-black text-[#0B5345] dark:text-white">
                {title}
              </h4>
              {badge ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold",
                    badgeClassName || "bg-[#DBEAFE] text-[#1D4ED8]"
                  )}
                >
                  {badge}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {missingCount > 0 ? (
              <span className="h-6 px-2 rounded-full bg-[#FEE2E2] text-[#DC2626] text-[10.5px] font-black">
                {missingCount} ناقص
              </span>
            ) : null}
            {onEdit ? <EditBtn onClick={onEdit} /> : null}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}

function Field({ label, value, empty }) {
  const isEmpty = empty || value === "" || value == null;
  return (
    <div className="flex items-center justify-between gap-3 text-[12px]">
      <span className="text-[#9CA3AF] font-medium shrink-0">{label}</span>
      <span
        className={cn(
          "font-bold text-left truncate min-w-0",
          isEmpty
            ? "text-[#D1D5DB] dark:text-white/25"
            : "text-[#111827] dark:text-white/90"
        )}
      >
        {isEmpty ? "—" : value}
      </span>
    </div>
  );
}

function GridField({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[10.5px] text-[#9CA3AF] font-medium mb-0.5">{label}</p>
      <p className="text-[12px] font-bold text-[#111827] dark:text-white/90 truncate">
        {value || "—"}
      </p>
    </div>
  );
}

function Money({ value, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-black text-[#15803D]",
        className
      )}
    >
      {Number(value ?? 0).toLocaleString("en-US")}
      <Image src={greenRial} alt="" width={12} height={12} />
    </span>
  );
}

export default function OrderGroupsLayout({ order, onEdit }) {
  const unitCount = order.units_count ?? order.units?.length ?? 0;
  const financial = order.financial ?? {};

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4" dir="rtl">
      {/* Group 1 — Deed & address */}
      <section className="rounded-2xl border border-dashed border-[#D7E3DE] dark:border-white/10 bg-[#F7FAF8] dark:bg-white/[0.02] p-3 sm:p-3.5 space-y-3">
        <GroupTitle>المجموعة 1 - الملاك - الصك - العنوان الوطني</GroupTitle>

        <AccentCard
          accent={RT.brand}
          icon={FileText}
          title="الصك والملاك"
          onEdit={() => onEdit?.("deed")}
        >
          <div className="rounded-xl bg-[#F0F7F4] dark:bg-white/[0.03] px-3 py-2 flex items-center gap-2">
            <FileText className="size-3.5 text-[#0B5345] dark:text-[#6EE7B7] shrink-0" />
            <span className="text-[11.5px] font-bold text-[#0B5345] dark:text-[#6EE7B7]">
              {order.deed?.type_label}
            </span>
          </div>

          <div className="space-y-2">
            <Field label="اسم المالك" value={order.deed?.owner_name} />
            <Field label="رقم الصك" value={order.deed?.number} />
            <Field label="هوية المالك" value={order.deed?.owner_id} />
            <Field label="جوال المالك" value={order.deed?.owner_phone} />
          </div>

          <div className="rounded-xl bg-[#F3F4F6] dark:bg-white/[0.04] px-3 py-2.5 flex items-center justify-between gap-2">
            <span className="text-[12px] font-bold text-[#4B5563] dark:text-white/70 truncate">
              {order.deed?.file_name || "لا يوجد مرفق"}
            </span>
            {order.deed?.file_url ? (
              <div className="flex items-center gap-3 shrink-0">
                <a
                  href={order.deed.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[12px] font-bold text-[#0B5345] dark:text-[#6EE7B7] hover:underline inline-flex items-center gap-1"
                >
                  <Eye className="size-3.5" />
                  عرض
                </a>
                <a
                  href={order.deed.file_url}
                  download
                  className="text-[12px] font-bold text-[#6B7280] dark:text-white/55 hover:underline inline-flex items-center gap-1"
                >
                  <Download className="size-3.5" />
                  تحميل
                </a>
              </div>
            ) : null}
          </div>
        </AccentCard>

        <AccentCard
          accent="#3B82F6"
          icon={MapPin}
          title="العنوان الوطني"
          onEdit={() => onEdit?.("address")}
          badge={
            <>
              <MapPin className="size-3" />
              {order.national_address?.source}
            </>
          }
        >
          <div className="space-y-2">
            <Field label="المدينة" value={order.national_address?.city} />
            <Field label="الحي" value={order.national_address?.district} />
            <Field label="رقم المبنى" value={order.national_address?.building} />
          </div>
        </AccentCard>
      </section>

      {/* Group 2 — Tenant & financial */}
      <section className="rounded-2xl border border-dashed border-[#D7E3DE] dark:border-white/10 bg-[#F7FAF8] dark:bg-white/[0.02] p-3 sm:p-3.5 space-y-3">
        <GroupTitle>
          المجموعة 2 - المستأجر، المالية، الشروط
        </GroupTitle>

        <AccentCard
          accent={RT.brand}
          icon={UserRound}
          title="المستأجر"
          onEdit={() => onEdit?.("tenant")}
          badge={
            <>
              <UserRound className="size-3" />
              {order.tenant?.type_label}
            </>
          }
          badgeClassName="bg-[#DCFCE7] text-[#15803D]"
        >
          <Field label="جوال المستأجر" value={order.tenant?.phone} />
        </AccentCard>

        <AccentCard
          accent={financial.missing_count ? "#EF4444" : RT.brand}
          icon={Wallet}
          title="البيانات المالية"
          missingCount={financial.missing_count}
          onEdit={() => onEdit?.("financial")}
        >
          <div className="flex flex-wrap items-center gap-1.5">
            {financial.payment_method ? (
              <span className="px-2 py-0.5 rounded-full bg-[#F3F4F6] dark:bg-white/10 text-[10.5px] font-bold text-[#4B5563] dark:text-white/70">
                {financial.payment_method}
              </span>
            ) : null}
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold",
                financial.paid
                  ? "bg-[#DCFCE7] text-[#15803D]"
                  : "bg-[#FEE2E2] text-[#DC2626]"
              )}
            >
              {financial.paid ? (
                <Check className="size-3" strokeWidth={2.75} />
              ) : null}
              {financial.paid ? "مدفوع" : "غير مدفوع"}
            </span>
          </div>

          <div className="space-y-2">
            <Field
              label="بداية العقد"
              value={financial.start_date}
              empty={!financial.start_date}
            />
            <Field label="المدة" value={financial.duration} />
            <Field label="الدفعات" value={financial.frequency} />
            <div className="flex items-center justify-between gap-3 text-[12px]">
              <span className="text-[#9CA3AF] font-medium">إجمالي الإيجار</span>
              <Money value={financial.rent} className="text-[14px]" />
            </div>
          </div>

          <div className="pt-2 border-t border-[#EEF1F0] dark:border-white/10 flex items-center justify-between gap-2">
            <span className="text-[12px] text-[#6B7280] dark:text-white/50 font-medium">
              رسوم الإيجار
            </span>
            <span className="inline-flex items-center gap-1.5">
              {financial.fees_paid ? (
                <Check className="size-3.5 text-[#15803D]" strokeWidth={2.75} />
              ) : null}
              <Money value={financial.fees} />
            </span>
          </div>
        </AccentCard>
      </section>

      {/* Group 3 — Units */}
      <section className="rounded-2xl border border-dashed border-[#E8DFD0] dark:border-white/10 bg-[#FBF8F3] dark:bg-white/[0.02] p-3 sm:p-3.5 space-y-3">
        <GroupTitle
          end={
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#B45309] whitespace-nowrap">
              عدد الوحدات المضافة من العميل: {unitCount}
            </span>
          }
        >
          المجموعة 3 - الوحدات
        </GroupTitle>

        <AccentCard
          accent="#C4A574"
          icon={Building2}
          title="الوحدات"
          onEdit={() => onEdit?.("units")}
        >
          <div className="space-y-3">
            {(order.units ?? []).length === 0 ? (
              <p className="text-[12px] text-[#9CA3AF] font-medium py-4 text-center">
                لا توجد وحدات مرتبطة بهذا الطلب
              </p>
            ) : (
            order.units.map((unit) => (
              <div
                key={unit.id}
                className="relative rounded-xl border-2 p-3 bg-white dark:bg-[#0F1C16]"
                style={{ borderColor: RT.brand }}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Home className="size-4 text-[#0B5345] dark:text-[#6EE7B7] shrink-0" />
                    <h5 className="text-[13px] font-black text-[#0B5345] dark:text-white">
                      {unit.title}
                    </h5>
                    <span className="px-2 py-0.5 rounded-full bg-[#E0E7FF] text-[#3730A3] text-[10.5px] font-bold">
                      {unit.badge}
                    </span>
                  </div>
                  <EditBtn onClick={() => onEdit?.("units")} />
                </div>

                <div className="grid grid-cols-3 gap-x-3 gap-y-2.5">
                  <GridField label="رقم الوحدة" value={unit.number} />
                  <GridField label="النوع" value={unit.type} />
                  <GridField label="الاستخدام" value={unit.use} />
                  <GridField label="الدور" value={unit.floor} />
                  <GridField label="المساحة" value={unit.area} />
                  <GridField label="الغرف" value={unit.rooms} />
                  <GridField label="دورات المياه" value={unit.bathrooms} />
                  <GridField label="المطابخ" value={unit.kitchens} />
                  <GridField label="المكيفات" value={unit.ac} />
                  <GridField label="مؤثثة" value={unit.furnished} />
                </div>
              </div>
            ))
            )}
          </div>
        </AccentCard>
      </section>
    </div>
  );
}
