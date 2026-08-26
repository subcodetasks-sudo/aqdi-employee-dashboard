"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { usePermissions } from "@/src/hooks/usePermissions";
import { PERMISSION_SECTIONS } from "@/src/lib/permissions";
import {
  isCrawlInProgress,
  SEO_CRAWL_QUERY_KEY,
  useSeoCrawlDashboard,
  useSeoCrawlIssues,
  useSeoCrawlRealtime,
  useStartSeoCrawl,
  useStopSeoCrawl,
} from "@/src/hooks/use-seo-crawl";
import AllOrdersPagination from "@/components/Orders/all-orders-pagination";
import SectionCard from "../shared/SectionCard";
import { StatCardRow } from "../shared/StatCard";
import { decodeUriText } from "../shared/decode-uri-text";
import {
  TrendBadge,
  SeverityBadge,
  CompetitionBadge,
  PosChip,
} from "../shared/Badges";
import {
  SEO_KEYWORD_STATS,
  SEO_KEYWORDS,
} from "../shared/mock-data";

const VIEWS = [
  { value: "keywords", label: "الكلمات المفتاحية" },
  { value: "crawl", label: "فحص الموقع (الزحف)" },
];

const CATEGORY_TONE = {
  high: "bad",
  medium: "warn",
  low: "",
  success: "ok",
};

const STATUS_LABELS = {
  never_run: "لم يتم الفحص بعد",
  queued: "في الانتظار...",
  running: "جارٍ الفحص...",
  completed: "مكتمل",
  stopped: "متوقف",
  failed: "فشل",
};

const SUMMARY_TONE = {
  indexed_pages: "b",
  healthy_pages: "g",
  broken_pages: "r",
  on_page_issues: "y",
};

function ErrorNote({ message, onRetry }) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <p className="text-13 text-red-600 dark:text-red-300">{message}</p>
      {onRetry ? (
        <button type="button" className="mk-mini inline-flex items-center gap-1.5" onClick={onRetry}>
          <RotateCw className="size-3.5" />
          إعادة المحاولة
        </button>
      ) : null}
    </div>
  );
}

function EmptyText({ children }) {
  return <p className="text-13 text-gray-400 dark:text-white/50">{children}</p>;
}

export default function SeoTab() {
  const [view, setView] = useState("keywords");

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

      {view === "keywords" ? <KeywordsView /> : <CrawlView />}
    </div>
  );
}

