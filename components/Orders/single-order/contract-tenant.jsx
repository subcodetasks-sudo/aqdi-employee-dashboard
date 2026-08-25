"use client";

import { useState } from "react";
import { Eye, FileText } from "lucide-react";
import { ContractStepEditor } from "./contract-edit/contract-step-editor";
import { STEP3_TENANT_FIELDS } from "./contract-edit/contract-field-schemas";
import { pickFirst } from "./frontend-contract-fields";
import AgencyDocumentViewerDialog, {
  resolveAgencyDocumentUrl,
} from "./agency-document-viewer-dialog";

function isPdfUrl(url) {
  if (!url || typeof url !== "string") return false;
  return url.split("?")[0].toLowerCase().endsWith(".pdf");
}

function ContractTenant({ data }) {
  const [agencyViewerOpen, setAgencyViewerOpen] = useState(false);
  const step3 = data?.step3 ?? {};
  const pick = (key, ...alts) =>
    pickFirst(step3[key], data?.[key], ...alts.map((k) => step3[k] ?? data?.[k]));

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

  return (
    <div className="space-y-6 p-4 lg:p-6" dir="rtl">
      <ContractStepEditor
        title="تفاصيل المستأجر"
        step="step3"
        fields={STEP3_TENANT_FIELDS}
        startInEditing
        formOnly
      />

      {isInstitution && isAgentAuth ? (
        <div className="rounded-2xl border border-surface-border bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-right">
              <p className="text-xs font-medium text-gray-400">
                صورة التفويض / الوكالة
              </p>
              <p className="mt-1 text-sm font-bold text-gray-800">
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
                className="inline-flex items-center gap-1.5 rounded-full border border-[#E0E0E0] bg-neutral-50 px-3 py-1.5 text-xs font-bold text-ink-subtle hover:border-brand-hover hover:text-brand-hover"
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
    </div>
  );
}

export default ContractTenant;
