"use client";

import { Plus, Trash2 } from "lucide-react";
import { normalizeOtherConditionsList } from "@/src/lib/contract-update";
import { inputClass } from "./field-styles";
import NativeSelect from "./NativeSelect";

const MAX_OTHER_CONDITIONS = 50;

export default function OtherConditionsListField({ formValues, onPatch, fieldErrors = {} }) {
  const enabled =
    formValues?.conditions === true || formValues?.conditions === 1 || formValues?.conditions === "1";
  const items = normalizeOtherConditionsList(formValues?.other_conditions_list);
  const displayItems = enabled && items.length === 0 ? [""] : items;

  const setEnabled = (nextEnabled) => {
    onPatch({
      conditions: nextEnabled ? 1 : 0,
      other_conditions_list: nextEnabled ? (items.length > 0 ? items : [""]) : [],
    });
  };

  const setItems = (nextItems) => {
    onPatch({
      conditions: 1,
      other_conditions_list: nextItems.slice(0, MAX_OTHER_CONDITIONS),
    });
  };

  const updateItem = (index, value) => {
    const next = [...displayItems];
    next[index] = value;
    setItems(next);
  };

  const addItem = () => {
    if (displayItems.length >= MAX_OTHER_CONDITIONS) return;
    setItems([...displayItems, ""]);
  };

  const removeItem = (index) => {
    if (displayItems.length <= 1) {
      setItems([""]);
      return;
    }
    setItems(displayItems.filter((_, i) => i !== index));
  };

  return (
    <div className="md:col-span-2 lg:col-span-3 space-y-4">
      <div className="flex flex-col gap-2">
        <label className="text-13 font-bold text-black dark:text-white text-right">هل توجد شروط أخرى؟</label>
        <NativeSelect value={enabled ? "1" : "0"} onChange={(e) => setEnabled(e.target.value === "1")}>
          <option value="1">نعم</option>
          <option value="0">لا</option>
        </NativeSelect>
      </div>

      {enabled ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-13 font-bold text-black dark:text-white text-right">قائمة الشروط</p>
            <button
              type="button"
              onClick={addItem}
              disabled={displayItems.length >= MAX_OTHER_CONDITIONS}
              className="flex items-center gap-1.5 rounded-full border border-brand-hover/30 bg-brand-hover/10 px-3 py-1.5 text-xs font-bold text-brand-hover disabled:opacity-50"
            >
              <Plus size={14} />
              إضافة شرط
            </button>
          </div>

          {displayItems.map((item, index) => {
            const rowError =
              fieldErrors[`other_conditions_list.${index}`] || fieldErrors[`other_conditions_list.${index + 1}`];
            return (
              <div key={`condition-${index}`} className="space-y-1.5">
                <div className="flex items-start gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateItem(index, e.target.value)}
                    placeholder={`الشرط ${index + 1}`}
                    className={`${inputClass} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-14 border border-surface-border dark:border-white/10 text-ink-placeholder dark:text-white/50 hover:border-red-200 hover:bg-red-50 hover:text-red-500 dark:hover:bg-[#3F1D1D] dark:hover:text-[#FCA5A5]"
                    title="حذف"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                {rowError ? <p className="text-xs text-[#E24444] text-right">{rowError}</p> : null}
              </div>
            );
          })}

          {fieldErrors.other_conditions_list ? (
            <p className="text-xs text-[#E24444] text-right">{fieldErrors.other_conditions_list}</p>
          ) : null}
          <p className="text-11 text-ink-placeholder text-right">
            الحد الأدنى شرط واحد · الحد الأقصى {MAX_OTHER_CONDITIONS}
          </p>
        </div>
      ) : null}
    </div>
  );
}
