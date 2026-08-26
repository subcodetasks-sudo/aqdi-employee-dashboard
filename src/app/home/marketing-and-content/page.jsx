"use client";

import { useUnwrapPageProps } from "@/src/hooks/use-unwrap-page-props";
import MarketingContentWrapper from "@/components/content/marketing/MarketingContentWrapper";

export default function MarketingAndContentPage(props) {
  useUnwrapPageProps(props?.params, props?.searchParams);

  return <MarketingContentWrapper />;
}
