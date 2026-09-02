"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/src/hooks/usePermissions";
import { PERMISSION_SECTIONS } from "@/src/lib/permissions";
import PermissionGate from "@/components/auth/PermissionGate";
import {
  useMarketingArticles,
  useServicePageMutations,
  useServicePages,
} from "@/src/hooks/use-marketing-content";
import SectionCard from "../shared/SectionCard";
import { StatCardRow } from "../shared/StatCard";
import { StatusPill } from "../shared/Badges";
import {
  PeriodFilterBar,
  TrackingState,
  fmtInt,
  fmtMoney,
} from "../shared/tracking-ui";

const VIEWS = [
  { value: "articles", label: "المقالات", section: PERMISSION_SECTIONS.blogs },
  { value: "services", label: "صفحات الخدمات", section: PERMISSION_SECTIONS.analytics },
];

const PAGE_STATUS_OPTIONS = [
  { value: "published", label: "منشور" },
  { value: "draft", label: "مسودة" },
  { value: "archived", label: "مؤرشف" },
];

export default function ContentTab() {
  const { can, isReady } = usePermissions();
  const visibleViews = useMemo(
    () => VIEWS.filter((item) => !isReady || !item.section || can(item.section, "view")),
    [can, isReady]
  );
  const [view, setView] = useState("articles");
  const currentView = visibleViews.some((item) => item.value === view)
    ? view
    : visibleViews[0]?.value;

  return (
    <div>
      <div className="mkt-subtabs">
        {visibleViews.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setView(item.value)}
            className={cn("mkt-subtab", currentView === item.value && "on")}
          >
            {item.label}
          </button>
        ))}
      </div>

      {currentView === "services" ? <ServicePagesView /> : currentView === "articles" ? <ArticlesView /> : null}
    </div>
  );
}

/* ------------------------------- Service pages ------------------------------- */

const EMPTY_FORM = { title: "", path: "", target_keyword: "", status: "draft" };

