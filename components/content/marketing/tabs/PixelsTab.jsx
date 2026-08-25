"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import SectionCard from "../shared/SectionCard";
import { StatCardRow } from "../shared/StatCard";
import { TH, TD } from "../shared/table";
import { PIXELS_STATS, AD_PIXELS, ANALYTICS_SOURCES, TRACKED_EVENTS, UTM_DEFAULTS } from "../shared/mock-data";

export default function PixelsTab() {
  const [utm, setUtm] = useState(UTM_DEFAULTS);
  const [pixelState, setPixelState] = useState(() =>
    Object.fromEntries([...AD_PIXELS, ...ANALYTICS_SOURCES].map((item) => [item.name, item.connected]))
  );

  const taggedUrl = buildUtmUrl(utm);

  const togglePixel = (name) => {
    setPixelState((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const copyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(taggedUrl).catch(() => {});
    }
    toast.success("تم نسخ الرابط");
  };

  return (
    <div className="flex flex-col gap-5">
      <StatCardRow items={PIXELS_STATS} className="lg:grid-cols-4" />

      <SectionCard title="بكسلات الإعلانات وتتبع التحويلات">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {AD_PIXELS.map((pixel) => (
            <IntegrationCard
              key={pixel.name}
              item={pixel}
              checked={pixelState[pixel.name]}
              onToggle={() => togglePixel(pixel.name)}
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="التحليلات ومصادر البيانات">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {ANALYTICS_SOURCES.map((source) => (
            <IntegrationCard
              key={source.name}
              item={source}
              checked={pixelState[source.name]}
              onToggle={() => togglePixel(source.name)}
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="الأحداث المتتبَّعة وقيمتها">
        <div className="overflow-x-auto -mx-1">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr>
                <th className={TH}>الحدث</th>
                <th className={TH}>المعنى</th>
                <th className={TH}>القيمة المُسنَدة</th>
                <th className={TH}>المنصات</th>
              </tr>
            </thead>
            <tbody>
              {TRACKED_EVENTS.map((row) => (
                <tr key={row.event} className={cn(row.highlight && "bg-[#F0FDF4]")}>
                  <td className={cn(TD, "font-mono font-semibold text-gray-900")}>{row.event}</td>
                  <td className={TD}>{row.meaning}</td>
                  <td className={cn(TD, row.highlight ? "font-bold text-green-700" : "text-gray-400")}>
                    {row.value}
                  </td>
                  <td className={TD}>{row.platforms}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-11 text-gray-400">
          حدث Purchase يحمل قيمة العقد (الرسوم) — وهو ما يُغذي الإيراد المُسنَد وROAS في بقية التبويبات.
        </p>
      </SectionCard>

      <SectionCard title="مولّد روابط UTM – لوسم روابط الحملات">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <UtmField label="الرابط" value={utm.url} onChange={(v) => setUtm((prev) => ({ ...prev, url: v }))} />
          <UtmField
            label="المصدر (source)"
            value={utm.source}
            onChange={(v) => setUtm((prev) => ({ ...prev, source: v }))}
          />
          <UtmField
            label="الوسيط (medium)"
            value={utm.medium}
            onChange={(v) => setUtm((prev) => ({ ...prev, medium: v }))}
          />
          <UtmField
            label="الحملة (campaign)"
            value={utm.campaign}
            onChange={(v) => setUtm((prev) => ({ ...prev, campaign: v }))}
          />
          <UtmField
            label="المحتوى (content)"
            value={utm.content}
            onChange={(v) => setUtm((prev) => ({ ...prev, content: v }))}
          />
          <UtmField label="الكلمة (term)" value={utm.term} onChange={(v) => setUtm((prev) => ({ ...prev, term: v }))} />
        </div>

        <button
          type="button"
          onClick={copyLink}
          className="h-9 px-4 rounded-lg border border-surface-border-soft bg-white text-xs font-bold text-gray-700 hover:bg-[#F9FAFB] transition-colors flex items-center gap-1.5 w-fit"
        >
          <Copy className="size-4 text-status-neutral" />
          نسخ الرابط
        </button>

        <div>
          <p className="text-xs font-bold text-gray-900 mb-1.5">الرابط الموسوم</p>
          <div className="rounded-lg border border-surface-border-soft bg-[#F9FAFB] px-3 py-2.5 text-xs text-gray-700 break-all">
            {taggedUrl}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function buildUtmUrl(utm) {
  const params = new URLSearchParams({
    utm_source: utm.source || "",
    utm_medium: utm.medium || "",
    utm_campaign: utm.campaign || "",
    utm_content: utm.content || "",
    utm_term: utm.term || "",
  });
  return `${utm.url || ""}?${params.toString()}`;
}

function UtmField({ label, value, onChange }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-gray-700">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-lg border border-surface-border-soft px-3 text-13 text-gray-900 focus:outline-none focus:border-brand-dark"
      />
    </label>
  );
}

function IntegrationCard({ item, checked, onToggle }) {
  return (
    <div className="rounded-lg border border-surface-border-soft p-3.5 flex flex-col gap-2.5 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <p className="text-13 font-bold text-gray-900 min-w-0">{item.name}</p>
        <Switch checked={checked} onCheckedChange={onToggle} className="shrink-0" />
      </div>

      {item.id ? (
        <p className="text-11 text-gray-400">المعرّف: {item.id}</p>
      ) : (
        <p className="text-11 text-red-600 font-semibold">غير مربوط</p>
      )}

      {item.badge ? (
        <span className="text-10 font-bold text-green-700 bg-[#DCFCE7] rounded px-1.5 py-0.5 w-fit">
          {item.badge}
        </span>
      ) : null}

      {item.note ? <p className="text-11 text-status-neutral">{item.note}</p> : null}

      {item.events?.length ? (
        <div className="flex flex-wrap gap-1">
          {item.events.map((event) => (
            <span key={event} className="text-10 font-mono font-semibold text-gray-700 bg-status-neutral-bg rounded px-1.5 py-0.5">
              {event}
            </span>
          ))}
        </div>
      ) : null}

      {item.connected ? <p className="text-11 text-gray-400">{item.lastEvent}</p> : null}

      <button
        type="button"
        onClick={() => toast.success("فتح الإعداد والكود (واجهة تجريبية)")}
        className="h-8 rounded-lg border border-surface-border-soft bg-white text-11 font-bold text-gray-700 hover:bg-[#F9FAFB] transition-colors mt-auto"
      >
        الإعداد والكود
      </button>
    </div>
  );
}
