"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Pencil } from "lucide-react";

const formatDate = (dateString) => {
  if (!dateString) return "---";
  try {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

const getStatusLabel = (status) => {
  if (status === "published") return "منشور";
  if (status === "draft") return "مسودة";
  return status || "---";
};

const getStatusClass = (status) => {
  if (status === "published") return "bg-[#E6FFE6] text-brand-accent";
  if (status === "draft") return "bg-[#FFF4E6] text-[#F59E0B]";
  return "bg-neutral-100 text-ink-placeholder";
};

export default function BlogDetails({ blog }) {
  const publishAt = blog?.publish_at || blog?.timePublish;
  const metaTitle = blog?.meta_title || blog?.metaTitle;
  const metaDescription = blog?.meta_description || blog?.metaDescription;
  const isActive = blog?.is_active === 1 || blog?.is_active === true || blog?.isActive === 1 || blog?.isActive === true;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-11 font-bold ${getStatusClass(blog?.status)}`}>
              {getStatusLabel(blog?.status)}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-11 font-bold ${
                isActive ? "bg-[#E6F0FF] text-[#3B82F6]" : "bg-neutral-100 text-ink-placeholder"
              }`}
            >
              {isActive ? "نشط" : "غير نشط"}
            </span>
          </div>
          <h3 className="text-[24px] font-black text-black">{blog?.title}</h3>
          {blog?.slug && (
            <p className="text-13 text-ink-placeholder" dir="ltr">
              {blog.slug}
            </p>
          )}
        </div>

        <Link href={`/home/settings/blogs/${blog?.id}/edit`}>
          <Button className="bg-brand-main hover:bg-brand-hover text-white h-11 px-5 rounded-full font-bold flex items-center gap-2">
            <Pencil className="size-4" />
            تعديل المقال
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-surface-border bg-neutral-50 p-4">
          <p className="text-xs text-ink-placeholder mb-1">تاريخ النشر</p>
          <p className="text-sm font-bold text-black">{formatDate(publishAt)}</p>
        </div>
        {metaTitle && (
          <div className="rounded-2xl border border-surface-border bg-neutral-50 p-4 md:col-span-2">
            <p className="text-xs text-ink-placeholder mb-1">عنوان SEO</p>
            <p className="text-sm font-medium text-black">{metaTitle}</p>
          </div>
        )}
      </div>

      {metaDescription && (
        <div className="rounded-2xl border border-surface-border bg-neutral-50 p-4">
          <p className="text-xs text-ink-placeholder mb-1">وصف SEO</p>
          <p className="text-sm text-ink-subtle">{metaDescription}</p>
        </div>
      )}

      {blog?.image && (
        <div className="relative w-full max-h-[420px] aspect-[16/9] rounded-20 overflow-hidden border border-surface-border">
          <Image src={blog.image} alt={blog.title || "blog image"} fill className="object-cover" />
        </div>
      )}

      <div className="rounded-20 border border-surface-border bg-white p-6">
        <p className="text-sm font-bold text-black mb-4">محتوى المقال</p>
        <div
          className="prose prose-sm max-w-none text-ink-subtle leading-relaxed [&_img]:max-w-full [&_img]:rounded-xl"
          dangerouslySetInnerHTML={{ __html: blog?.description || "" }}
        />
      </div>

      <div className="flex justify-start pt-2">
        <Link href="/home/settings/blogs">
          <Button variant="outline" className="h-11 px-5 rounded-full flex items-center gap-2">
            <ArrowRight className="size-4" />
            العودة للمدونة
          </Button>
        </Link>
      </div>
    </div>
  );
}