function ServicePagesView() {
  const { can } = usePermissions();
  const canCreate = can(PERMISSION_SECTIONS.analytics, "create");
  const canEdit = can(PERMISSION_SECTIONS.analytics, "edit");
  const canDelete = can(PERMISSION_SECTIONS.analytics, "delete");

  const { summary, items, isLoading, error, refetch } = useServicePages();
  const { create, update, remove } = useServicePageMutations();

  const [form, setForm] = useState(null); // null | {id?, ...fields}

  const cards = [
    { value: fmtInt(summary?.total ?? 0), label: "إجمالي الصفحات", tone: "b" },
    { value: fmtInt(summary?.published ?? 0), label: "منشورة", tone: "g" },
    { value: fmtInt(summary?.drafts ?? 0), label: "مسودات", tone: "y" },
  ];

  const submit = (e) => {
    e.preventDefault();
    const body = {
      title: form.title.trim(),
      path: form.path.trim(),
      target_keyword: form.target_keyword.trim(),
      status: form.status,
    };
    if (!body.title || !body.path) return;
    const mutation = form.id ? update : create;
    const payload = form.id ? { id: form.id, ...body } : body;
    mutation.mutate(payload, {
      onSuccess: () => {
        toast.success(form.id ? "تم تحديث الصفحة" : "تمت إضافة الصفحة");
        setForm(null);
      },
      onError: (err) => toast.error(err?.response?.data?.message || "تعذّر حفظ الصفحة"),
    });
  };

  const handleDelete = (row) => {
    if (!window.confirm(`حذف «${row.title}»؟`)) return;
    remove.mutate(row.id, {
      onSuccess: () => toast.success("تم حذف الصفحة"),
      onError: (err) => toast.error(err?.response?.data?.message || "تعذّر الحذف"),
    });
  };

  return (
    <>
      <StatCardRow items={cards} />

      <SectionCard
        title="صفحات الخدمات والصفحات الثابتة للموقع"
        className="mt-3"
        action={
          canCreate ? (
            <button
              type="button"
              className="xbtn"
              onClick={() => setForm(form && !form.id ? null : { ...EMPTY_FORM })}
            >
              {form && !form.id ? "إغلاق" : "+ صفحة جديدة"}
            </button>
          ) : null
        }
      >
        {form ? (
          <form
            onSubmit={submit}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
              gap: 10,
              alignItems: "end",
              marginBottom: 14,
              padding: 12,
              background: "#f7fbf9",
              borderRadius: 12,
            }}
          >
            <FormField label="العنوان">
              <input className="mk-mini" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </FormField>
            <FormField label="الرابط (path)">
              <input className="mk-mini" dir="ltr" value={form.path} onChange={(e) => setForm({ ...form, path: e.target.value })} placeholder="/residential" required />
            </FormField>
            <FormField label="الكلمة المستهدفة">
              <input className="mk-mini" value={form.target_keyword} onChange={(e) => setForm({ ...form, target_keyword: e.target.value })} />
            </FormField>
            <FormField label="الحالة">
              <select className="mk-mini" dir="rtl" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {PAGE_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </FormField>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" className="xbtn" disabled={create.isPending || update.isPending}>
                {form.id ? "حفظ" : "إضافة"}
              </button>
              <button type="button" className="mk-mini" onClick={() => setForm(null)}>إلغاء</button>
            </div>
          </form>
        ) : null}

        <TrackingState
          isLoading={isLoading}
          error={error}
          isEmpty={!isLoading && items.length === 0 && !form}
          onRetry={refetch}
          emptyText="لا توجد صفحات خدمات بعد."
        >
          {items.length ? (
            <div className="tblwrap">
              <table className="mkt-tbl">
                <thead>
                  <tr>
                    <th>العنوان</th>
                    <th>الرابط</th>
                    <th>الكلمة المستهدفة</th>
                    <th>الحالة</th>
                    <th>آخر تحديث</th>
                    {(canEdit || canDelete) && <th />}
                  </tr>
                </thead>
                <tbody>
                  {items.map((row) => (
                    <tr key={row.id}>
                      <td className="mkt-title">{row.title}</td>
                      <td>
                        {row.url ? (
                          <a className="mkt-url" style={{ display: "inline", margin: 0 }} href={row.url} target="_blank" rel="noreferrer">
                            {row.path}
                          </a>
                        ) : (
                          <span className="mkt-url" style={{ display: "inline", margin: 0 }}>{row.path}</span>
                        )}
                      </td>
                      <td>{row.target_keyword || "—"}</td>
                      <td><StatusPill status={row.status_label_ar || row.status} /></td>
                      <td>{row.updated_at || "–"}</td>
                      {(canEdit || canDelete) && (
                        <td>
                          <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                            {canEdit && (
                              <button
                                type="button"
                                className="mk-mini"
                                onClick={() =>
                                  setForm({
                                    id: row.id,
                                    title: row.title || "",
                                    path: row.path || "",
                                    target_keyword: row.target_keyword || "",
                                    status: row.status || "draft",
                                  })
                                }
                              >
                                تحرير
                              </button>
                            )}
                            {canDelete && (
                              <button
                                type="button"
                                className="mk-mini"
                                onClick={() => handleDelete(row)}
                                disabled={remove.isPending}
                              >
                                حذف
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </TrackingState>
      </SectionCard>
    </>
  );
}

function FormField({ label, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span style={{ fontSize: 11.5, fontWeight: 800, color: "#4a5b54" }}>{label}</span>
      {children}
    </label>
  );
}

/* --------------------------------- Articles -------------------------------- */

function ArticlesView() {
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("");

  const {
    summary,
    categories,
    items,
    editorialQueue,
    periods,
    currencyLabel,
    isLoading,
    error,
    refetch,
  } = useMarketingArticles({ category, status });

  const cards = [
    { value: fmtInt(summary?.total ?? 0), label: "إجمالي المقالات", tone: "b" },
    { value: fmtInt(summary?.published ?? 0), label: "منشورة", tone: "g" },
    { value: fmtInt(summary?.scheduled ?? 0), label: "مجدولة", tone: "y" },
    { value: fmtInt(summary?.archived ?? 0), label: "مؤرشفة" },
    { value: fmtInt(summary?.views ?? 0), label: "مشاهدات" },
    { value: fmtMoney(summary?.attributed_revenue ?? 0, currencyLabel), label: "إيراد مُسنَد", tone: "g" },
  ];

  const catOptions = categories.length ? categories : [{ key: "all", label_ar: "الكل" }];

  return (
    <>
      <PeriodFilterBar periods={periods} />

      <StatCardRow items={cards} />

      <div className="mkt-blogbar">
        <div className="mkt-cats">
          {catOptions.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategory(c.key)}
              className={cn("mkt-catb", category === c.key && "on")}
            >
              {c.label_ar}
            </button>
          ))}
        </div>
        <div className="mkt-syncright">
          <select className="mk-mini" dir="rtl" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">كل الحالات</option>
            <option value="published">منشور</option>
            <option value="scheduled">مجدول</option>
            <option value="draft">مسودة</option>
            <option value="archived">مؤرشف</option>
          </select>
          <PermissionGate section={PERMISSION_SECTIONS.blogs} action="create">
            <Link href="/home/settings/blogs/create" className="xbtn">
              + مقال جديد
            </Link>
          </PermissionGate>
        </div>
      </div>

      <TrackingState
        isLoading={isLoading}
        error={error}
        isEmpty={!isLoading && items.length === 0}
        onRetry={refetch}
        emptyText="لا توجد مقالات مطابقة."
      >
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
              {items.map((row) => (
                <tr key={row.id}>
                  <td className="mkt-title">{row.title}</td>
                  <td>{row.category_label_ar ? <span className="mkt-cat">{row.category_label_ar}</span> : "—"}</td>
                  <td>{row.author || "—"}</td>
                  <td><StatusPill status={row.status_label_ar || row.status} /></td>
                  <td>{row.published_at || row.scheduled_at || "–"}</td>
                  <td>{fmtInt(row.words)}</td>
                  <td>{fmtInt(row.views)}</td>
                  <td>{fmtInt(row.leads)}</td>
                  <td>{fmtMoney(row.attributed_revenue, currencyLabel)}</td>
                  <td>
                    <PermissionGate section={PERMISSION_SECTIONS.blogs} action="edit">
                      <Link href={`/home/settings/blogs/${row.id}/edit`} className="mk-mini">
                        تحرير
                      </Link>
                    </PermissionGate>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TrackingState>

      {editorialQueue.length > 0 ? (
        <SectionCard title="التقويم التحريري — قيد الإعداد" className="mt-[14px]">
          <div className="mkt-cal">
            {editorialQueue.map((item) => (
              <div key={item.id} className="mkt-calcard">
                <div className="mkt-caldate">{item.scheduled_at || "غير مجدول"}</div>
                <div className="mkt-caltitle">{item.title}</div>
                <div>
                  <StatusPill status={item.status_label_ar || item.status} />{" "}
                  {item.category_label_ar ? <span className="mkt-cat">{item.category_label_ar}</span> : null}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : null}
    </>
  );
}
