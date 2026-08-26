"use client";

import { useUnwrapPageProps } from "@/src/hooks/use-unwrap-page-props";
import AllOrdersWrapper from "@/components/Orders/AllOrdersWrapper";

export default function OrdersPage(props) {
  useUnwrapPageProps(props?.params, props?.searchParams);

  return (
    <div className="flex flex-col gap-4 min-h-full" dir="rtl">
      <AllOrdersWrapper />
    </div>
  );
}
