"use client";

import { useUnwrapPageProps } from "@/src/hooks/use-unwrap-page-props";
import CreateBlogForm from "@/components/analysis/settings/blogs/create-blog-form";
import { SettingsContentCard, SettingsListHeader } from "@/components/SystemSettings/shared";

export default function CreateBlogPage(props) {
  useUnwrapPageProps(props?.params, props?.searchParams);

  return (
    <div className="flex flex-col gap-5 min-h-full" dir="rtl">
      <SettingsListHeader
        title="إضافة مقال جديد"
        subtitle="أنشئ مقالاً جديداً وحدد وقت النشر أو احفظه كمسودة"
        backHref="/home/settings/blogs"
      />
      <SettingsContentCard>
        <CreateBlogForm />
      </SettingsContentCard>
    </div>
  );
}
