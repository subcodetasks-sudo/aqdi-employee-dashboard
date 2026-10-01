"use client";

import { useUnwrapPageProps } from "@/src/hooks/use-unwrap-page-props";
import ReportsWrapper from "@/components/reports/reports-wrapper";

export default function ReportsPage(props) {
  useUnwrapPageProps(props?.params, props?.searchParams);

  return <ReportsWrapper />;
}
