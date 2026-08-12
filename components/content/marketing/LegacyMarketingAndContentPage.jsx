"use client";

import { useMemo, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import SubPageHeader from "@/components/home/SubPageHeader";
import ComingSoonPanel from "@/components/home/ComingSoonPanel";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import HomeContentPage from "@/components/content/home/HomeContentPage";
import AboutContentPage from "@/components/content/about/AboutContentPage";

const TOP_TABS = [
  { value: "content", label: "المحتوى" },
  { value: "seo", label: "السيو" },
];

const CONTENT_PAGES = [
  { value: "home", label: "الصفحة الرئيسية", Component: HomeContentPage },
  { value: "about", label: "صفحة من نحن", Component: AboutContentPage },
];

export default function LegacyMarketingAndContentPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [contentPage, setContentPage] = useState(CONTENT_PAGES[0].value);

  const requestedTab = searchParams.get("tab");
  const activeTab = TOP_TABS.some((tab) => tab.value === requestedTab)
    ? requestedTab
    : TOP_TABS[0].value;

  const setActiveTab = (value) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const ActiveContentPage = useMemo(
    () => CONTENT_PAGES.find((page) => page.value === contentPage)?.Component ?? HomeContentPage,
    [contentPage]
  );

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen" dir="rtl">
      <SubPageHeader title="التسويق والمحتوى" isMain={false} first="الرئيــسية" firstURL="/" second="التسويق والمحتوى" secondURL="/home/marketing-and-content" />

      <Tabs dir="rtl" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
          {TOP_TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="h-11 shrink-0 rounded-full bg-[#F3F3F3] px-5 text-sm font-bold text-[#616161] transition-all data-[state=active]:bg-brand-hover data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="content" className="mt-0">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-2">
              {CONTENT_PAGES.map((page) => (
                <button
                  key={page.value}
                  type="button"
                  onClick={() => setContentPage(page.value)}
                  className={`h-9 px-4 rounded-full text-[13px] font-bold transition-all ${
                    contentPage === page.value
                      ? "bg-brand-main text-white"
                      : "bg-white text-ink-body border border-surface-border hover:bg-surface-muted"
                  }`}
                >
                  {page.label}
                </button>
              ))}
            </div>
            <ActiveContentPage />
          </div>
        </TabsContent>

        <TabsContent value="seo" className="mt-0">
          <ComingSoonPanel
            searchPlaceholder="البحث في إعدادات السيو...!"
            message="لا توجد بيانات حالياً — سيتم ربط إعدادات السيو بالـ API قريبًا"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
