"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Loader from "@/components/home/loader";

/**
 * Legacy `/home/content` — folded into marketing إدارة المحتوى.
 * Maps old `?tab=home|about|images` → `?tab=content&view=...`.
 */
export default function ContentPageRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const legacyTab = searchParams.get("tab") || "home";
    const view = ["home", "about", "images"].includes(legacyTab)
      ? legacyTab
      : "home";
    router.replace(
      `/home/marketing-and-content?tab=content&view=${encodeURIComponent(view)}`
    );
  }, [router, searchParams]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader />
    </div>
  );
}
