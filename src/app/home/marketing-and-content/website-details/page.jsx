"use client";

import { useUnwrapPageProps } from "@/src/hooks/use-unwrap-page-props";
import WebsiteDetailsWrapper from "@/components/content/marketing/WebsiteDetailsWrapper";

export default function WebsiteDetailsPage(props) {
  useUnwrapPageProps(props?.params, props?.searchParams);

  return <WebsiteDetailsWrapper />;
}
