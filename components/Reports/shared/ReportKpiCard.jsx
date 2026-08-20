"use client";

import {
  Activity,
  Banknote,
  CheckCircle2,
  Clock,
  CreditCard,
  FileEdit,
  FilePlus,
  FileText,
  Layers,
  Package,
  Percent,
  Receipt,
  Tag,
  Undo2,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = {
  file: FileText,
  filePlus: FilePlus,
  creditCard: CreditCard,
  fileEdit: FileEdit,
  xCircle: XCircle,
  undo: Undo2,
  clock: Clock,
  wallet: Wallet,
  receipt: Receipt,
  tag: Tag,
  banknote: Banknote,
  percent: Percent,
  users: Users,
  checkCircle: CheckCircle2,
  userPlus: UserPlus,
  userCheck: UserCheck,
  package: Package,
  layers: Layers,
  activity: Activity,
};

const TONE_STYLES = {
  danger: "bg-[#FEE2E2] text-[#DC2626] dark:bg-red-500/15 dark:text-red-300",
  warning: "bg-[#FEF3C7] text-[#B45309] dark:bg-amber-500/15 dark:text-amber-300",
  muted: "bg-[#F3F4F6] text-[#6B7280] dark:bg-white/10 dark:text-white/60",
  default: "bg-[#E8F5F1] text-[#0B5345] dark:bg-emerald-500/15 dark:text-emerald-300",
};

function formatValue(value, isText) {
  if (isText || typeof value === "string") return value;
  return Number(value).toLocaleString("en-US");
}

export default function ReportKpiCard({ label, value, icon = "file", tone, isText }) {
  const Icon = ICONS[icon] ?? FileText;
  const iconStyle = TONE_STYLES[tone] ?? TONE_STYLES.default;

  return (
    <div className="rounded-xl border border-[#E6EBE9] bg-white p-4 flex flex-col gap-3 min-w-0 dark:border-white/10 dark:bg-[#13241C]">
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", iconStyle)}>
        <Icon className="size-[18px]" />
      </div>
      <div className="min-w-0">
        <p className="text-[22px] font-bold text-[#111827] leading-tight truncate dark:text-white">
          {formatValue(value, isText)}
        </p>
        <p className="text-[12px] text-[#9CA3AF] mt-1 leading-snug dark:text-white/50">{label}</p>
      </div>
    </div>
  );
}

export function ReportKpiGrid({ items, columns = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6" }) {
  return (
    <div className={cn("grid gap-3", columns)}>
      {items.map(({ key, ...item }) => (
        <ReportKpiCard key={key ?? item.label} {...item} />
      ))}
    </div>
  );
}
