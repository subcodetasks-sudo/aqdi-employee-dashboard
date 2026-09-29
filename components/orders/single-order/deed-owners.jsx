"use client";

import { useMemo } from "react";
import { ContractStepEditor } from "./contract-edit/contract-step-editor";
import {
  SUMMARY_AGENT_FIELDS,
  SUMMARY_INSTRUMENT_IMAGE_FIELDS,
  STEP1_PROPERTY_FIELDS,
} from "./contract-edit/contract-field-schemas";
import { getInstrumentTypeLabel } from "@/src/lib/instrument-types";
import { pickFirst } from "./frontend-contract-fields";
import {
  getOrderDeedStep,
  getOrderOwnerStep,
  hasEndowmentNazir,
  hasLegalAgent,
  pickAgentRelatedField,
} from "@/src/lib/order-detail-steps";

const ENDOWMENT_FIELDS = [
  {
    key: "copy_of_the_endowment_registration_certificate",
    label: "شهادة تسجيل الوقف",
    type: "file",
    accept: "image/*,application/pdf",
    colSpan: 3,
  },
  {
    key: "copy_of_the_trusteeship_deed",
    label: "صك النظارة",
    type: "file",
    accept: "image/*,application/pdf",
    colSpan: 3,
  },
  {
    key: "is_multiple_trusteeship_deed_copy",
    label: "أكثر من صك نظارة",
    type: "boolean",
  },
  {
    key: "copy_of_guardians_power_of_attorney_for_agent",
    label: "توكيل الأولياء للوكيل",
    type: "file",
    accept: "image/*,application/pdf",
    colSpan: 3,
  },
];

const AGENCY_EXTRA_FIELDS = [
  {
    key: "agency_number_in_instrument_of_property_owner",
    label: "رقم الوكالة في الصك",
    type: "text",
  },
  {
    key: "agency_instrument_date_of_property_owner",
    label: "تاريخ الوكالة",
    type: "date",
    calendarTypeKey: "type_agency_instrument_date_of_property_owner",
  },
  {
    key: "type_agency_instrument_date_of_property_owner",
    label: "نوع تاريخ الوكالة",
    type: "select",
    options: [
      { value: "hijri", label: "هجري" },
      { value: "gregorian", label: "ميلادي" },
    ],
  },
  {
    key: "agent_iban_of_property_owner",
    label: "آيبان الوكيل",
    type: "text",
  },
  {
    key: "id_num_of_property_owner_agent_record",
    label: "هوية سجل الوكيل",
    type: "text",
    inputKind: "national_id",
  },
  {
    key: "dob_hijri_of_property_owner_agent",
    label: "تاريخ ميلاد الوكيل (هجري)",
    type: "text",
  },
  {
    key: "copy_power_of_attorney_from_heirs_to_agent",
    label: "توكيل الورثة للوكيل",
    type: "file",
    accept: "image/*,application/pdf",
    colSpan: 3,
  },
  {
    key: "Image_inheritance_certificate",
    label: "شهادة حصر الإرث",
    type: "file",
    accept: "image/*,application/pdf",
    colSpan: 3,
  },
];

const DeedOwners = ({ data }) => {
  const summary = data?.contract_summary ?? {};
  const deed = getOrderDeedStep(data);
  const owner = getOrderOwnerStep(data);
  const pick = (...keys) =>
    pickFirst(
      ...keys.flatMap((key) => [
        summary?.[key],
        deed?.[key],
        owner?.[key],
        pickAgentRelatedField(data, key),
        data?.[key],
      ])
    );

  const instrumentTypeLabel = getInstrumentTypeLabel(
    pick("instrument_type_trans", "instrument_type", "instrument_type_key")
  );
  const showAgent = hasLegalAgent(data);
  const showNazir = hasEndowmentNazir(data);

  const fieldGroups = useMemo(() => {
    const groups = [
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
            key: "instrument_number",
            label: "رقم الصك",
            type: "text",
            step: "step1",
          },
        ],
      },
      {
        title: "بيانات المالك",
        fields: [
          {
            key: "property_owner_id_num",
            label: "رقم الهوية",
            type: "text",
            inputKind: "national_id",
          },
          {
            key: "property_owner_dob",
            label: "تاريخ الميلاد",
            type: "date",
            calendarTypeKey: "type_dob_property_owner",
          },
          {
            key: "type_dob_property_owner",
            label: "نوع تاريخ الميلاد",
            type: "select",
            options: [
              { value: "hijri", label: "هجري" },
              { value: "gregorian", label: "ميلادي" },
            ],
          },
          {
            key: "property_owner_mobile",
            label: "رقم الجوال",
            type: "text",
            inputKind: "phone",
          },
          {
            key: "add_legal_agent_of_owner",
            label: "إضافة وكيل للمالك",
            type: "boolean",
          },
        ],
      },
    ];

    if (showAgent) {
      groups.push({
        title: "الوكيل / المالك بوكالة",
        fields: [...SUMMARY_AGENT_FIELDS, ...AGENCY_EXTRA_FIELDS],
      });
    }

    if (showNazir) {
      groups.push({
        title: "ناظر الوقف",
        fields: ENDOWMENT_FIELDS,
      });
    }

    groups.push({
      title: "بيانات العقار",
      fields: STEP1_PROPERTY_FIELDS,
    });

    groups.push({
      title: "مرفقات الصك",
      fields: SUMMARY_INSTRUMENT_IMAGE_FIELDS,
    });

    return groups;
  }, [instrumentTypeLabel, showAgent, showNazir]);

  return (
    <div dir="rtl">
      <ContractStepEditor
        step="step3"
        fieldGroups={fieldGroups}
        startInEditing
        formOnly
      />
    </div>
  );
};

export default DeedOwners;
