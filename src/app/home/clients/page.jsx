"use client";

import { useUnwrapPageProps } from "@/src/hooks/use-unwrap-page-props";
import ClientsWrapper from "@/components/clients/ClientsWrapper";

export default function ClientsPage(props) {
  useUnwrapPageProps(props?.params, props?.searchParams);

  return (
    <div className="flex flex-col gap-4 min-h-full" dir="rtl">
      <ClientsWrapper />
    </div>
  );
}
