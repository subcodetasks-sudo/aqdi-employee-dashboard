"use client";

import { useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

export default function RealtimeOrderDetailsRedirect() {
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

  return null;
}
