"use client";

import { useUnwrapPageProps } from "@/src/hooks/use-unwrap-page-props";
import RealtimeOrdersWrapper from "@/components/RealtimeOrders/RealtimeOrdersWrapper";

export default function RealtimeOrdersPage(props) {
  useUnwrapPageProps(props?.params, props?.searchParams);

  return (
    <div className="flex flex-col gap-4 min-h-full" dir="rtl">
      <RealtimeOrdersWrapper />
    </div>
  );
}
