"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { Edit, FileText, Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import {
  buildContractUpdatePayload,
  getStepFormValues,
  validateOtherConditionsList,
  validateTenantRoleSelection,
} from "@/src/lib/contract-update";
import { resolveContractDurationMode } from "./contract-field-schemas";
import { useTenantRoles } from "@/src/hooks/use-tenant-roles";
import { useSingleOrderContext } from "../single-order-context";
import { resolveCalendarType } from "./contract-date-picker";
import {
  CALENDAR_TYPE_TO_DATE_KEYS,
  convertDateBetweenCalendars,
} from "./step-editor/date-calendar-utils";
import { isFieldEmpty, isFieldVisible } from "./step-editor/field-visibility";
import {
  GOLD,
  fieldGridClass,
  fieldGroupTitleClass,
} from "./step-editor/field-styles";
import ContractFormField from "./step-editor/contract-form-field";
import { useSectionEditorDialog } from "@/components/realtime-orders/details/section-editor-context";
import {
  getSaudiContactFieldError,
  getSaudiContactFieldKind,
} from "@/src/lib/saudi-contact";

export const ContractStepEditor = forwardRef(function ContractStepEditor(
  {
    title,
    step,
    fields: fieldsProp,
    /** Alternative to `fields`: an array of { title, fields } rendered as titled subsections within one shared form/footer. */
    fieldGroups = null,
    children,
    className = "",
    showEdit = true,
    /** Override form seed values (e.g. per-unit edit). Merged over step values. */
    initialValues = null,
    /** When true, form is seeded only from initialValues (no contract step merge). */
    seedFromInitialValuesOnly = false,
    /** Extra keys always merged into the save payload (e.g. real_units_id). */
    payloadExtras = null,
    /** Custom save — receives changed-fields payload. Skips default contract update. */
    onSave = null,
    /** Override saving spinner (e.g. unit mutation pending). */
    isSaving: isSavingProp = null,
    /** When true, the editor opens directly in edit mode instead of read-only preview. */
    startInEditing = false,
    /** When true, renders as a standalone form only: no preview/toggle, Save/Cancel as a bottom footer. */
    formOnly = false,
    /** When true (with formOnly), suppresses the internal Save/Cancel footer — an external control drives save() via ref. */
    hideFooter = false,
    /** Called whenever form values change. Used so a preview outside the form stays in sync. */
    onFormChange = null,
  },
  ref
) {
  const fields = useMemo(
    () => (fieldGroups?.length ? fieldGroups.flatMap((g) => g.fields) : fieldsProp ?? []),
    [fieldGroups, fieldsProp]
  );
  const { orderData, updateContract, isSaving: contextSaving } = useSingleOrderContext();
  const isSaving = isSavingProp ?? contextSaving;
  const [editing, setEditing] = useState(startInEditing);
  const [form, setForm] = useState({});
  const [initial, setInitial] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const needsTenantRolesCatalog = fields.some((field) => field.type === "tenant-roles");
  const { items: tenantRolesCatalog } = useTenantRoles(needsTenantRolesCatalog);
  const sectionEditorDialog = useSectionEditorDialog();
  const formResetKey = sectionEditorDialog?.resetKey ?? 0;

  const resolvedStep = step;

  const syncForm = useMemo(() => {
    if (seedFromInitialValuesOnly) {
      return initialValues && typeof initialValues === "object" ? { ...initialValues } : {};
    }
    if (!orderData) return {};
    const base = getStepFormValues(orderData, resolvedStep);
    const extra = {};
    for (const f of fields) {
      if (f.step && f.step !== resolvedStep) {
        const stepValues = getStepFormValues(orderData, f.step);
        extra[f.key] = stepValues[f.key] ?? "";
        if (f.calendarTypeKey) {
          extra[f.calendarTypeKey] = stepValues[f.calendarTypeKey] ?? base[f.calendarTypeKey] ?? "";
        }
      } else if (f.calendarTypeKey && base[f.calendarTypeKey] == null) {
        // Ensure linked calendar-type keys stay available even if not edited here.
        for (const maybeStep of ["summary", "step1", "step2", "step3", "step4", "step6"]) {
          const stepValues = getStepFormValues(orderData, maybeStep);
          if (stepValues[f.calendarTypeKey] != null && stepValues[f.calendarTypeKey] !== "") {
            extra[f.calendarTypeKey] = stepValues[f.calendarTypeKey];
            break;
          }
        }
      }
    }
    const merged = { ...base, ...extra };
    if (initialValues && typeof initialValues === "object") {
      Object.assign(merged, initialValues);
    }
    if (fields.some((field) => field.key === "duration_mode") && !merged.duration_mode) {
      merged.duration_mode = resolveContractDurationMode(merged);
    }
    return merged;
  }, [orderData, resolvedStep, fields, initialValues, seedFromInitialValuesOnly]);

  useEffect(() => {
    // Dialog form-only: seed once each time the dialog opens (resetKey bumps).
    if (formOnly) {
      setForm(syncForm);
      setInitial(syncForm);
      setFieldErrors({});
      return;
    }
    // Inline edit: re-seeding mid-edit would discard user input.
    if (editing) return;
    setForm(syncForm);
    setInitial(syncForm);
    setFieldErrors({});
  }, [formOnly, formOnly ? formResetKey : syncForm, syncForm, editing, formResetKey]);

  const handleSave = async () => {
    const editableKeys = new Set(fields.map((f) => f.key));

    const requiredErrors = {};
    for (const field of fields) {
      if (!field.required) continue;
      if (!isFieldVisible(field, form)) continue;
      if (isFieldEmpty(form[field.key])) {
        requiredErrors[field.key] = "هذا الحقل مطلوب";
      }
    }
    if (Object.keys(requiredErrors).length > 0) {
      setFieldErrors((prev) => ({ ...prev, ...requiredErrors }));
      toast.error("يرجى تعبئة الحقول المطلوبة");
      return;
    }

    const formatErrors = {};
    for (const field of fields) {
      if (!isFieldVisible(field, form)) continue;
      if (field.key === "unit_area" && !isFieldEmpty(form[field.key])) {
        const area = Number(String(form[field.key]).replace(/,/g, "").trim());
        if (!Number.isFinite(area) || area <= 0) {
          formatErrors[field.key] = "يجب أن تكون المساحة أكبر من صفر";
        }
      }
      if (!getSaudiContactFieldKind(field)) continue;
      if (isFieldEmpty(form[field.key])) continue;
      const message = getSaudiContactFieldError(field, form[field.key]);
      if (message) formatErrors[field.key] = message;
    }
    if (Object.keys(formatErrors).length > 0) {
      setFieldErrors((prev) => ({ ...prev, ...formatErrors }));
      toast.error(Object.values(formatErrors)[0]);
      return;
    }

    if (editableKeys.has("tenant_role_ids")) {
      const roleErrors = validateTenantRoleSelection(
        form.tenant_role_ids,
        form.tenant_role_values,
        tenantRolesCatalog
      );
      if (Object.keys(roleErrors).length > 0) {
        setFieldErrors(roleErrors);
        toast.error(Object.values(roleErrors)[0]);
        return;
      }
    }

    if (editableKeys.has("other_conditions_list")) {
      const conditionErrors = validateOtherConditionsList(form.conditions, form.other_conditions_list);
      if (Object.keys(conditionErrors).length > 0) {
        setFieldErrors(conditionErrors);
        toast.error(Object.values(conditionErrors)[0]);
        return;
      }
    }

    // Only send changes for fields shown in this section (even if empty).
    const scopedForm = Object.fromEntries(Object.entries(form).filter(([key]) => editableKeys.has(key)));
    const scopedInitial = Object.fromEntries(Object.entries(initial).filter(([key]) => editableKeys.has(key)));

    let payload = {};

    if (typeof onSave === "function") {
      for (const key of editableKeys) {
        const value = scopedForm[key];
        const prev = scopedInitial[key];
        if (value === prev) continue;
        if (value === "" && (prev === "" || prev === undefined)) continue;
        payload[key] = value;
      }
    } else {
      const stepsToSave = new Set([resolvedStep, ...fields.map((f) => f.step).filter(Boolean)]);
      for (const s of stepsToSave) {
        payload = {
          ...payload,
          ...buildContractUpdatePayload(s, scopedForm, scopedInitial),
        };
      }
    }

    if (payloadExtras && typeof payloadExtras === "object") {
      payload = { ...payload, ...payloadExtras };
    }

    const extrasKeys = new Set(
      payloadExtras && typeof payloadExtras === "object" ? Object.keys(payloadExtras) : []
    );
    const changedFieldKeys = Object.keys(payload).filter((key) => !extrasKeys.has(key));
    if (changedFieldKeys.length === 0) {
      toast.info("لا توجد تغييرات للحفظ");
      return;
    }

    try {
      setFieldErrors({});
      if (typeof onSave === "function") {
        await onSave(payload);
      } else {
        await updateContract(payload);
      }
      setInitial({ ...form });
      setEditing(false);
    } catch (err) {
      if (err?.fieldErrors) {
        const resolved = { ...err.fieldErrors };
        const areaRaw = String(form.unit_area ?? "").replace(/,/g, "").trim();
        const areaIsZero = areaRaw !== "" && Number(areaRaw) <= 0;
        for (const [key, message] of Object.entries(err.fieldErrors)) {
          const leaf = key.split(".").pop();
          if (!leaf || !fields.some((field) => field.key === leaf)) continue;
          resolved[leaf] =
            leaf === "unit_area" && areaIsZero && message === "هذا الحقل مطلوب"
              ? "يجب أن تكون المساحة أكبر من صفر"
              : message;
        }
        if (areaIsZero && resolved.unit_area === "هذا الحقل مطلوب") {
          resolved.unit_area = "يجب أن تكون المساحة أكبر من صفر";
        }
        setFieldErrors(resolved);
      }
    }
  };

  const handleCancel = () => {
    if (formOnly && sectionEditorDialog?.onClose) {
      if (!isSaving) sectionEditorDialog.onClose();
      return;
    }
    setForm(initial);
    setFieldErrors({});
    setEditing(false);
  };

  useImperativeHandle(ref, () => ({
    save: handleSave,
    cancel: handleCancel,
    setField(key, value) {
      const field = fields.find((item) => item.key === key) ?? { key };
      handleFieldChange(field, value);
    },
  }));

  useEffect(() => {
    onFormChange?.(form);
  }, [form, onFormChange]);

  const handleFieldChange = (field, val) => {
    setForm((prev) => {
      const next = { ...prev, [field.key]: val };

      // Listed period and custom years/months are alternate ways to set the same length.
      // Keep the inactive values so switching back before save restores them, and clear
      // the active copies so only the chosen mode is submitted.
      if (field.key === "duration_mode" && val !== prev.duration_mode) {
        if (val === "custom") {
          next.__listed_term = prev.contract_term_in_years ?? "";
          next.contract_term_in_years = "";
          if (prev.__custom_years !== undefined) next.duration_years = prev.__custom_years;
          if (prev.__custom_months !== undefined) next.duration_months = prev.__custom_months;
        } else {
          next.__custom_years = prev.duration_years ?? "";
          next.__custom_months = prev.duration_months ?? "";
          next.duration_years = "";
          next.duration_months = "";
          if (prev.__listed_term !== undefined) next.contract_term_in_years = prev.__listed_term;
        }
      }

      // Region change: reset city so it stays within the selected region.
      if (field.key === "property_place_id" && String(prev.property_place_id ?? "") !== String(val ?? "")) {
        next.property_city_id = "";
      }

      // Switching Hijri/Gregorian: convert linked date fields.
      const linkedDateKeys = CALENDAR_TYPE_TO_DATE_KEYS[field.key];
      if (linkedDateKeys) {
        const fromType = resolveCalendarType(prev[field.key], prev[linkedDateKeys[0]]);
        const toType = resolveCalendarType(val, prev[linkedDateKeys[0]]);
        for (const dateKey of linkedDateKeys) {
          if (!prev[dateKey]) continue;
          next[dateKey] = convertDateBetweenCalendars(prev[dateKey], fromType, toType);
          if (dateKey === "tenant_dob" && next[dateKey]) {
            const parts = String(next[dateKey]).split("-");
            if (parts.length === 3) {
              next.tenant_dob_day = parts[0];
              next.tenant_dob_month = parts[1];
              next.tenant_dob_year = parts[2];
            }
          }
          if (dateKey === "dob_of_property_tenant_agent" && next[dateKey]) {
            const parts = String(next[dateKey]).split("-");
            if (parts.length === 3) {
              next.dob_of_property_tenant_agent_day = parts[0];
              next.dob_of_property_tenant_agent_month = parts[1];
              next.dob_of_property_tenant_agent_year = parts[2];
            }
          }
        }
      }

      // Keep day/month/year parts in sync when the main date changes.
      if (field.type === "date" && typeof val === "string") {
        const parts = val.split("-");
        if (parts.length === 3) {
          if (field.key === "tenant_dob") {
            next.tenant_dob_day = parts[0];
            next.tenant_dob_month = parts[1];
            next.tenant_dob_year = parts[2];
          }
          if (field.key === "dob_of_property_tenant_agent") {
            next.dob_of_property_tenant_agent_day = parts[0];
            next.dob_of_property_tenant_agent_month = parts[1];
            next.dob_of_property_tenant_agent_year = parts[2];
          }
          if (field.key === "instrument_history") {
            next.instrument_history_day = parts[0];
            next.instrument_history_month = parts[1];
            next.instrument_history_year = parts[2];
          }
          if (field.key === "date_first_registration") {
            next.date_first_registration_day = parts[0];
            next.date_first_registration_month = parts[1];
            next.date_first_registration_year = parts[2];
          }
        }
      }

      return next;
    });
  };

  const renderField = (field) => (
    <ContractFormField
      key={`${field.key}-${formResetKey}`}
      field={field}
      value={form[field.key]}
      formValues={form}
      orderData={orderData}
      error={fieldErrors[field.key]}
      fieldErrors={fieldErrors}
      formResetKey={formResetKey}
      onPatch={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
      onChange={(val) => handleFieldChange(field, val)}
    />
  );

  return (
    <div className={className} dir="rtl">
      {title && !fieldGroups?.length && formOnly ? (
        <h4 className={`mb-4 ${fieldGroupTitleClass}`}>{title}</h4>
      ) : null}
      {title && !fieldGroups?.length && !formOnly ? (
        <div className="mb-4 flex flex-wrap items-center gap-3 px-2">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-green-600" />
            <h3 className="text-sm! font-bold text-gray-800 dark:text-white">{title}</h3>
          </div>
          {showEdit ? (
            <div className="flex items-center gap-2">
              {editing ? (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-2 text-sm font-bold text-neutral-500 hover:bg-neutral-100"
                  >
                    <X size={16} />
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 rounded-full bg-brand-hover px-4 py-2 text-sm font-bold text-white hover:bg-brand-hover/90 disabled:opacity-60"
                  >
                    {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save size={16} />}
                    حفظ
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className=" flex items-center gap-1.5 text-xs font-bold text-green-600 hover:text-green-700"
                >
                  <span>تعديل</span>
                  <Edit />
                </button>
              )}
            </div>
          ) : null}
        </div>
      ) : null}

      {editing || formOnly ? (
        <div
          key={formOnly ? `form-${formResetKey}` : undefined}
          className={
            formOnly
              ? "space-y-6"
              : "rounded-[28px] border border-surface-border dark:border-white/10 bg-surface-input dark:bg-white/[0.03] p-6"
          }
        >
          {fieldGroups?.length ? (
            fieldGroups.map((group, groupIndex) => {
              const visibleFields = group.fields.filter((field) => isFieldVisible(field, form));
              if (visibleFields.length === 0) return null;
              return (
                <div key={group.title ?? groupIndex} className="space-y-4">
                  {group.title ? <h4 className={fieldGroupTitleClass}>{group.title}</h4> : null}
                  <div className={fieldGridClass}>{visibleFields.map(renderField)}</div>
                </div>
              );
            })
          ) : (
            <div className={fieldGridClass}>
              {fields.filter((field) => isFieldVisible(field, form)).map(renderField)}
            </div>
          )}

          {formOnly && !hideFooter ? (
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 h-13 rounded-full text-white text-15 font-bold disabled:opacity-60 transition-opacity hover:opacity-90"
                style={{ backgroundColor: GOLD }}
              >
                {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save size={18} />}
                حفظ التعديلات
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="h-13 px-8 rounded-full border border-neutral-200 dark:border-white/10 text-15 font-bold text-neutral-500 dark:text-white/60 hover:bg-neutral-100 dark:hover:bg-white/10 disabled:opacity-60"
              >
                إلغاء
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        children
      )}
    </div>
  );
});
