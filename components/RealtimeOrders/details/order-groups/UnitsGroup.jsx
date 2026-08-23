"use client";

import { Building2, Home } from "lucide-react";
import { RT } from "../../theme";
import { AccentCard, EditBtn, GridField, GroupTitle } from "./primitives";

const UNIT_FIELDS = [
  { key: "number", label: "رقم الوحدة" },
  { key: "type", label: "النوع" },
  { key: "use", label: "الاستخدام" },
  { key: "floor", label: "الدور" },
  { key: "area", label: "المساحة" },
  { key: "rooms", label: "الغرف" },
  { key: "bathrooms", label: "دورات المياه" },
  { key: "kitchens", label: "المطابخ" },
  { key: "ac", label: "المكيفات" },
  { key: "furnished", label: "مؤثثة" },
];

function UnitCard({ unit, onEdit }) {
  return (
    <div
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
        <EditBtn onClick={onEdit} />
      </div>

      <div className="grid grid-cols-3 gap-x-3 gap-y-2.5">
        {UNIT_FIELDS.map(({ key, label }) => (
          <GridField key={key} label={label} value={unit[key]} />
        ))}
      </div>
    </div>
  );
}

export default function UnitsGroup({ order, onEdit }) {
  const units = order.units ?? [];
  const unitCount = order.units_count ?? units.length;

  return (
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
          {units.length === 0 ? (
            <p className="text-[12px] text-[#9CA3AF] font-medium py-4 text-center">
              لا توجد وحدات مرتبطة بهذا الطلب
            </p>
          ) : (
            units.map((unit) => (
              <UnitCard key={unit.id} unit={unit} onEdit={() => onEdit?.("units")} />
            ))
          )}
        </div>
      </AccentCard>
    </section>
  );
}
