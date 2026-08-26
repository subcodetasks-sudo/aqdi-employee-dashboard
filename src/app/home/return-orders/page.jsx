"use client";

import { useUnwrapPageProps } from "@/src/hooks/use-unwrap-page-props";
import ReturnOrdersWrapper from "@/components/Orders/ReturnOrdersWrapper";

export default function Page(props) {
  useUnwrapPageProps(props?.params, props?.searchParams);

  return (
    <div className="flex flex-col gap-4 min-h-full" dir="rtl">
      <ReturnOrdersWrapper />
    </div>
  );
}

