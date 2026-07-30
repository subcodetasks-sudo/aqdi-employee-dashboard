"use client";

import { useMemo, useState } from "react";
import { Eye, ImageIcon, Inbox } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import DeedInstrumentViewerDialog, {
  DeedInstrumentViewer,
} from "./deed-instrument-viewer";
import { ContractStepEditor } from "./contract-edit/contract-step-editor";
import {
  SUMMARY_OWNER_FIELDS,
  SUMMARY_AGENT_FIELDS,
  SUMMARY_INSTRUMENT_IMAGE_FIELDS,
} from "./contract-edit/contract-field-schemas";
import {
  SECTION_ERROR_BUTTON_CLASS,
  SummaryFieldsLayout,
  SummaryInfoItem,
} from "./contract-summary-view";
import AgencyDocumentViewerDialog, {
  LegalAgentStatusBadge,
  resolveAgencyDocumentUrl,
} from "./agency-document-viewer-dialog";
import UserRelatedContracts from "./user-related-contracts";
import {
  INSTRUMENT_IMAGE_FIELDS,
  asYesNo,
  pickFirst,
} from "./frontend-contract-fields";
import { isSubleaseInstrument } from "@/src/lib/instrument-types";

const OrderSectionErrorMenu = dynamic(
  () => import("@/components/Orders/messages/order-section-error-menu"),
  { ssr: false }
);

const resolveImageUrl = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value.trim() || null;
  if (typeof value === "object") {
    return value.url || value.path || value.full_url || value.src || null;
  }
  return null;
};

const calendarTypeLabel = (value) => {
  if (value === "hijri") return "هجري";
  if (value === "gregorian") return "ميلادي";
  return value;
};

const copyToClipboard = (value) => {
  if (!value || value === "--" || value === "—") return;
  navigator.clipboard.writeText(String(value));
  toast.success("تم النسخ بنجاح");
};

function isPdfUrl(url) {
  if (!url || typeof url !== "string") return false;
  return url.split("?")[0].toLowerCase().endsWith(".pdf");
}

function composeDob(day, month, year, fallback) {
  if (day && month && year) return `${day}-${month}-${year}`;
  return fallback ?? null;
}

