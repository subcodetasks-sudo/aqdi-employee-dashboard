"use client";

import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { SOURCE_STYLES, STATUS_STYLES, TREND_STYLES, SEVERITY_STYLES } from "./theme";

export function SourceBadge({ source, className }) {
  const style = SOURCE_STYLES[source] ?? SOURCE_STYLES["إكس"];
  return (
    <span
      className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold shrink-0", className)}
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {source}
    </span>
  );
}

export function StatusDot({ status, className }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES["موقوفة"];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[12px] font-bold", className)} style={{ color: style.text }}>
      <span
        className="size-[7px] rounded-full shrink-0"
        style={{ backgroundColor: style.dot }}
      />
      {status}
    </span>
  );
}

export function StatusPill({ status, className }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES["غير مجدول"];
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold shrink-0", className)}
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {status}
    </span>
  );
}

export function TrendBadge({ trend, className }) {
  const style = TREND_STYLES[trend] ?? TREND_STYLES["ثابتة"];
  const Icon = style.arrow === "up" ? ArrowUp : style.arrow === "down" ? ArrowDown : Minus;
  return (
    <span className={cn("inline-flex items-center gap-1 text-[12px] font-bold", className)} style={{ color: style.text }}>
      {trend}
      <Icon className="size-3" />
    </span>
  );
}

export function SeverityBadge({ severity, className }) {
  const style = SEVERITY_STYLES[severity] ?? SEVERITY_STYLES["منخفضة"];
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold shrink-0", className)}
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {severity}
    </span>
  );
}
