'use client';

import { Search, FileSpreadsheet } from 'lucide-react';

export default function ComingSoonPanel({
  searchPlaceholder = 'البحث...!',
  message = 'لا توجد بيانات حالياً — سيتم ربط هذا القسم قريبًا',
}) {
  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <div className="flex max-md:flex-wrap items-center gap-3 w-full">
        <div className="relative flex-1 min-w-[140px]">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-placeholder size-5 pointer-events-none" />
          <input
            type="text"
            disabled
            placeholder={searchPlaceholder}
            className="w-full h-[46px] bg-surface-input border border-surface-border rounded-full pr-12 pl-4 text-[14px] cursor-not-allowed opacity-70"
          />
        </div>
        <button
          type="button"
          disabled
          className="h-[46px] px-5 rounded-full border border-surface-border bg-white text-ink-subtle font-bold text-[14px] flex items-center gap-2 shrink-0 opacity-60 cursor-not-allowed"
        >
          <FileSpreadsheet className="size-4" />
          تصدير Excel
        </button>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 rounded-[24px] border border-dashed border-surface-border bg-surface-muted/40 py-20 text-center">
        <p className="text-sm font-medium text-ink-subtle max-w-md">{message}</p>
      </div>
    </div>
  );
}
