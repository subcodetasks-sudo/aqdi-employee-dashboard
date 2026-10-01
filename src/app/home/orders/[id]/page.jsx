"use client";

import { useUnwrapPageProps } from "@/src/hooks/use-unwrap-page-props";
import RealtimeOrderDetailsWrapper from "@/components/realtime-orders/details/realtime-order-details-wrapper";

export default function OrderDetailsPage(props) {
  useUnwrapPageProps(props?.params, props?.searchParams);

  return <RealtimeOrderDetailsWrapper />;
}
