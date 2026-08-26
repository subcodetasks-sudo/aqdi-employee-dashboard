"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import SectionCard from "../shared/SectionCard";
import { StatCardRow } from "../shared/StatCard";
import { StatusPill } from "../shared/Badges";
import {
  SERVICE_PAGE_STATS,
  SERVICE_PAGES,
  ARTICLE_STATS,
  ARTICLE_CATEGORIES,
  ARTICLES,
  EDITORIAL_QUEUE,
} from "../shared/mock-data";

const VIEWS = [
  { value: "articles", label: "المقالات" },
  { value: "services", label: "صفحات الخدمات" },
];

export default function ContentTab() {
  const [view, setView] = useState("articles");

  return (
    <div>
      <div className="mkt-subtabs">
        {VIEWS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setView(item.value)}
            className={cn("mkt-subtab", view === item.value && "on")}
          >
            {item.label}
          </button>
        ))}
      </div>

      {view === "services" ? <ServicePagesView /> : <ArticlesView />}
    </div>
  );
}

function ServicePagesView() {
  return (
    <>
      <StatCardRow items={SERVICE_PAGE_STATS} />

      <SectionCard title="صفحات الخدمات والصفحات الثابتة للموقع" className="mt-3">
        <div className="tblwrap">
          <table className="mkt-tbl">
            <thead>
              <tr>
                <th>العنوان</th>
                <th>الرابط</th>
                <th>الكلمة المستهدفة</th>
                <th>الحالة</th>
                <th>التاريخ</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {SERVICE_PAGES.map((row) => (
                <tr key={row.title}>
                  <td className="mkt-title">{row.title}</td>
                  <td>
                    <span className="mkt-url" style={{ display: "inline", margin: 0 }}>
                      {row.link}
                    </span>
                  </td>
                  <td>{row.keyword}</td>
                  <td>
                    <StatusPill status={row.status} />
                  </td>
                  <td>{row.date}</td>
                  <td>
                    <EditButton />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </>
  );
}

function ArticlesView() {
  const [category, setCategory] = useState("الكل");

  const rows = useMemo(
    () => (category === "الكل" ? ARTICLES : ARTICLES.filter((article) => article.category === category)),
    [category]
  );

  return (
    <>
      <StatCardRow items={ARTICLE_STATS} />

      <div className="mkt-blogbar">
        <div className="mkt-cats">
          {ARTICLE_CATEGORIES.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setCategory(label)}
              className={cn("mkt-catb", category === label && "on")}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="xbtn"
          onClick={() => toast.success("إنشاء مقال جديد (واجهة تجريبية)")}
        >
          + مقال جديد
        </button>
      </div>

      <div className="tblwrap">
        <table className="mkt-tbl">
          <thead>
            <tr>
              <th>العنوان</th>
              <th>التصنيف</th>
              <th>الكاتب</th>
              <th>الحالة</th>
              <th>التاريخ</th>
              <th>كلمات</th>
              <th>مشاهدات</th>
              <th>Leads</th>
              <th>إيراد</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.title}>
                <td className="mkt-title">{row.title}</td>
                <td>
                  <span className="mkt-cat">{row.category}</span>
                </td>
                <td>{row.author}</td>
                <td>
                  <StatusPill status={row.status} />
                </td>
                <td>{row.date}</td>
                <td>{row.words.toLocaleString("en-US")}</td>
                <td>{row.views.toLocaleString("en-US")}</td>
                <td>{row.leads}</td>
                <td>{row.revenue.replace("ريال", "﷼")}</td>
                <td>
                  <EditButton />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {EDITORIAL_QUEUE.length > 0 ? (
        <SectionCard title="التقويم التحريري — قيد الإعداد" className="mt-[14px]">
          <div className="mkt-cal">
            {EDITORIAL_QUEUE.map((item) => (
              <div key={item.title} className="mkt-calcard">
                <div className="mkt-caldate">{item.date}</div>
                <div className="mkt-caltitle">{item.title}</div>
                <div>
                  {item.status ? <StatusPill status={item.status} /> : <StatusPill status="غير مجدول" />}{" "}
                  <span className="mkt-cat">{item.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : null}
    </>
  );
}

function EditButton() {
  return (
    <button
      type="button"
      className="mk-mini"
      onClick={() => toast.success("فتح المحرر (واجهة تجريبية)")}
    >
      تحرير
    </button>
  );
}