const DeedOwners = ({ data }) => {
  const [agencyViewerOpen, setAgencyViewerOpen] = useState(false);
  const [deedViewerOpen, setDeedViewerOpen] = useState(false);

  const summary = data?.contract_summary ?? {};
  const pick = (...keys) =>
    pickFirst(...keys.flatMap((key) => [summary?.[key], data?.[key]]));

  const hasLegalAgent =
    asYesNo(pick("add_legal_agent_of_owner")) === "نعم";
  const isSublease = isSubleaseInstrument(data);
  const instrumentImageLabel = isSublease
    ? "صورة عقد الإيجار من الباطن الأساسي"
    : "صـورة الصك";

  const deedImageFields = useMemo(() => {
    const catalog = isSublease
      ? [
          {
            key: "image_instrument",
            label: instrumentImageLabel,
            type: "file",
            accept: "image/*,application/pdf",
            colSpan: 3,
          },
        ]
      : SUMMARY_INSTRUMENT_IMAGE_FIELDS;

    const existing = catalog.filter((field) =>
      Boolean(resolveImageUrl(pick(field.key)))
    );

    // Only editable slots that already have a file; if none, keep primary upload field.
    if (existing.length > 0) return existing;
    return catalog.slice(0, 1);
  }, [isSublease, instrumentImageLabel, data, summary]);

  const agencyDocumentUrl = resolveAgencyDocumentUrl({
    ...summary,
    copy_of_the_authorization_or_agency: pick(
      "copy_of_the_authorization_or_agency",
      "copy_of_the_authorization_or_agency_path"
    ),
  });
  const agencyIsPdf = isPdfUrl(agencyDocumentUrl);

  const images = INSTRUMENT_IMAGE_FIELDS.map(({ key, label }) => {
    const url = resolveImageUrl(pick(key));
    if (!url) return null;
    const displayLabel =
      key === "image_instrument" && isSublease
        ? "صورة عقد الإيجار من الباطن الأساسي"
        : label;
    return {
      original: url,
      thumbnail: url,
      description: displayLabel,
      originalAlt: displayLabel,
    };
  }).filter(Boolean);

  const ownerFields = [
    { value: pick("property_owner_id_num"), label: "رقم الهوية" },
    {
      value: composeDob(
        pick("property_owner_dob_day"),
        pick("property_owner_dob_month"),
        pick("property_owner_dob_year"),
        pick("property_owner_dob")
      ),
      label: "تاريخ الميلاد",
    },
    {
      value: calendarTypeLabel(pick("type_dob_property_owner", "type_dob")),
      label: "نوع تاريخ الميلاد",
    },
    { value: pick("property_owner_mobile"), label: "رقم الجوال" },
  ];

  const agentFields = [
    {
      value: pick("id_num_of_property_owner_agent"),
      label: "رقم هوية الوكيل",
    },
    {
      value: composeDob(
        pick("dob_of_property_owner_agent_day"),
        pick("dob_of_property_owner_agent_month"),
        pick("dob_of_property_owner_agent_year"),
        pick("dob_of_property_owner_agent")
      ),
      label: "تاريخ ميلاد الوكيل",
    },
    {
      value: calendarTypeLabel(pick("type_dob_property_owner_agent")),
      label: "نوع تاريخ ميلاد الوكيل",
    },
    {
      value: pick("mobile_of_property_owner_agent"),
      label: "جوال الوكيل",
    },
  ];

  const openAgencyDocument = () => {
    if (!agencyDocumentUrl) {
      toast.error("لا يوجد ملف وكالة مرفق");
      return;
    }
    setAgencyViewerOpen(true);
  };

  return (
    <div className="flex items-start gap-4" dir="rtl">
      <div className="w-1/3 shrink-0 min-w-0">
        <ContractStepEditor
          title={instrumentImageLabel}
          step="summary"
          fields={deedImageFields}
        >
          {images.length > 0 ? (
            <>
              <div dir="ltr">
                <DeedInstrumentViewer
                  images={images}
                  onExpand={() => setDeedViewerOpen(true)}
                />
              </div>
              <DeedInstrumentViewerDialog
                open={deedViewerOpen}
                onOpenChange={setDeedViewerOpen}
                images={images}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 rounded-[20px] border border-dashed border-gray-200 bg-white px-4 py-12 text-[#A3A3A3]">
              <Inbox size={28} className="text-gray-300" />
              <p className="text-sm font-medium text-center">
                لا توجد صور مرفقة — اضغط تعديل للرفع
              </p>
            </div>
          )}
        </ContractStepEditor>
      </div>

      <div className="flex-1 min-w-0 space-y-8">
        {!isSublease ? (
          <ContractStepEditor
            title="بيــانات المــلاك"
            step="summary"
            fields={SUMMARY_OWNER_FIELDS}
          >
            <div className="rounded-[28px] border border-gray-100 bg-gray-100/50 p-6">
              <SummaryFieldsLayout
                errorMenu={
                  <OrderSectionErrorMenu
                    label="إرسال خطأ للعميل"
                    orderData={data}
                    context="owner"
                    buttonClassName={SECTION_ERROR_BUTTON_CLASS}
                  />
                }
              >
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                  {ownerFields.map((item) => (
                    <SummaryInfoItem
                      key={item.label}
                      value={item.value}
                      label={item.label}
                      onCopy={copyToClipboard}
                    />
                  ))}
                </div>
              </SummaryFieldsLayout>
            </div>
          </ContractStepEditor>
        ) : null}

        {!isSublease && hasLegalAgent ? (
          <ContractStepEditor
            title="بيــانات الوكيل"
            step="summary"
            fields={SUMMARY_AGENT_FIELDS}
          >
            <div className="rounded-[28px] border border-gray-100 bg-gray-100/50 p-6">
              <div className="space-y-6">
                <SummaryFieldsLayout
                  errorMenu={
                    <OrderSectionErrorMenu
                      label="إرسال خطأ للوكيل"
                      orderData={data}
                      context="agent"
                      buttonClassName={SECTION_ERROR_BUTTON_CLASS}
                    />
                  }
                >
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                    {agentFields.map((item) => (
                      <SummaryInfoItem
                        key={item.label}
                        value={item.value}
                        label={item.label}
                        onCopy={copyToClipboard}
                      />
                    ))}
                  </div>
                </SummaryFieldsLayout>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <LegalAgentStatusBadge />

                  {agencyDocumentUrl ? (
                    <button
                      type="button"
                      onClick={openAgencyDocument}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#E8E8E8] bg-white px-4 py-2.5 text-[13px] font-bold text-black shadow-sm transition-colors hover:bg-[#FAFAFA]"
                    >
                      {agencyIsPdf ? (
                        <Eye className="size-4" />
                      ) : (
                        <ImageIcon className="size-4" />
                      )}
                      {agencyIsPdf ? "عرض الوكالة PDF" : "عرض صورة الوكالة"}
                    </button>
                  ) : (
                    <span className="text-[13px] font-medium text-[#A3A3A3] opacity-45">
                      لا يوجد ملف وكالة
                    </span>
                  )}
                </div>
              </div>
            </div>
          </ContractStepEditor>
        ) : null}

        <UserRelatedContracts orderData={data} />
      </div>

      <AgencyDocumentViewerDialog
        open={agencyViewerOpen}
        onOpenChange={setAgencyViewerOpen}
        documentUrl={agencyDocumentUrl}
        title={agencyIsPdf ? "وكالة PDF" : "صورة الوكالة"}
      />
    </div>
  );
};

export default DeedOwners;
