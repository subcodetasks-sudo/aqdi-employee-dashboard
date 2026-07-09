"use client";

import AppSectionForm from "@/components/content/home/app-section-form";
import ContactSectionForm from "@/components/content/home/contact-section-form";
import FeaturesSectionForm from "@/components/content/home/features-section-form";
import HeroContentForm from "@/components/content/home/hero-content-form";
import OfficialAuthoritiesForm from "@/components/content/home/official-authorities-form";
import PricingSectionForm from "@/components/content/home/pricing-section-form";
import Header from "@/components/home/Header";
import Loader from "@/components/home/loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Grid2x2,
  LayoutTemplate,
  MessageCircleMore,
  Smartphone,
  Sparkles,
  Tags,
} from "lucide-react";
import { extractContentSections, CONTENT_PAGE_ENDPOINTS } from "@/src/lib/content-admin";
import { axiosInstance } from "@/src/utils/axios";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const HOME_CONTENT_TABS = [
  {
    value: "hero",
    label: "القسم الرئيسي",
    icon: LayoutTemplate,
    title: "قسم الهيدر الرئيسي",
    description: "إدارة العنوان الرئيسي، الوصف المختصر، وأزرار الدعوة لاتخاذ إجراء في أعلى الصفحة.",
  },
  {
    value: "official-authorities",
    label: "الجهات الرسمية",
    icon: Grid2x2,
    title: "قسم الجهات الرسمية",
    description: "إدارة عنوان القسم العام ومحتوى البطاقات الثابتة للجهات الرسمية.",
  },
  {
    value: "features",
    label: "المميزات",
    icon: Sparkles,
    title: "قسم المميزات",
    description: "إدارة عنوان القسم العام ومحتوى بطاقات المميزات الثابتة.",
  },
  {
    value: "pricing",
    label: "الأسعار",
    icon: Tags,
    title: "قسم الأسعار",
    description: "إدارة بيانات القسم العامة والبطاقات الثابتة للأسعار.",
  },
  {
    value: "contact",
    label: "التواصل",
    icon: MessageCircleMore,
    title: "قسم التواصل",
    description: "إدارة محتوى قسم التواصل وصورة القسم وزر الواتساب.",
  },
  {
    value: "app",
    label: "التطبيق",
    icon: Smartphone,
    title: "قسم التطبيق",
    description: "إدارة نصوص قسم التطبيق وصورته الرئيسية.",
  },
];

export default function ContentHomePage() {
  const [activeTab, setActiveTab] = useState(HOME_CONTENT_TABS[0].value);
  const { data: responseData, isLoading, isError } = useQuery({
    queryKey: ["content-page", "home"],
    queryFn: () =>
      axiosInstance.get(CONTENT_PAGE_ENDPOINTS.home).then((res) => res?.data),
  });
  const sections = extractContentSections(responseData);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="flex min-h-screen flex-col gap-6 p-6" dir="rtl">
      <Header
        page="welcome"
        title="إدارة محتوى الصفحة الرئيسية"
        isMain={false}
        first="الرئيــسية"
        firstURL="/"
        second="محتوى الصفحة الرئيسية"
        secondURL="/home/content/home"
      />

      <div>
        <Tabs
          dir="rtl"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-6 h-auto flex-wrap justify-start gap-3 bg-transparent p-0">
            {HOME_CONTENT_TABS.map((tab) => {
              const Icon = tab.icon;

              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="h-12 rounded-full bg-[#F3F3F3] px-5 text-sm font-bold text-[#616161] transition-all data-[state=active]:bg-brand-hover data-[state=active]:text-white data-[state=active]:shadow-none"
                >
                  <Icon className="ml-2 h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {HOME_CONTENT_TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-0">
              {tab.value === "hero" ? (
                <HeroContentForm
                  initialData={sections.hero}
                  saveEndpoint={CONTENT_PAGE_ENDPOINTS.home}
                  queryKey={["content-page", "home"]}
                  sectionKey="hero"
                />
              ) : tab.value === "official-authorities" ? (
                <OfficialAuthoritiesForm
                  initialData={sections.official_authorities}
                  saveEndpoint={CONTENT_PAGE_ENDPOINTS.home}
                  queryKey={["content-page", "home"]}
                  sectionKey="official_authorities"
                />
              ) : tab.value === "features" ? (
                <FeaturesSectionForm
                  initialData={sections.features}
                  saveEndpoint={CONTENT_PAGE_ENDPOINTS.home}
                  queryKey={["content-page", "home"]}
                  sectionKey="features"
                />
              ) : tab.value === "pricing" ? (
                <PricingSectionForm
                  initialData={sections.pricing}
                  saveEndpoint={CONTENT_PAGE_ENDPOINTS.home}
                  queryKey={["content-page", "home"]}
                  sectionKey="pricing"
                />
              ) : tab.value === "contact" ? (
                <ContactSectionForm
                  initialData={sections.contact}
                  saveEndpoint={CONTENT_PAGE_ENDPOINTS.home}
                  queryKey={["content-page", "home"]}
                  sectionKey="contact"
                />
              ) : tab.value === "app" ? (
                <AppSectionForm
                  initialData={sections.app}
                  saveEndpoint={CONTENT_PAGE_ENDPOINTS.home}
                  queryKey={["content-page", "home"]}
                  sectionKey="app"
                />
              ) : (
                <div className="rounded-[24px] border border-[#EEEEEE] bg-[#FCFCFC] p-6">
                  <div className="mb-4 flex items-start justify-between gap-4 max-md:flex-col">
                    <div>
                      <h2 className="text-lg font-bold text-black">{tab.title}</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-7 text-[#707070]">
                        {tab.description}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-brand-hover border border-[#E8E8E8]">
                      {tab.label}
                    </span>
                  </div>

                  {isError ? (
                    <div className="rounded-[20px] border border-dashed border-[#D9D9D9] bg-white p-5">
                      <p className="text-sm leading-7 text-[#7A7A7A]">تعذر تحميل محتوى الصفحة.</p>
                    </div>
                  ) : null}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}