function KeywordsView() {
  const { can } = usePermissions();
  const canView = can(PERMISSION_SECTIONS.seo_crawl, "view");

  if (!canView) {
    return (
      <SectionCard title="الكلمات المفتاحية">
        <EmptyText>ليس لديك صلاحية للوصول إلى هذا القسم.</EmptyText>
      </SectionCard>
    );
  }

  return (
    <>
      <StatCardRow items={SEO_KEYWORD_STATS} />

      <SectionCard title="الكلمات المفتاحية — الترتيب والمنافسة والحالة" className="mt-3">
        <div className="tblwrap">
          <table className="mkt-tbl">
            <thead>
              <tr>
                <th>الكلمة / الصفحة</th>
                <th>الترتيب الحالي</th>
                <th>السابق</th>
                <th>بحث/شهر</th>
                <th>المنافسة</th>
                <th>الحالة</th>
                <th>الإيراد</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {SEO_KEYWORDS.map((row) => (
                <tr key={row.keyword}>
                  <td className="mkt-kw">
                    {row.keyword}
                    <span className="mkt-url">{row.page}</span>
                  </td>
                  <td>
                    <PosChip pos={row.current} />
                  </td>
                  <td>{row.previous}</td>
                  <td>{row.volume.toLocaleString("en-US")}</td>
                  <td>
                    <CompetitionBadge competition={row.competition} />
                  </td>
                  <td>
                    <TrendBadge trend={row.trend} />
                  </td>
                  <td>{row.revenue.toLocaleString("en-US")} ﷼</td>
                  <td>
                    <span className="mk-arrow">←</span>
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

function CrawlView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { can } = usePermissions();
  const canView = can(PERMISSION_SECTIONS.seo_crawl, "view");
  const canCreate = can(PERMISSION_SECTIONS.seo_crawl, "create");

  const [issueFilters, setIssueFilters] = useState({ type: null, severity: null, search: "" });
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  const { dashboard, isLoading, error, refetch, setPollFallback } = useSeoCrawlDashboard({
    enabled: canView,
  });

  const neverRun = !dashboard || dashboard.id == null;
  const realtimeEnabled = Boolean(dashboard?.realtime?.enabled) && canView;
  const { liveStatus } = useSeoCrawlRealtime(dashboard?.realtime?.path, {
    enabled: realtimeEnabled,
  });

  // The REST dashboard is the source of truth for `status` — Firebase only supplies
  // supplementary live fields (percent/current_url) below. Trusting liveStatus.status
  // here let a stale/never-updated Firebase node hold the UI on "running" forever
  // even after the backend had already finished.
  const effectiveStatus = dashboard?.status ?? "never_run";
  const inProgress = isCrawlInProgress(effectiveStatus);
  const isFailedState = effectiveStatus === "failed" && !inProgress;

  // Always poll the REST dashboard every 2-3s while a crawl is in progress, regardless
  // of Realtime DB — Firebase is a nice-to-have for smoother progress, not a substitute
  // for the poll. Set directly during render (not an effect) — `setPollFallback` just
  // updates a ref that the dashboard query reads lazily, it doesn't trigger a re-render.
  setPollFallback(inProgress);

  const {
    items: issues,
    pagination,
    isLoading: issuesLoading,
    error: issuesError,
    refetch: refetchIssues,
  } = useSeoCrawlIssues({
    type: issueFilters.type,
    severity: issueFilters.severity,
    search: issueFilters.search,
    page,
    perPage,
    enabled: canView && !neverRun && !isFailedState,
  });

  const startMutation = useStartSeoCrawl();
  const stopMutation = useStopSeoCrawl();

  // Nice-to-have: if Firebase signals a terminal status, refetch immediately instead
  // of waiting for the next poll tick. Not relied upon — `effectiveStatus` above only
  // ever reads from the REST dashboard, so a missed/stale Firebase write can't hang the UI.
  useEffect(() => {
    if (!liveStatus) return;
    if (["completed", "stopped", "failed"].includes(liveStatus.status)) {
      refetch();
      refetchIssues();
    }
  }, [liveStatus?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setTimeout(() => {
      setIssueFilters((f) => {
        const trimmed = searchInput.trim();
        return f.search === trimmed ? f : { ...f, search: trimmed };
      });
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const setIssueTypeFilter = (type) => {
    setIssueFilters((f) => ({ ...f, type }));
    setPage(1);
  };

  const setIssueSeverityFilter = (severity) => {
    setIssueFilters((f) => ({ ...f, severity }));
    setPage(1);
  };

  const categoryLabelByType = useMemo(
    () => Object.fromEntries((dashboard?.categories || []).map((c) => [c.type, c.label_ar || c.label])),
    [dashboard?.categories]
  );

  if (!canView) {
    return (
      <SectionCard title="زحف وفحص الموقع تقنيًا">
        <EmptyText>ليس لديك صلاحية للوصول إلى هذا القسم.</EmptyText>
      </SectionCard>
    );
  }

  const handleStart = () => {
    startMutation.mutate(undefined, {
      onSuccess: (res) => {
        toast.success(res?.data?.message || "بدأ فحص الموقع");
        const started = res?.data?.data;
        if (started?.id != null) {
          // Reflect the new run as queued immediately instead of waiting for the
          // next GET — the dashboard still shows the previous (possibly failed)
          // run's data until this lands.
          queryClient.setQueryData([SEO_CRAWL_QUERY_KEY, null], (old) => ({
            ...(old || {}),
            id: started.id,
            status: started.status || "queued",
            error_message: null,
          }));
        }
        refetch();
      },
      onError: (err) => {
        const message = err?.response?.data?.message;
        toast.error(
          err?.response?.status === 409
            ? message || "يوجد فحص للموقع قيد التشغيل حالياً"
            : message || "تعذر بدء فحص الموقع"
        );
        refetch();
      },
    });
  };

  const handleStop = () => {
    stopMutation.mutate(dashboard?.id, {
      onSuccess: (res) => {
        toast.success(res?.data?.message || "تم إيقاف الفحص");
        refetch();
        refetchIssues();
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || "تعذر إيقاف الفحص");
        refetch();
      },
    });
  };

  const percent =
    liveStatus?.percent ??
    (liveStatus?.progress_max
      ? Math.round(((liveStatus.progress_current ?? 0) / liveStatus.progress_max) * 100)
      : 0);

  const kpiItems = Object.entries(dashboard?.summary || {}).map(([key, val]) => ({
    value: val?.count ?? 0,
    label: val?.label ?? key,
    tone: SUMMARY_TONE[key],
  }));

  const openWebsiteDetails = (row) => {
    const params = new URLSearchParams();
    params.set("page", row.page || "");
    params.set("issueId", String(row.id));
    router.push(`/home/marketing-and-content/website-details?${params.toString()}`);
  };

  return (
    <>
      <div className="mkt-crawlbar">
        <div>
          <div className="mkt-crawl-h">{dashboard?.title || "زحف وفحص الموقع تقنيًا"}</div>
          <div className="mkt-synchint" style={{ margin: "2px 0 0" }}>
            {dashboard?.description ||
              "يفحص كل صفحات الموقع ويكتشف الأخطاء التقنية التي تضرّ بترتيبك في Google."}
          </div>
        </div>
        <div className="mkt-syncright">
          <span className="mkt-synctime">
            {STATUS_LABELS[effectiveStatus] || effectiveStatus}
            {dashboard?.last_scanned_at ? ` — آخر فحص: ${dashboard.last_scanned_at}` : ""}
          </span>
          {inProgress ? (
            <button type="button" className="mkt-syncb" onClick={handleStop} disabled={stopMutation.isPending}>
              {stopMutation.isPending ? "⟳ جارٍ الإيقاف..." : "⏹ إيقاف الفحص"}
            </button>
          ) : (
            <button
              type="button"
              className="mkt-syncb"
              onClick={handleStart}
              disabled={!canCreate || startMutation.isPending}
              title={!canCreate ? "ليس لديك صلاحية بدء الفحص" : undefined}
            >
              {startMutation.isPending
                ? isFailedState
                  ? "⟳ جارٍ إعادة الفحص..."
                  : "⟳ جارٍ البدء..."
                : isFailedState
                  ? "↻ إعادة الفحص"
                  : "⟲ بدء فحص الموقع"}
            </button>
          )}
        </div>
      </div>

      {inProgress && (
        <div className="mkt-crawlprogress">
          <div className="mkt-crawlprogress-track">
            <div
              className="mkt-crawlprogress-fill"
              style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
            />
          </div>
          <div className="mkt-crawlprogress-txt">
            {effectiveStatus === "queued" ? (
              "في الانتظار..."
            ) : (
              <>
                جاري الزحف… {liveStatus?.progress_current ?? dashboard?.pages_crawled ?? 0}/
                {liveStatus?.progress_max ?? "?"}
                {liveStatus?.current_url ? ` — ${decodeUriText(liveStatus.current_url)}` : ""}
              </>
            )}
          </div>
        </div>
      )}

      {isFailedState ? (
        <SectionCard title="ملخص الفحص" className="mt-[14px]">
          <div className="mk-callout bad">
            <p className="text-13 font-bold text-[#c0392b]">
              فشل فحص الموقع. اضغط «إعادة الفحص».
            </p>
            {(() => {
              const techDetail = dashboard?.error_message || liveStatus?.error_message;
              return techDetail ? (
                <details className="mt-2">
                  <summary className="text-xs font-bold text-[#c0392b] cursor-pointer select-none">
                    تفاصيل تقنية
                  </summary>
                  <pre
                    className="mt-2 text-11 whitespace-pre-wrap break-all text-[#7a2b1f] dark:text-red-200/80"
                    dir="ltr"
                  >
                    {techDetail}
                  </pre>
                </details>
              ) : null;
            })()}
          </div>
        </SectionCard>
      ) : error ? (
        <SectionCard title="ملخص الفحص" className="mt-[14px]">
          <ErrorNote
            message={error?.response?.data?.message || "تعذر تحميل بيانات فحص الموقع."}
            onRetry={refetch}
          />
        </SectionCard>
      ) : (
        <>
          {isLoading && !dashboard ? (
            <SectionCard title="ملخص الفحص" className="mt-[14px]">
              <EmptyText>جارٍ التحميل...</EmptyText>
            </SectionCard>
          ) : (
            <StatCardRow items={kpiItems} className="mt-[14px]" />
          )}

          {dashboard?.categories?.length ? (
            <SectionCard title="تفصيل نتائج الفحص" className="mt-[14px]">
              <div className="mkt-crawlgrid">
                {dashboard.categories.map((cat) => {
                  const clickable = cat.type !== "healthy_pages";
                  const active = issueFilters.type === cat.type;
                  return (
                    <button
                      key={cat.type}
                      type="button"
                      disabled={!clickable}
                      onClick={() => clickable && setIssueTypeFilter(active ? null : cat.type)}
                      className={cn(
                        "mkt-crawlstat",
                        CATEGORY_TONE[cat.severity] || "",
                        clickable && "clickable",
                        active && "active"
                      )}
                    >
                      <div className="mkt-cs-v">{cat.count}</div>
                      <div className="mkt-cs-l">{cat.label_ar || cat.label}</div>
                    </button>
                  );
                })}
              </div>
            </SectionCard>
          ) : null}
        </>
      )}

      <SectionCard
        title="قائمة المشاكل حسب الصفحة"
        className="mt-[14px]"
        action={
          neverRun || isFailedState ? null : (
            <div className="flex items-center gap-2 flex-wrap">
              {issueFilters.type ? (
                <button
                  type="button"
                  className="mk-mini"
                  onClick={() => setIssueTypeFilter(null)}
                >
                  {categoryLabelByType[issueFilters.type] || issueFilters.type} ×
                </button>
              ) : null}
              <select
                className="mk-mini"
                dir="rtl"
                value={issueFilters.severity || ""}
                onChange={(e) => setIssueSeverityFilter(e.target.value || null)}
              >
                <option value="">كل الخطورة</option>
                <option value="high">عالية</option>
                <option value="medium">متوسطة</option>
                <option value="low">منخفضة</option>
              </select>
              <input
                type="text"
                className="mk-mini"
                style={{ minWidth: 150 }}
                placeholder="بحث عن صفحة..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          )
        }
      >
        {isFailedState ? (
          <EmptyText>لا توجد نتائج بسبب فشل الفحص السابق. اضغط «إعادة الفحص» لبدء فحص جديد.</EmptyText>
        ) : neverRun ? (
          <EmptyText>لم يتم إجراء أي فحص للموقع بعد. اضغط «بدء فحص الموقع» لعرض النتائج هنا.</EmptyText>
        ) : issuesError ? (
          <ErrorNote
            message={issuesError?.response?.data?.message || "تعذر تحميل قائمة المشاكل."}
            onRetry={refetchIssues}
          />
        ) : issuesLoading && issues.length === 0 ? (
          <EmptyText>جارٍ التحميل...</EmptyText>
        ) : issues.length === 0 ? (
          <EmptyText>لا توجد مشاكل مطابقة.</EmptyText>
        ) : (
          <>
            <div className="tblwrap">
              <table className="mkt-tbl">
                <thead>
                  <tr>
                    <th>الصفحة</th>
                    <th>المشكلة</th>
                    <th>النوع</th>
                    <th>الخطورة</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {issues.map((row) => (
                    <tr
                      key={row.id}
                      className="cursor-pointer"
                      onClick={() => openWebsiteDetails(row)}
                    >
                      <td className="mkt-kw" style={{ direction: "ltr", textAlign: "center" }}>
                        {decodeUriText(row.page)}
                      </td>
                      <td>{decodeUriText(row.problem_ar || row.problem || row.problem_en)}</td>
                      <td>{categoryLabelByType[row.type] || row.type}</td>
                      <td>
                        <SeverityBadge severity={row.severity} />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="mk-mini"
                          onClick={(e) => {
                            e.stopPropagation();
                            openWebsiteDetails(row);
                          }}
                        >
                          عرض التفاصيل
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3">
              <AllOrdersPagination
                pagination={pagination}
                currentPage={page}
                onPageChange={setPage}
                perPage={perPage}
                onPerPageChange={(n) => {
                  setPerPage(n);
                  setPage(1);
                }}
                unitLabel="مشكلة"
              />
            </div>
          </>
        )}
      </SectionCard>
    </>
  );
}
