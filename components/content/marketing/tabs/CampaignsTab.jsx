"use client";

import { toast } from "sonner";
import { RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/src/hooks/usePermissions";
import { PERMISSION_SECTIONS } from "@/src/lib/permissions";
import { useSyncAdSpend, useUtmTemplate } from "@/src/hooks/use-marketing-integrations";
import SectionCard from "../shared/SectionCard";
import { StatCardRow } from "../shared/StatCard";
import {
  ColorChip,
  DASH,
  PeriodFilterBar,
  RoasToneChip,
  TrackingState,
  fmtInt,
  fmtMoney,
  fmtRoas,
  fmtSignedMoney,
} from "../shared/tracking-ui";
import {
  useMarketingChannels,
  useMarketingOverview,
} from "@/src/hooks/use-marketing-tracking";

const PLATFORM_LABEL_AR = {
  google: "قوقل",
  meta: "ميتا",
  tiktok: "تيك توك",
  snapchat: "سناب",
  twitter: "إكس",
};

export default function CampaignsTab() {
  const { can } = usePermissions();
  const canSync = can(PERMISSION_SECTIONS.analytics, "create");
  const overview = useMarketingOverview();
  const channels = useMarketingChannels();
  const utm = useUtmTemplate();
  const syncMutation = useSyncAdSpend();

  const handleSync = () => {
    syncMutation.mutate(
      { days: 30 },
      {
        onSuccess: (data) => {
          const synced = Object.values(data || {}).reduce((s, r) => s + (r?.synced || 0), 0);
          const skipped = Object.entries(data || {})
            .filter(([, r]) => r?.skipped)
            .map(([p]) => PLATFORM_LABEL_AR[p] || p);
          if (synced > 0) toast.success(`تمت مزامنة ${synced} صف من صرف الإعلانات`);
          else if (skipped.length)
            toast.message("لا توجد حسابات إعلانية مُهيّأة", {
              description: `بحاجة إلى إعداد: ${skipped.join("، ")}`,
            });
          else toast.success("اكتملت المزامنة — لا جديد");
        },
        onError: (err) => toast.error(err?.response?.data?.message || "تعذّرت المزامنة"),
      }
    );
  };

  const data = overview.data;
  const currency = data?.currency_label_ar || "﷼";
  const summary = data?.summary || {};
  const topCampaigns = Array.isArray(data?.top_campaigns) ? data.top_campaigns : [];
  const channelRows = Array.isArray(channels.data?.channels) ? channels.data.channels : [];

  const stats = [
    { value: fmtMoney(summary.spend, currency), label: "الصرف", tone: "y" },
    { value: fmtMoney(summary.revenue, currency), label: "الإيراد", tone: "e" },
    { value: fmtRoas(summary.roas), label: "ROAS عام", tone: "b" },
    { value: fmtSignedMoney(summary.profit, currency), label: "ربح صافٍ", tone: "g" },
  ];

  return (
    <div>
      <PeriodFilterBar periods={data?.periods} />

      <div className="mkt-syncbar">
        <div className="mkt-srcs">
          <span className="mkt-src-lbl">تُزامَن تلقائيًا من:</span>
          {(utm.accounts.length
            ? utm.accounts
            : Object.keys(PLATFORM_LABEL_AR).map((p) => ({ platform: p, configured: false }))
          ).map((acc) => (
            <span key={acc.platform} className={cn("mkt-srcchip", !acc.configured && "off")}>
              <i className={cn("mkt-srcdot", acc.configured && "on")} />
              {acc.label || PLATFORM_LABEL_AR[acc.platform] || acc.platform}
            </span>
          ))}
        </div>
        {canSync ? (
          <div className="mkt-syncright">
            <button
              type="button"
              className="mkt-syncb"
              onClick={handleSync}
              disabled={syncMutation.isPending}
            >
              <RotateCw className={cn("size-3.5", syncMutation.isPending && "animate-spin")} />
              {syncMutation.isPending ? "جارٍ المزامنة…" : "مزامنة الآن"}
            </button>
          </div>
        ) : null}
      </div>
      <p className="mkt-synchint">
        الأرقام تُسحب من مصادر التسويق (UTM + بكسلات + صرف الإعلانات) — لإدارة الربط افتح تبويب «الربط والبكسلات».
      </p>

      <TrackingState
        isLoading={overview.isLoading}
        error={overview.error}
        isEmpty={!overview.isLoading && !data}
        onRetry={overview.refetch}
      >
        <StatCardRow items={stats} />

        <div className="cpf-grid cols-2 mt-[14px]">
          <HighlightCard data={data?.best_campaign} kind="good" title="أفضل حملة (ROAS)" currency={currency} />
          <HighlightCard data={data?.weakest_campaign} kind="bad" title="أضعف حملة (ROAS)" currency={currency} />
        </div>

        <SectionCard title="أداء القنوات المدفوعة — الصرف والإيراد وROAS" className="mt-[14px]">
          <TrackingState
            isLoading={channels.isLoading}
            error={channels.error}
            isEmpty={!channels.isLoading && channelRows.length === 0}
            onRetry={channels.refetch}
          >
            <div className="tblwrap">
              <table className="mkt-tbl">
                <thead>
                  <tr>
                    <th>القناة</th>
                    <th>الصرف</th>
                    <th>الإيراد</th>
                    <th>ROAS</th>
                    <th>تحويلات</th>
                    <th>CAC</th>
                    <th>الربح</th>
                  </tr>
                </thead>
                <tbody>
                  {channelRows.map((row) => (
                    <tr key={row.source}>
                      <td>
                        <ColorChip label={row.label_ar || row.source} color={row.color} />
                      </td>
                      <td>{fmtMoney(row.spend, currency)}</td>
                      <td>{fmtMoney(row.revenue, currency)}</td>
                      <td>
                        <RoasToneChip value={row.roas} tone={row.roas_tone} />
                      </td>
                      <td>{fmtInt(row.conversions)}</td>
                      <td>{row.cac == null ? DASH : fmtMoney(row.cac, currency)}</td>
                      <td className={Number(row.profit) >= 0 ? "mk-pos" : "mk-neg"}>
                        {fmtSignedMoney(row.profit, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TrackingState>
        </SectionCard>

        <SectionCard title="أكثر الحملات تحقيقًا للطلبات" className="mt-[14px]">
          {topCampaigns.length === 0 ? (
            <p className="mkt-synchint" style={{ margin: 0 }}>لا توجد حملات موسومة بطلبات لهذه الفترة.</p>
          ) : (
            <div className="tblwrap">
              <table className="mkt-tbl">
                <thead>
                  <tr>
                    <th>الحملة</th>
                    <th>المصدر</th>
                    <th>الطلبات</th>
                  </tr>
                </thead>
                <tbody>
                  {topCampaigns.map((item, index) => (
                    <tr key={`${item.campaign}-${index}`}>
                      <td className="mkt-title">{item.campaign}</td>
                      <td>
                        <ColorChip label={item.label_ar} color={item.color} />
                      </td>
                      <td>{fmtInt(item.orders)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </TrackingState>
    </div>
  );
}

function HighlightCard({ data, kind, title, currency }) {
  if (!data) return null;
  return (
    <div className={cn("mk-callout", kind)}>
      <div className="mk-co-t">{title}</div>
      <div className="mk-co-n" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {data.label_ar ? <ColorChip label={data.label_ar} color={data.color} /> : null}
        {data.campaign}
      </div>
      <div className="mk-co-v">
        {fmtRoas(data.roas)}
        {data.result_amount != null
          ? ` · ${data.result_label_ar || ""} ${fmtInt(data.result_amount)} ${currency}`.trimEnd()
          : ""}
      </div>
    </div>
  );
}
