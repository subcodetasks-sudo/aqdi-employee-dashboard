"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  Eye,
  LayoutGrid,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getMockClientProperties } from "./mock-data";

function FieldCell({ label, value, className }) {
  return (
    <div className={cn("flex flex-col gap-1 min-w-0", className)}>
      <span className="text-[11px] font-medium text-[#9CA3AF] dark:text-white/45">
        {label}
      </span>
      <span
        className={cn(
          "rounded-lg border px-3 py-2 text-[13px] font-bold text-[#111827] dark:text-white tabular-nums break-words",
          "border-[#EEF1F0] bg-[#F8FAF9] dark:border-white/[0.08] dark:bg-white/[0.04]"
        )}
      >
        {value == null || value === "" ? "–" : value}
      </span>
    </div>
  );
}

function SectionBlock({ title, children }) {
  return (
    <div className="border-b border-[#EEF1F0] dark:border-white/[0.06] last:border-0 py-4 first:pt-1 last:pb-1">
      <h4 className="text-[13px] font-bold text-[#111827] dark:text-white mb-3">
        {title}
      </h4>
      {children}
    </div>
  );
}

function AccordionButton({ open, onClick, icon: Icon, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      className={cn(
        "w-full inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl text-[13px] font-bold transition-colors",
        "bg-[#E8F5F1] text-[#0B5345] hover:bg-[#D5EFE8]",
        "dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-emerald-500/25",
        open && "bg-[#D5EFE8] dark:bg-emerald-500/25"
      )}
    >
      <Icon className="size-4 shrink-0" />
      {children}
    </button>
  );
}

