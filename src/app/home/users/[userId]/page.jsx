"use client";

import ClientDetailsWrapper from "@/components/clients/ClientDetailsWrapper";
import UserDetailsCard from "@/components/analysis/UsersAnalysis/user-details";
import UserContractsTable from "@/components/analysis/UsersAnalysis/user-contracts-table";
import Header from "@/components/home/Header";
import Loader from "@/components/home/loader";
import { axiosInstance } from "@/src/utils/axios";
import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";

function isClientFileRoute(userId, from) {
  if (typeof from === "string" && from.includes("/home/clients")) return true;
  return String(userId || "").startsWith("c-");
}

export default function UserDetailsPage() {
  const { userId } = useParams();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/home/reports?tab=users";

  if (isClientFileRoute(userId, from)) {
    return <ClientDetailsWrapper />;
  }

  return <LegacyUserDetailsPage userId={userId} from={from} />;
}

function LegacyUserDetailsPage({ userId, from }) {
  const backUrl = from.startsWith("/")
    ? from
    : `/home/reports?tab=users&segment=${from}`;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["user", String(userId)],
    queryFn: () =>
      axiosInstance.get(`/admin/users/${userId}`).then((res) => res?.data),
    enabled: !!userId,
  });

  const payload = data?.data ?? data;
  const user = payload?.user;
  const contracts = payload?.contracts ?? [];
  const userName = user?.full_name || user?.name || "تفاصيل المستخدم";

  if (isLoading) return <Loader />;

  if (isError || !user) {
    return (
      <div className="p-6 text-center text-[#FA5252] text-[15px]" dir="rtl">
        حدث خطأ أثناء تحميل بيانات المستخدم
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-6 min-h-screen" dir="rtl">
      <Header
        page="welcome"
        title={userName}
        isMain={false}
        first="الرئيــسية"
        firstURL="/"
        second="المستخدمين"
        secondURL={backUrl}
        third="تفاصيل المستخدم"
        thirdURL={`/home/users/${userId}?from=${encodeURIComponent(from)}`}
      />
      <UserDetailsCard user={user} backUrl={backUrl} />
      <UserContractsTable contracts={contracts} userId={user?.id ?? userId} />
    </div>
  );
}
