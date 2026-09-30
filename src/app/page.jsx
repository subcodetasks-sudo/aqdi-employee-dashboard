"use client"

import { useUnwrapPageProps } from "@/src/hooks/use-unwrap-page-props";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUserStore } from "@/src/stores/user-store";

export default function Page(props) {
  useUnwrapPageProps(props?.params, props?.searchParams);

  const router = useRouter();
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  useEffect(() => {
    router.replace(isAuthenticated ? "/home" : "/login");
  }, [router, isAuthenticated]);


  return null;
}