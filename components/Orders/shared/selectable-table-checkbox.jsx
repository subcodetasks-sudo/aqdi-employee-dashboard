"use client";

import { Checkbox } from "@/components/ui/checkbox";

const checkboxClass =
  "border-[#C4C4C4] data-[state=checked]:bg-brand-accent data-[state=checked]:border-brand-accent";

export function SelectableTableHeaderCheckbox({
  pageSelectionState,
  onTogglePage,
  items = [],
}) {
  return (
    <th className="p-[15px_20px] border-b border-neutral-200 w-13">
      <Checkbox
        checked={
          pageSelectionState?.some ? "indeterminate" : pageSelectionState?.all
        }
        onCheckedChange={(checked) => onTogglePage?.(items, checked === true)}
        aria-label="تحديد كل الصفوف في الصفحة"
        className={checkboxClass}
      />
    </th>
  );
}

export function SelectableTableRowCheckbox({ row, isSelected, onToggleRow }) {
  return (
    <td className="p-[15px_20px]" onClick={(e) => e.stopPropagation()}>
      <Checkbox
        checked={isSelected?.(row?.id)}
        onCheckedChange={() => onToggleRow?.(row)}
        aria-label={`تحديد ${row?.uuid ?? row?.mobile_number ?? row?.id}`}
        className={checkboxClass}
      />
    </td>
  );
}
