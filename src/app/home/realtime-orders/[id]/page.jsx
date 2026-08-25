"use client";

import { useUnwrapPageProps } from "@/src/hooks/use-unwrap-page-props";
import { useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Loader from "@/components/home/loader";

export default function RealtimeOrderDetailsRedirect(props) {
  useUnwrapPageProps(props?.params, props?.searchParams);

  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!id) return;
    const params = new URLSearchParams(searchParams.toString());
    if (!params.get("from")) params.set("from", "/home/realtime-orders");
    const qs = params.toString();
    router.replace(`/home/orders/${id}${qs ? `?${qs}` : ""}`);
  }, [id, router, searchParams]);

  return <Loader />;
}
