"use client";

import { useUnwrapPageProps } from "@/src/hooks/use-unwrap-page-props";
import ClientDiscountWrapper from "@/components/clients/ClientDiscountWrapper";

export default function ClientDiscountPage(props) {
  useUnwrapPageProps(props?.params, props?.searchParams);

  return <ClientDiscountWrapper />;
}
