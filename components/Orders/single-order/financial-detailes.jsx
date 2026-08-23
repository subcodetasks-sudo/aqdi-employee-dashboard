"use client";

import { ContractStepEditor } from "./contract-edit/contract-step-editor";
import {
  STEP4_FINANCIAL_FIELDS,
  STEP4_OTHER_CONDITIONS_FIELDS,
  STEP4_TERMS_FIELDS,
  STEP4_TENANT_ROLES_FIELDS,
} from "./contract-edit/contract-field-schemas";

const TERMS_FIELDS = STEP4_TERMS_FIELDS.filter((field) =>
  ["contract_starting_date", "type_contract_starting_date"].includes(field.key)
);

const FIELD_GROUPS = [
  { title: "البيانات المالية", fields: STEP4_FINANCIAL_FIELDS },
  { title: "مدة وتاريخ العقد", fields: TERMS_FIELDS },
  { title: "شروط أخرى", fields: STEP4_OTHER_CONDITIONS_FIELDS },
  { title: "صلاحيات المستأجر", fields: STEP4_TENANT_ROLES_FIELDS },
];

function FinancialDetailes() {
  return (
    <div dir="rtl">
      <ContractStepEditor
        step="step4"
        fieldGroups={FIELD_GROUPS}
        startInEditing
        formOnly
      />
    </div>
  );
}

export default FinancialDetailes;
