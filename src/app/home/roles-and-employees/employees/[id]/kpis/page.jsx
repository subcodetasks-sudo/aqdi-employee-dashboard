"use client";

import { useUnwrapPageProps } from "@/src/hooks/use-unwrap-page-props";
import EmployeeKpisDetails from "@/components/roles-and-employees/EmployeeKpisDetails";

export default function EmployeeKpisPage(props) {
  useUnwrapPageProps(props?.params, props?.searchParams);

  return <EmployeeKpisDetails />;
}
