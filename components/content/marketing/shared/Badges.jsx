"use client";

import { cn } from "@/lib/utils";

const SOURCE_CHIP = {
  قوقل: "ch-g",
  ميتا: "ch-m",
  "تيك توك": "ch-t",
  سناب: "ch-s",
  إكس: "ch-x",
};

const STATUS_DOT = {
  نشطة: "sd-ok",
  موقوفة: "sd-wr",
  منتهية: "sd-mut",
};

const STATUS_PILL = {
  منشور: "s-done",
  مسودة: "s-incomplete",
  مجدول: "s-raised",
  مجدولة: "s-raised",
  "غير مجدول": "s-arch",
  مؤرشف: "s-arch",
};

const SEVERITY = {
  عالية: "sev-hi",
  متوسطة: "sev-mid",
  منخفضة: "sev-low",
  high: "sev-hi",
  medium: "sev-mid",
  low: "sev-low",
};

const SEVERITY_LABEL_AR = {
  high: "عالية",
  medium: "متوسطة",
  low: "منخفضة",
};

export function SourceBadge({ source, className }) {
  return (
    <span className={cn("mkt-ch", SOURCE_CHIP[source] || "ch-x", className)}>
      {source}
    </span>
  );
}

export function StatusDot({ status, className }) {
  return (
    <span className={cn("stdot", STATUS_DOT[status] || "sd-mut", className)}>
      {status}
    </span>
  );
}

export function StatusPill({ status, className }) {
  return (
    <span className={cn("ncnt", STATUS_PILL[status] || "s-arch", className)}>
      {status}
    </span>
  );
}

export function TrendBadge({ trend, className }) {
  if (trend === "ارتفعت") {
    return <span className={cn("mkt-up", className)}>▲ ارتفعت</span>;
  }
  if (trend === "انخفضت") {
    return <span className={cn("mkt-down", className)}>▼ انخفضت</span>;
  }
  return <span className={cn("mkt-flat", className)}>▬ ثابتة</span>;
}

export function SeverityBadge({ severity, className }) {
  return (
    <span className={cn("mkt-sev", SEVERITY[severity] || "sev-low", className)}>
      {SEVERITY_LABEL_AR[severity] || severity}
    </span>
  );
}

export function CompetitionBadge({ competition }) {
  const cls =
    competition === "منخفضة" ? "comp-ok" : competition === "متوسطة" ? "comp-wr" : "comp-hi";
  return <span className={cn("mkt-comp", cls)}>{competition}</span>;
}

export function RoasChip({ value, numeric }) {
  const n = typeof numeric === "number" ? numeric : parseFloat(String(value).replace(/[^\d.]/g, "")) || 0;
  const cls = n >= 2 ? "roas-hi" : n >= 1 ? "roas-mid" : "roas-lo";
  return <span className={cn("roas", cls)}>{value}</span>;
}

export function PosChip({ pos }) {
  const cls = pos <= 3 ? "ptop" : pos <= 10 ? "pmid" : "plow";
  return <span className={cn("mkt-pos", cls)}>{pos}</span>;
}
