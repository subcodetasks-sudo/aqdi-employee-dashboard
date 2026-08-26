"use client";

import { Download, Eye, FileText, MapPin } from "lucide-react";
import { RT } from "../../theme";
import { AccentCard, Field, GroupTitle } from "./primitives";

export default function DeedAddressGroup({ order, onEdit }) {
  return (
    <section className="rounded-2xl border border-dashed border-[#D7E3DE] dark:border-white/10 bg-[#F7FAF8] dark:bg-white/[0.02] p-3 sm:p-3.5 space-y-3">
      <GroupTitle>المجموعة 1 - الملاك - الصك - العنوان الوطني</GroupTitle>

      <AccentCard
        accent={RT.brand}
        icon={FileText}
        title="الصك والملاك"
        onEdit={() => onEdit?.("deed")}
      >
        <div className="rounded-xl bg-[#F0F7F4] dark:bg-white/[0.03] px-3 py-2 flex items-center gap-2">
          <FileText className="size-3.5 text-brand-dark dark:text-[#6EE7B7] shrink-0" />
          <span className="text-[11.5px] font-bold text-brand-dark dark:text-[#6EE7B7]">
            {order.deed?.type_label}
          </span>
        </div>

        <div className="space-y-2">
          <Field label="اسم المالك" value={order.deed?.owner_name} />
          <Field label="رقم الصك" value={order.deed?.number} />
          <Field label="هوية المالك" value={order.deed?.owner_id} />
          <Field label="جوال المالك" value={order.deed?.owner_phone} />
        </div>

        <div className="rounded-xl bg-status-neutral-bg dark:bg-white/[0.04] px-3 py-2.5 flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-[#4B5563] dark:text-white/70 truncate">
            {order.deed?.file_name || "لا يوجد مرفق"}
          </span>
          {order.deed?.file_url ? (
            <div className="flex items-center gap-3 shrink-0">
              <a
                href={order.deed.file_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-brand-dark dark:text-[#6EE7B7] hover:underline inline-flex items-center gap-1"
              >
                <Eye className="size-3.5" />
                عرض
              </a>
              <a
                href={order.deed.file_url}
                download
                className="text-xs font-bold text-status-neutral dark:text-white/55 hover:underline inline-flex items-center gap-1"
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
  );
}
