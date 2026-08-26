"use client";

import { ChevronDown } from "lucide-react";
import { selectClass } from "./field-styles";

/** Native <select> styled to match `inputClass`, with a custom RTL-aware chevron
 *  (the browser's own arrow renders inconsistently across browsers/OSes, especially in RTL). */
export default function NativeSelect({ className = "", ...props }) {
  return (
    <div className="relative">
      <select className={`${selectClass} ${className}`.trim()} {...props} />
      <ChevronDown className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-gray-400 dark:text-white/40" />
    </div>
  );
}
