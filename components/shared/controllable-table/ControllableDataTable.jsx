"use client";

import { cn } from "@/lib/utils";
import {
  DENSITY_CELL_CLASS,
  DENSITY_TEXT_CLASS,
  DEFAULT_TABLE_DENSITY,
} from "./density";

/**
 * Shared controllable data table — RTL, zebra rows, density-aware padding.
 * Uses Tailwind `dark:` so it follows the global html.dark theme.
 */
export default function ControllableDataTable({
  columns = [],
  data = [],
  density = DEFAULT_TABLE_DENSITY,
  isColumnVisible,
  getRowKey = (row, index) => row?.id ?? index,
  onRowClick,
  getRowHighlight,
  emptyMessage = "لا توجد بيانات متوفرة حالياً",
  isLoading = false,
  className,
  tableClassName,
}) {
  const visible = columns.filter((col) =>
    typeof isColumnVisible === "function"
      ? isColumnVisible(col)
      : col.hideable === false || col.visible !== false
  );

  const cellPad = DENSITY_CELL_CLASS[density] || DENSITY_CELL_CLASS.compact;
  const textSize = DENSITY_TEXT_CLASS[density] || DENSITY_TEXT_CLASS.compact;

  return (
    <div
      className={cn(
        // design.html .tblwrap — white card, #ECECEA border, 16px radius
        "w-full overflow-x-auto rounded-2xl border",
        "bg-white border-[#ECECEA] shadow-[0_1px_2px_rgba(11,83,69,0.04)]",
        "dark:bg-[#0F1C16] dark:border-white/[0.08] dark:shadow-none",
        className
      )}
      dir="rtl"
    >
      <table className={cn("w-full border-collapse", tableClassName)}>
        <thead>
          <tr className="bg-[#FAFBFB] dark:bg-[#162820]">
            {visible.map((col) => (
              <th
                key={col.id}
                className={cn(
                  "text-right font-semibold border-b whitespace-nowrap",
                  cellPad,
                  textSize,
                  "text-[#75827C] border-[#F0F0ED]",
                  "dark:text-white/55 dark:border-white/[0.08]",
                  col.sticky &&
                    "sticky start-0 z-20 bg-[#FAFBFB] dark:bg-[#162820]",
                  col.headerClassName
                )}
              >
                {typeof col.header === "function" ? col.header() : col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td
                colSpan={Math.max(visible.length, 1)}
                className={cn(
                  "text-center p-12 text-xs font-medium",
                  "text-[#8A8A84] dark:text-white/35"
                )}
              >
                جاري التحميل ...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={Math.max(visible.length, 1)}
                className={cn(
                  "text-center p-12 text-xs font-medium",
                  "text-[#8A8A84] dark:text-white/35"
                )}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => {
              const highlighted = getRowHighlight?.(row);
              return (
                <tr
                  key={getRowKey(row, index)}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    // design.html tbody tr has no zebra striping — plain rows, hover only
                    "group border-b last:border-0 transition-colors",
                    highlighted
                      ? "bg-[#FFFBEB] dark:bg-[#3A2A0F]/40"
                      : "bg-white dark:bg-transparent",
                    onRowClick && "cursor-pointer",
                    "border-[#F6F6F4] dark:border-white/[0.04]",
                    highlighted
                      ? "hover:bg-[#FEF3C7] dark:hover:bg-[#3A2A0F]/60"
                      : "hover:bg-[#F7FAF9] dark:hover:bg-white/[0.06]"
                  )}
                  style={
                    highlighted
                      ? { boxShadow: "inset -3px 0 0 #F59E0B" }
                      : undefined
                  }
                >
                  {visible.map((col) => (
                    <td
                      key={col.id}
                      className={cn(
                        cellPad,
                        textSize,
                        "text-[#22302C] dark:text-white/90",
                        col.sticky &&
                          cn(
                            "sticky start-0 z-10",
                            highlighted
                              ? "bg-[#FFFBEB] dark:bg-[#2A1F0A] group-hover:bg-[#FEF3C7] dark:group-hover:bg-[#3A2A0F]"
                              : "bg-white dark:bg-[#0F1C16] group-hover:bg-[#F7FAF9] dark:group-hover:bg-white/[0.06]"
                          ),
                        col.cellClassName
                      )}
                      onClick={
                        col.stopRowClick
                          ? (e) => e.stopPropagation()
                          : undefined
                      }
                    >
                      {col.cell?.(row, index)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
