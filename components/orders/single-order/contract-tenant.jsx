"use client";

import { useState } from "react";
import { Eye, FileText } from "lucide-react";
import { ContractStepEditor } from "./contract-edit/contract-step-editor";
import { STEP3_TENANT_FIELDS } from "./contract-edit/contract-field-schemas";
import { pickFirst } from "./frontend-contract-fields";
import AgencyDocumentViewerDialog, {
  resolveAgencyDocumentUrl,
} from "./agency-document-viewer-dialog";
import { getOrderTenantStep } from "@/src/lib/order-detail-steps";

function isPdfUrl(url) {
  if (!url || typeof url !== "string") return false;
  return url.split("?")[0].toLowerCase().endsWith(".pdf");
}

function ContractTenant({ data }) {
  const [agencyViewerOpen, setAgencyViewerOpen] = useState(false);
  const [ownerRecordViewerOpen, setOwnerRecordViewerOpen] = useState(false);
  const tenant = getOrderTenantStep(data);
  const pick = (key, ...alts) =>
    pickFirst(tenant[key], data?.[key], ...alts.map((k) => tenant[k] ?? data?.[k]));

  const tenantEntity = pick("tenant_entity");
  const isInstitution = tenantEntity === "institution";
  const authorizationType = pick("authorization_type");
  const isAgentAuth =
    authorizationType === "agent_or_authorized_by_registry_owner";

  const agencyDocumentUrl = resolveAgencyDocumentUrl({
    copy_of_the_authorization_or_agency: pick(
      "copy_of_the_authorization_or_agency",
      "copy_of_the_authorization_or_agency_path"
    ),
  });
  const agencyIsPdf = isPdfUrl(agencyDocumentUrl);

  const ownerRecordUrl = resolveAgencyDocumentUrl({
    copy_of_the_authorization_or_agency: pick(
      "copy_of_the_owner_record",
      "copy_of_the_owner_record_path"
    ),
  });
  const ownerRecordIsPdf = isPdfUrl(ownerRecordUrl);

  return (
    <div className="space-y-6 p-4 lg:p-6" dir="rtl">
      <ContractStepEditor
        title="تفاصيل المستأجر"
        step="step4"
        fields={STEP3_TENANT_FIELDS}
        startInEditing
        formOnly
      />

      {ownerRecordUrl ? (
        <div className="rounded-2xl border border-surface-border dark:border-white/10 bg-white dark:bg-white/[0.03] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-right">
              <p className="text-xs font-medium text-gray-400 dark:text-white/40">
                صورة سجل المالك
              </p>
              <p className="mt-1 text-sm font-bold text-gray-800 dark:text-white">
                {ownerRecordIsPdf ? "ملف PDF مرفق" : "صورة مرفقة"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOwnerRecordViewerOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E0E0E0] dark:border-white/10 bg-neutral-50 dark:bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-ink-subtle dark:text-white/70 hover:border-brand-hover hover:text-brand-hover"
            >
              {ownerRecordIsPdf ? (
                <FileText className="size-3.5 text-[#E24444]" />
              ) : (
                <Eye className="size-3.5" />
              )}
              معاينة
            </button>
          </div>
        </div>
      ) : null}

      {isInstitution && isAgentAuth ? (
        <div className="rounded-2xl border border-surface-border dark:border-white/10 bg-white dark:bg-white/[0.03] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-right">
              <p className="text-xs font-medium text-gray-400 dark:text-white/40">
                صورة التفويض / الوكالة
              </p>
              <p className="mt-1 text-sm font-bold text-gray-800 dark:text-white">
                {agencyDocumentUrl
                  ? agencyIsPdf
                    ? "ملف PDF مرفق"
                    : "صورة مرفقة"
                  : "لا يوجد ملف مرفق"}
              </p>
            </div>
            {agencyDocumentUrl ? (
              <button
                type="button"
                onClick={() => setAgencyViewerOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#E0E0E0] dark:border-white/10 bg-neutral-50 dark:bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-ink-subtle dark:text-white/70 hover:border-brand-hover hover:text-brand-hover"
              >
                {agencyIsPdf ? (
                  <FileText className="size-3.5 text-[#E24444]" />
                ) : (
                  <Eye className="size-3.5" />
                )}
                معاينة
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      <AgencyDocumentViewerDialog
        open={agencyViewerOpen}
        onOpenChange={setAgencyViewerOpen}
        documentUrl={agencyDocumentUrl}
        title={agencyIsPdf ? "وكالة PDF" : "صورة الوكالة"}
      />

      <AgencyDocumentViewerDialog
        open={ownerRecordViewerOpen}
        onOpenChange={setOwnerRecordViewerOpen}
        documentUrl={ownerRecordUrl}
        title={ownerRecordIsPdf ? "سجل المالك PDF" : "صورة سجل المالك"}
      />
    </div>
  );
}

export default ContractTenant;
