"use client";

import { useUnwrapPageProps } from "@/src/hooks/use-unwrap-page-props";
import RolesAndEmployeesWrapper from "@/components/roles-and-employees/roles-and-employees-wrapper";

export default function RolesAndEmployeesPage(props) {
  useUnwrapPageProps(props?.params, props?.searchParams);

  return <RolesAndEmployeesWrapper />;
}