function UnitRow({ unit, onDelete }) {
  const [open, setOpen] = useState(false);
  const summary = `${unit.type} – رقم ${unit.number} – ${unit.area} م²`;

  return (
    <div className="border-b border-[#F3F4F6] dark:border-white/[0.05] last:border-0">
      <div className="flex items-center justify-between gap-3 px-1 py-3">
        <p className="text-[13px] font-bold text-[#111827] dark:text-white min-w-0">
          {summary}
        </p>
        <div className="inline-flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onDelete}
            className={cn(
              "inline-flex items-center justify-center size-8 rounded-lg transition-colors",
              "text-[#DC2626] hover:bg-red-50",
              "dark:text-rose-300 dark:hover:bg-rose-500/10"
            )}
            aria-label="حذف الوحدة"
          >
            <Trash2 className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[12px] font-bold transition-colors",
              "text-[#0B5345] hover:bg-[#E8F5F1]",
              "dark:text-emerald-300 dark:hover:bg-emerald-500/15"
            )}
          >
            <Eye className="size-3.5" />
            عرض
          </button>
        </div>
      </div>
      {open ? (
        <div className="pb-3 px-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            ["النوع", unit.type],
            ["الرقم", unit.number],
            ["المساحة", `${unit.area} م²`],
            ["الطابق", unit.floor],
            ["الغرف", unit.rooms],
            ["الاستخدام", unit.usage],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-lg border border-[#EEF1F0] bg-[#F8FAF9] dark:border-white/[0.08] dark:bg-white/[0.04] px-2.5 py-2"
            >
              <p className="text-[10px] font-medium text-[#9CA3AF] dark:text-white/40 mb-0.5">
                {label}
              </p>
              <p className="text-[12px] font-bold text-[#111827] dark:text-white tabular-nums">
                {value}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function PropertyCard({
  property,
  defaultPropertyOpen = false,
  defaultUnitsOpen = false,
}) {
  const [propertyOpen, setPropertyOpen] = useState(defaultPropertyOpen);
  const [unitsOpen, setUnitsOpen] = useState(defaultUnitsOpen);

  const meta = `شارع: ${property.street || "–"} · مبنى ${property.buildingNumber} · أضيف ${property.addedAt} · طلب #${property.orderId}`;

  return (
    <article
      className={cn(
        "rounded-2xl border bg-white overflow-hidden",
        "border-[#E8EEEC] shadow-[0_1px_3px_rgba(11,83,69,0.04)]",
        "dark:bg-[#0F1C16] dark:border-white/[0.08] dark:shadow-none"
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 px-5 pt-5 pb-4">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2">
            <span className="size-2 rounded-full bg-[#0B5345] dark:bg-emerald-400 shrink-0" />
            <h2 className="text-[15px] font-bold text-[#111827] dark:text-white leading-tight">
              {property.title}
            </h2>
          </div>
          <p className="mt-1.5 text-[12px] font-medium text-[#9CA3AF] dark:text-white/45 leading-relaxed">
            {meta}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 shrink-0 self-start">
          <button
            type="button"
            onClick={() =>
              toast.message("حذف العقار (واجهة تجريبية — غير مربوط بعد)")
            }
            className={cn(
              "inline-flex items-center justify-center size-9 rounded-xl transition-colors",
              "bg-[#FEE2E2] text-[#DC2626] hover:bg-[#FECACA]",
              "dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25"
            )}
            aria-label="حذف العقار"
          >
            <Trash2 className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() =>
              toast.message("عرض الصك (واجهة تجريبية — غير مربوط بعد)")
            }
            className={cn(
              "inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12px] font-bold transition-colors",
              "bg-[#E8F5F1] text-[#0B5345] hover:bg-[#D5EFE8]",
              "dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-emerald-500/25"
            )}
          >
            <Eye className="size-3.5" />
            عرض الصك
          </button>
        </div>
      </div>

      <div className="px-5 pb-5 flex flex-col gap-2.5">
        <AccordionButton
          open={propertyOpen}
          onClick={() => setPropertyOpen((v) => !v)}
          icon={Eye}
        >
          عرض العقار
        </AccordionButton>

        {propertyOpen ? (
          <div
            className={cn(
              "rounded-xl border px-4 py-2",
              "border-[#EEF1F0] bg-white dark:border-white/[0.08] dark:bg-[#0B1411]/40"
            )}
          >
            <SectionBlock title="اسم العقار">
              <FieldCell label="اسم العقار" value={property.propertyName} />
            </SectionBlock>

            <SectionBlock title="وثيقة الملكية">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FieldCell label="نوع المستند" value={property.documentType} />
                <FieldCell label="رقم الصك" value={property.deedNumber} />
              </div>
            </SectionBlock>

            <SectionBlock title="العنوان الوطني للعقار">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <FieldCell label="المنطقة" value={property.region} />
                <FieldCell label="المدينة" value={property.city} />
                <FieldCell label="الحي" value={property.district} />
                <FieldCell label="رقم المبنى" value={property.buildingNumber} />
              </div>
            </SectionBlock>

            <SectionBlock title="بيانات المالك">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FieldCell label="رقم الهوية" value={property.ownerId} />
                <FieldCell label="رقم الجوال" value={property.ownerMobile} />
              </div>
            </SectionBlock>
          </div>
        ) : null}

        <AccordionButton
          open={unitsOpen}
          onClick={() => setUnitsOpen((v) => !v)}
          icon={LayoutGrid}
        >
          عرض وحدات العقار ({property.units.length})
        </AccordionButton>

        {unitsOpen ? (
          <div
            className={cn(
              "rounded-xl border px-4",
              "border-[#EEF1F0] bg-white dark:border-white/[0.08] dark:bg-[#0B1411]/40"
            )}
          >
            {property.units.length === 0 ? (
              <p className="py-6 text-center text-[13px] text-[#9CA3AF] dark:text-white/40">
                لا توجد وحدات لهذا العقار
              </p>
            ) : (
              property.units.map((unit) => (
                <UnitRow
                  key={unit.id}
                  unit={unit}
                  onDelete={() =>
                    toast.message("حذف الوحدة (واجهة تجريبية — غير مربوط بعد)")
                  }
                />
              ))
            )}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default function ClientPropertiesWrapper() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const clientId = params?.userId;

  const fromParam = searchParams.get("from");
  const backUrl = useMemo(() => {
    if (fromParam?.startsWith("/")) return fromParam;
    return `/home/users/${clientId}?from=${encodeURIComponent("/home/clients")}`;
  }, [fromParam, clientId]);

  const data = useMemo(() => getMockClientProperties(clientId), [clientId]);

  if (!data) {
    return (
      <div className="flex flex-col gap-4 min-h-full" dir="rtl">
        <button
          type="button"
          onClick={() => router.push(backUrl)}
          className="inline-flex items-center gap-1.5 self-start text-[14px] font-medium text-[#6B7280] dark:text-white/50 hover:text-[#0B5345] dark:hover:text-emerald-300 transition-colors"
        >
          <ChevronLeft className="size-4 shrink-0" />
          رجوع لملف العميل
        </button>
        <div className="rounded-2xl border border-[#E8EEEC] bg-white dark:bg-[#0F1C16] dark:border-white/[0.08] p-10 text-center text-[#FA5252] text-[15px] font-medium">
          لم يتم العثور على عقارات هذا العميل
        </div>
      </div>
    );
  }

  const { client, properties, totals } = data;

  return (
    <div className="flex flex-col gap-5 min-h-full transition-colors" dir="rtl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2 min-w-0">
          <button
            type="button"
            onClick={() => router.push(backUrl)}
            className="inline-flex items-center gap-1.5 self-start text-[14px] font-medium text-[#6B7280] dark:text-white/50 hover:text-[#0B5345] dark:hover:text-emerald-300 transition-colors"
          >
            <ChevronLeft className="size-4 shrink-0" />
            رجوع لملف العميل
          </button>
          <div>
            <h1 className="text-[20px] sm:text-[22px] font-bold text-[#111827] dark:text-white leading-tight">
              عقارات العميل – {client.name}
            </h1>
            <p className="mt-1 text-[13px] text-[#9CA3AF] dark:text-white/45 font-medium">
              استعراض بنفس مدخلات الموقع – عرض فقط
            </p>
          </div>
        </div>

        <p className="text-[13px] font-bold text-[#6B7280] dark:text-white/55 tabular-nums shrink-0 sm:pt-8">
          {totals.properties} عقار · {totals.units} وحدة
        </p>
      </div>

      {properties.length === 0 ? (
        <div
          className={cn(
            "rounded-2xl border bg-white p-10 text-center text-[14px] text-[#9CA3AF]",
            "border-[#E8EEEC] dark:bg-[#0F1C16] dark:border-white/[0.08] dark:text-white/40"
          )}
        >
          لا توجد عقارات مسجّلة لهذا العميل
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {properties.map((property, index) => (
            <PropertyCard
              key={property.id}
              property={property}
              defaultPropertyOpen={index === 0}
              defaultUnitsOpen={index === 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
