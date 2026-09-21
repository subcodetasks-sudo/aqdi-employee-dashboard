"use client";

import { useState } from "react";
import { Download, Eye, FileText, MapPin, UserRound } from "lucide-react";
import { toast } from "sonner";
import MediaPreviewDialog from "@/components/shared/media-preview-dialog";
import { downloadMedia, fileNameFromMediaUrl } from "@/src/lib/media-url";
import { RT } from "../../theme";
import { AccentCard, Field, GroupTitle } from "./primitives";
import NationalAddressContent from "./national-address-content";

function AttachmentRow({ label, fileName, fileUrl, onPreview }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!fileUrl || downloading) return;
    setDownloading(true);
    try {
      const ok = await downloadMedia(
        fileUrl,
        fileName || fileNameFromMediaUrl(fileUrl)
      );
      toast.success(ok ? "تم التحميل بنجاح" : "تم فتح الملف للتحميل");
    } catch {
      toast.error("تعذر تحميل الملف");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="rounded-xl bg-status-neutral-bg dark:bg-white/[0.04] px-3 py-2.5 space-y-1.5">
      {label ? (
        <p className="text-[10.5px] font-bold text-gray-400">{label}</p>
      ) : null}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-[#4B5563] dark:text-white/70 truncate">
          {fileName || "لا يوجد مرفق"}
        </span>
        {fileUrl ? (
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onPreview}
              className="text-xs font-bold text-brand-dark dark:text-[#6EE7B7] hover:underline inline-flex items-center gap-1"
            >
              <Eye className="size-3.5" />
              عرض
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="text-xs font-bold text-status-neutral dark:text-white/55 hover:underline inline-flex items-center gap-1 disabled:opacity-60"
            >
              <Download className="size-3.5" />
              {downloading ? "..." : "تحميل"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function DeedAddressGroup({ order, onEdit }) {
  const [preview, setPreview] = useState(null);
  const address = order.national_address;
  const attachments = order.deed?.attachments ?? [];
  const legalAgent = order.deed?.legal_agent;
  const endowmentNazir = order.deed?.endowment_nazir;

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
          <Field label="رقم الصك" value={order.deed?.number} />
          <Field label="هوية المالك" value={order.deed?.owner_id} />
          <Field label="جوال المالك" value={order.deed?.owner_phone} />
        </div>

        <div className="space-y-2">
          {order.deed?.file_url ? (
            <AttachmentRow
              label={order.deed?.file_label || "صورة الصك"}
              fileName={order.deed?.file_name}
              fileUrl={order.deed?.file_url}
              onPreview={() =>
                setPreview({
                  url: order.deed?.file_url,
                  title: "معاينة الصك",
                  subtitle: order.deed?.file_name,
                })
              }
            />
          ) : null}
          {attachments.map((attachment) => (
            <AttachmentRow
              key={attachment.label}
              label={attachment.label}
              fileName={attachment.file_name}
              fileUrl={attachment.file_url}
              onPreview={() =>
                setPreview({
                  url: attachment.file_url,
                  title: attachment.label,
                  subtitle: attachment.file_name,
                })
              }
            />
          ))}
        </div>
      </AccentCard>

      {legalAgent ? (
        <AccentCard
          accent="#7C3AED"
          icon={UserRound}
          title="الوكيل / المالك بوكالة"
          onEdit={() => onEdit?.("deed")}
        >
          <div className="space-y-2">
            <Field label="هوية الوكيل" value={legalAgent.id_num} />
            <Field label="جوال الوكيل" value={legalAgent.phone} />
            <Field label="تاريخ الميلاد" value={legalAgent.dob_display} />
            <Field label="رقم الوكالة" value={legalAgent.agency_number} />
            <Field label="تاريخ الوكالة" value={legalAgent.agency_date} />
            <Field label="المالك متوفى" value={legalAgent.owner_is_deceased} />
          </div>
        </AccentCard>
      ) : null}

      {endowmentNazir ? (
        <AccentCard
          accent="#0EA5E9"
          icon={UserRound}
          title="ناظر الوقف"
          onEdit={() => onEdit?.("deed")}
        >
          <div className="space-y-2">
            <Field label="هوية الناظر / الوكيل" value={endowmentNazir.id_num} />
            <Field label="جوال الناظر / الوكيل" value={endowmentNazir.phone} />
            <Field label="تاريخ الميلاد" value={endowmentNazir.dob_display} />
            <Field label="أكثر من صك نظارة" value={endowmentNazir.is_multiple} />
          </div>
        </AccentCard>
      ) : null}

      <MediaPreviewDialog
        open={Boolean(preview?.url)}
        onOpenChange={(open) => {
          if (!open) setPreview(null);
        }}
        url={preview?.url}
        downloadUrl={preview?.url}
        title={preview?.title || "معاينة المرفق"}
        subtitle={preview?.subtitle}
      />

      <AccentCard
        accent="#3B82F6"
        icon={MapPin}
        title="العنوان الوطني"
        onEdit={() => onEdit?.("address")}
      >
        <NationalAddressContent address={address} />
      </AccentCard>
    </section>
  );
}
