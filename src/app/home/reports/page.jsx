"use client";

import { useUnwrapPageProps } from "@/src/hooks/use-unwrap-page-props";
import ReportsWrapper from "@/components/Reports/ReportsWrapper";

export default function ReportsPage(props) {
  useUnwrapPageProps(props?.params, props?.searchParams);

  return <ReportsWrapper />;
}
