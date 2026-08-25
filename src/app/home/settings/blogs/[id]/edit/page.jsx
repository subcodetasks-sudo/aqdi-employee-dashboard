"use client";

import BlogForm from "@/components/analysis/settings/blogs/blog-form";
import { SettingsContentCard, SettingsListHeader } from "@/components/SystemSettings/shared";
import { axiosInstance } from "@/src/utils/axios";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export default function EditBlogPage() {
  const params = useParams();
  const blogId = params?.id;

  const { data: responseData, isLoading, isError } = useQuery({
    queryKey: ["blog", blogId],
    queryFn: () => axiosInstance.get(`/admin/blogs/${blogId}`).then((res) => res?.data),
    enabled: Boolean(blogId),
  });

  const blog = responseData?.data;

  return (
    <div className="flex flex-col gap-5 min-h-full" dir="rtl">
      <SettingsListHeader
        title="تعديل المقال"
        subtitle="تحديث بيانات المقال وخيارات النشر"
        backHref="/home/settings/blogs"
      />

      {isLoading ? (
        <SettingsContentCard>
          <p className="text-center text-gray-400 py-10">جاري التحميل...</p>
        </SettingsContentCard>
      ) : isError || !blog ? (
        <SettingsContentCard>
          <p className="text-center text-gray-400 py-10">تعذر تحميل المقال.</p>
        </SettingsContentCard>
      ) : (
        <SettingsContentCard>
          <BlogForm blogId={blogId} blog={blog} />
        </SettingsContentCard>
      )}
    </div>
  );
}
