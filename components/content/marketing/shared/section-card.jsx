"use client";

import { cn } from "@/lib/utils";

export default function SectionCard({ title, subtitle, action, children, className, bodyClassName }) {
  return (
    <div className={cn("cpf-sec", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3">
          {title ? (
            <div className="min-w-0">
              <div className="cpf-sec-t" style={{ marginBottom: subtitle ? 0 : undefined }}>
                {title}
              </div>
              {subtitle ? <p className="cpf-sec-sub">{subtitle}</p> : null}
            </div>
          ) : (
            <span />
          )}
          {action}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
