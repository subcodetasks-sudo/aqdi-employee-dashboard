"use client";

import { cn } from "@/lib/utils";

export default function SectionCard({ title, subtitle, action, children, className }) {
  return (
    <div className={cn("rounded-xl border border-surface-border-soft bg-white p-5 flex flex-col gap-4 min-w-0", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3">
          {title ? (
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-gray-900">{title}</h3>
              {subtitle ? <p className="text-11 text-gray-400 mt-0.5">{subtitle}</p> : null}
            </div>
          ) : (
            <span />
          )}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
