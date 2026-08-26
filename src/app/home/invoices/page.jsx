"use client";

import { useUnwrapPageProps } from "@/src/hooks/use-unwrap-page-props";
import InvoicesWrapper from "@/components/Invoices/InvoicesWrapper";

export default function InvoicesPage(props) {
  useUnwrapPageProps(props?.params, props?.searchParams);

  return (
    <div className="flex flex-col gap-4 min-h-full" dir="rtl">
      <InvoicesWrapper />
    </div>
  );
}
