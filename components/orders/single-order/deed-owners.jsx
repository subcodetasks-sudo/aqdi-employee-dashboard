"use client";

import { useMemo } from "react";
import { ContractStepEditor } from "./contract-edit/contract-step-editor";
import { getInstrumentTypeLabel } from "@/src/lib/instrument-types";
import { pickFirst } from "./frontend-contract-fields";

const DeedOwners = ({ data }) => {
  const summary = data?.contract_summary ?? {};
  const pick = (...keys) =>
    pickFirst(...keys.flatMap((key) => [summary?.[key], data?.[key]]));

  const instrumentTypeLabel = getInstrumentTypeLabel(
    pick("instrument_type_trans", "instrument_type", "instrument_type_key")
  );
  const deedNumber = pick("instrument_number", "deed_number");

  const fieldGroups = useMemo(
    () => [
      {
        title: "بيانات المستند",
        fields: [
          {
            key: "__deed_type_display",
            label: "نوع المستند",
            type: "text",
            locked: true,
            displayValue: instrumentTypeLabel,
          },
          {
            key: "__deed_number_display",
            label: "رقم الصك",
            type: "text",
            locked: true,
            displayValue: deedNumber,
          },
        ],
      },
      {
        title: "بيانات المالك",
        fields: [
          { key: "property_owner_id_num", label: "رقم الهوية", type: "text" },
          { key: "property_owner_mobile", label: "رقم الجوال", type: "text" },
        ],
      },
    ],
    [instrumentTypeLabel, deedNumber]
  );

  return (
    <div dir="rtl">
      <ContractStepEditor
        step="summary"
        fieldGroups={fieldGroups}
        startInEditing
        formOnly
      />
    </div>
  );
};

export default DeedOwners;
