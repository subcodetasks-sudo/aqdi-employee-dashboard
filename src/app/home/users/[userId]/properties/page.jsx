"use client";

import { useUnwrapPageProps } from "@/src/hooks/use-unwrap-page-props";
import ClientPropertiesWrapper from "@/components/clients/ClientPropertiesWrapper";

export default function ClientPropertiesPage(props) {
  useUnwrapPageProps(props?.params, props?.searchParams);

  return <ClientPropertiesWrapper />;
}
