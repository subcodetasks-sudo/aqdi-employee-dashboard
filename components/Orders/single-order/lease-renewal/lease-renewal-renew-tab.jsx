"use client";

import Image from "next/image";
import { toast } from "sonner";
import {
  Copy,
  Download,
  Eye,
  Hand,
  ImageIcon,
} from "lucide-react";
import LeaseRenewalDraftTransfer from "./lease-renewal-draft-transfer";
import { ContractStepEditor } from "../contract-edit/contract-step-editor";
import {
  LEASE_RENEWAL_NOTES_FIELDS,
  LEASE_RENEWAL_TENANT_FIELDS,
  LEASE_RENEWAL_TERMS_FIELDS,
} from "../contract-edit/contract-field-schemas";
import {
  formatDisplayValue,
  isEmptyDisplayValue,
} from "../contract-summary-view";

const EMPTY_ADDITIONAL_TERMS = "لا توجد شروط أو متغيرات إضافية من العميل";
const EMPTY_NOTES = "لا توجد ملاحظات";

const getFileExtension = (url) => {
  if (!url) return "jpg";
  const match = url.split("?")[0].match(/\.([a-zA-Z0-9]+)$/);
  return match ? match[1].toLowerCase() : "jpg";
};

export default function LeaseRenewalRenewTab({ orderData }) {
  const step3 = orderData?.step3 ?? {};
  const step4 = orderData?.step4 ?? {};
  const orderUuid = orderData?.uuid ?? "410001";
  const instrumentImage = orderData?.contract_summary?.image_instrument ?? null;
  const fileExtension = getFileExtension(instrumentImage);
  const documentName = `الصك #${orderUuid}`;

  const additionalTerms = step4.text_additional_terms?.trim() || null;
  const notesEdits = step4.notes_edits?.trim() || null;
  const termsLines = additionalTerms
    ? additionalTerms.split(/\n+/).map((line) => line.trim()).filter(Boolean)
    : [];

  const requireInstrumentImage = () => {
    if (!instrumentImage) {
      toast.error("لا توجد صورة صك متاحة");
      return false;
    }
    return true;
  };

  const handleDownloadInstrument = async () => {
    if (!requireInstrumentImage()) return;

    const filename = `${documentName}.${fileExtension}`;

    try {
      const response = await fetch(instrumentImage);
      if (!response.ok) throw new Error("fetch failed");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
      toast.success("تم تحميل صورة الصك بنجاح");
    } catch {
      const link = document.createElement("a");
      link.href = instrumentImage;
      link.download = filename;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("تم بدء تحميل صورة الصك");
    }
  };

  const handleViewInstrument = () => {
    if (!requireInstrumentImage()) return;
    window.open(instrumentImage, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[350px_minmax(0,1fr)] gap-5">
      <div>
        <ContractStepEditor title="العقد المرغوب تجديده :" step="summary" fields={[]} showEdit={false}>
          <div className="bg-[#F4F4F4] rounded-[20px] p-5 flex flex-col gap-4">
            <button
              type="button"
              onClick={handleDownloadInstrument}
              className="bg-white rounded-[18px] py-6 px-4 flex flex-col items-center border border-[#EBEBEB] hover:border-[#0019FF] hover:bg-[#F8FAFF] transition-colors w-full"
            >
              {instrumentImage ? (
                <div className="relative w-full max-w-[200px] h-[120px] mb-4 rounded-xl overflow-hidden border border-[#EEE]">
                  <Image
                    src={instrumentImage}
                    alt="صورة الصك"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-[72px] h-[72px] rounded-full bg-black flex items-center justify-center mb-4">
                  <ImageIcon className="size-8 text-white" />
                </div>
              )}
              <p className="font-black text-[15px] text-black">تحميل العقد</p>
              <p className="text-[12px] text-[#9E9E9E] mt-1">{fileExtension}</p>
            </button>

            {instrumentImage ? (
              <div className="flex items-center justify-between gap-2 bg-white rounded-xl p-3 border border-[#EEEEEE]">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleViewInstrument}
                    className="w-8 h-8 rounded-full border border-[#E0E0E0] flex items-center justify-center text-[#757575] hover:bg-gray-50"
                    title="معاينة"
                  >
                    <Eye className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadInstrument}
                    className="w-8 h-8 rounded-full border border-[#E0E0E0] flex items-center justify-center text-[#757575] hover:bg-gray-50"
                    title="تحميل"
                  >
                    <Download className="size-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="text-right min-w-0">
                    <p className="text-[12px] font-bold text-black truncate">{documentName}</p>
                    <p className="text-[10px] text-[#9E9E9E]">{fileExtension}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shrink-0 overflow-hidden relative">
                    <Image
                      src={instrumentImage}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-[12px] text-[#9E9E9E] py-2">
                لا توجد صورة صك مرفقة
              </p>
            )}
          </div>
        </ContractStepEditor>
      </div>

      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#F4F4F4] rounded-[20px] p-5">
            <ContractStepEditor
              title="تفاصيل المستأجر :"
              step="step3"
              fields={LEASE_RENEWAL_TENANT_FIELDS}
            >
              <div
                className={`bg-white rounded-2xl p-4 border-r-[3px] border-r-[#9C27B0] shadow-sm ${
                  isEmptyDisplayValue(step3.tenant_dob) ? "opacity-45" : ""
                }`}
              >
                <p className="text-[11px] text-[#9E9E9E] mb-1">تاريخ ميلاد المستأجر</p>
                <p
                  className={`text-[15px] font-bold ${
                    isEmptyDisplayValue(step3.tenant_dob) ? "text-[#A3A3A3]" : "text-black"
                  }`}
                >
                  {formatDisplayValue(step3.tenant_dob)}
                </p>
              </div>
            </ContractStepEditor>
          </div>

          <div className="bg-[#F4F4F4] rounded-[20px] p-5">
            <LeaseRenewalDraftTransfer
              orderId={orderData?.id}
              orderData={orderData}
              layout="stacked"
            />
          </div>
        </div>

        <ContractStepEditor
          title="الشروط والمتغيرات التي طلبها العميل :"
          step="step4"
          fields={LEASE_RENEWAL_TERMS_FIELDS}
        >
          <div className="bg-white rounded-[20px] p-6 border border-[#EBEBEB] shadow-sm relative min-h-[200px]">
            <button
              type="button"
              className="absolute left-4 bottom-4 w-9 h-9 rounded-full border border-[#E4E4E4] flex items-center justify-center text-[#A3A3A3] hover:bg-gray-50 disabled:opacity-40"
              disabled={!additionalTerms}
              onClick={() => {
                if (!additionalTerms) {
                  toast.error("لا يوجد نص للنسخ");
                  return;
                }
                navigator.clipboard.writeText(additionalTerms);
                toast.success("تم النسخ");
              }}
            >
              <Copy className="size-4" />
            </button>
            {additionalTerms ? (
              termsLines.length > 1 ? (
                <ol className="list-decimal list-inside space-y-4 text-[13px] text-[#333] leading-[1.8] pr-1">
                  {termsLines.map((term, i) => (
                    <li key={i} className="text-right">
                      <span className="mr-1">{term}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-[13px] text-[#333] leading-[1.8] text-right whitespace-pre-wrap">
                  {additionalTerms}
                </p>
              )
            ) : (
              <p className="text-[13px] text-[#A3A3A3] text-right opacity-70">{EMPTY_ADDITIONAL_TERMS}</p>
            )}
          </div>
        </ContractStepEditor>

        <ContractStepEditor
          title="يرجى الانتباه :"
          step="step4"
          fields={LEASE_RENEWAL_NOTES_FIELDS}
        >
          <div className="bg-[#F0F0F0] rounded-[16px] p-5 flex gap-3 items-start border border-[#E8E8E8]">
            <Hand className="size-7 text-[#FF4D4F] shrink-0 rotate-180" />
            <div className="text-right flex-1">
              <p className="font-black text-black text-[14px] mb-2">يرجى الانتباه :</p>
              <p className="text-[12px] text-[#555] leading-relaxed whitespace-pre-wrap">
                {notesEdits ?? (
                  <span className="text-[#A3A3A3] opacity-70">{EMPTY_NOTES}</span>
                )}
              </p>
            </div>
          </div>
        </ContractStepEditor>
      </div>
    </div>
  );
}
