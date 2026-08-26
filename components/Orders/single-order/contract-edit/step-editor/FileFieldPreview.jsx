"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";

function resolveFileDisplayUrl(value) {
  if (!value) return null;
  if (typeof File !== "undefined" && value instanceof File) {
    return value.name;
  }
  if (typeof value === "string") return value.trim() || null;
  if (typeof value === "object") {
    return value.url || value.path || value.full_url || value.src || null;
  }
  return null;
}

export default function FileFieldPreview({ value }) {
  const isFile = typeof File !== "undefined" && value instanceof File;
  const [objectUrl, setObjectUrl] = useState(null);

  useEffect(() => {
    if (!isFile || !value.type?.startsWith("image/")) {
      setObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [isFile, value]);

  if (isFile) {
    return (
      <div className="flex items-center gap-3">
        {objectUrl ? (
          <img
            src={objectUrl}
            alt=""
            className="size-14 rounded-xl border border-surface-border object-cover"
          />
        ) : (
          <span className="flex size-14 items-center justify-center rounded-xl border border-surface-border bg-neutral-50">
            <FileText className="size-5 text-[#E24444]" />
          </span>
        )}
        <p className="min-w-0 flex-1 truncate text-xs font-bold text-ink-subtle">{value.name}</p>
      </div>
    );
  }

  const currentUrl = resolveFileDisplayUrl(value);
  if (!currentUrl) return null;

  const isImage = !currentUrl.split("?")[0].toLowerCase().endsWith(".pdf");

  return (
    <div className="flex items-center gap-3">
      {isImage ? (
        <img
          src={currentUrl}
          alt=""
          className="size-14 rounded-xl border border-surface-border object-cover"
        />
      ) : (
        <span className="flex size-14 items-center justify-center rounded-xl border border-surface-border bg-neutral-50">
          <FileText className="size-5 text-[#E24444]" />
        </span>
      )}
      <a
        href={currentUrl}
        target="_blank"
        rel="noopener noreferrer"
        dir="ltr"
        className="min-w-0 flex-1 truncate text-xs text-neutral-500 hover:text-brand-hover"
      >
        {currentUrl}
      </a>
    </div>
  );
}
