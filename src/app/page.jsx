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
    const timer = setTimeout(() => {
      router.push(isAuthenticated ? "/home" : "/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router, isAuthenticated]);


  return (
    <div className="relative w-full h-screen overflow-hidden">
      <video autoPlay muted loop className="w-full h-screen object-cover">
        <source src="/images/aakdi.mp4" type="video/mp4" />
      </video>
    </div>
  );
}