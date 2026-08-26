"use client";

import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import SectionCard from "../shared/SectionCard";
import { StatCardRow } from "../shared/StatCard";
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
    <div>
      <StatCardRow items={PIXELS_STATS} />

      <SectionCard title="بكسلات الإعلانات وتتبع التحويلات" className="mt-[14px]">
        <div className="mkt-pixgrid">
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

      <SectionCard title="التحليلات ومصادر البيانات" className="mt-[14px]">
        <div className="mkt-pixgrid">
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

      <SectionCard title="الأحداث المتتبَّعة وقيمتها" className="mt-[14px]">
        <div className="tblwrap">
          <table className="mkt-tbl">
            <thead>
              <tr>
                <th>الحدث</th>
                <th>المعنى</th>
                <th>القيمة المُسنَدة</th>
                <th>المنصات</th>
              </tr>
            </thead>
            <tbody>
              {TRACKED_EVENTS.map((row) => (
                <tr key={row.event} style={row.highlight ? { background: "#f0fbf6" } : undefined}>
                  <td className="mkt-kw" style={{ direction: "ltr", textAlign: "center" }}>
                    {row.event}
                  </td>
                  <td>{row.meaning}</td>
                  <td className={row.highlight ? "mk-pos" : ""}>{row.value}</td>
                  <td>{row.platforms}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mkt-synchint" style={{ marginTop: 10 }}>
          حدث Purchase يحمل قيمة العقد (الرسوم) — وهو ما يُغذي الإيراد المُسنَد وROAS في بقية التبويبات.
        </p>
      </SectionCard>

      <SectionCard title="مولّد روابط UTM – لوسم روابط الحملات" className="mt-[14px]">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 10,
            marginBottom: 12,
          }}
        >
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

        <button type="button" className="mk-mini" onClick={copyLink} style={{ marginBottom: 12 }}>
          نسخ الرابط
        </button>

        <div>
          <div className="cpf-sec-t" style={{ marginBottom: 6 }}>
            الرابط الموسوم
          </div>
          <div
            style={{
              border: "1px solid #e5eee9",
              borderRadius: 10,
              background: "#f7fbf9",
              padding: "10px 12px",
              fontSize: 12,
              fontWeight: 600,
              color: "#2c3a34",
              direction: "ltr",
              textAlign: "left",
              wordBreak: "break-all",
            }}
          >
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
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "#4a5b54" }}>{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          height: 36,
          borderRadius: 9,
          border: "1.5px solid #dce8e3",
          padding: "0 12px",
          fontSize: 13,
          fontWeight: 600,
          color: "#1f2a28",
          fontFamily: "inherit",
        }}
      />
    </label>
  );
}

function IntegrationCard({ item, checked, onToggle }) {
  const switchId = `mkt-pix-${item.name.replace(/\s+/g, "-")}`;

  return (
    <div className={cn("mkt-pixcard", !checked && "off")}>
      <div className="mkt-pixtop">
        <div className="mkt-pixname">
          <i className={cn("mkt-pixdot", checked && "on")} />
          {item.name}
        </div>
        <label className="mkt-switch" htmlFor={switchId} title={checked ? "مفعّل" : "متوقف"}>
          <input
            id={switchId}
            type="checkbox"
            checked={checked}
            onChange={(e) => onToggle(e.target.checked)}
            aria-label={item.name}
          />
          <span />
        </label>
      </div>

      <div className="mkt-pixid">{item.id ? `ID: ${item.id}` : "غير مربوط"}</div>

      {item.badge ? (
        <span className="mkt-cat" style={{ background: "#dcf5e8", color: "#0b7a4c", marginBottom: 8 }}>
          {item.badge}
        </span>
      ) : null}

      {item.note ? <p className="mkt-pixlast" style={{ marginBottom: 8 }}>{item.note}</p> : null}

      {item.events?.length ? (
        <div className="mkt-pixev">
          {item.events.map((event) => (
            <span key={event}>{event}</span>
          ))}
        </div>
      ) : null}

      {checked && item.lastEvent ? <div className="mkt-pixlast">{item.lastEvent}</div> : null}

      <button
        type="button"
        className="mk-mini"
        style={{ marginTop: 10, width: "100%" }}
        onClick={() => toast.success("فتح الإعداد والكود (واجهة تجريبية)")}
      >
        الإعداد والكود
      </button>
    </div>
  );
}
