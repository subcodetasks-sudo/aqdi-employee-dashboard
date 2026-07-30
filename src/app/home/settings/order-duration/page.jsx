"use client";

import AddNewDurationDialog from "@/components/analysis/settings/order-duration/add-new-duration-dialog";
import EditDurationDialog from "@/components/analysis/settings/order-duration/edit-duration-dialog";
import ViewDurationDialog from "@/components/analysis/settings/order-duration/view-duration-dialog";
import Header from "@/components/home/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  formatContractPeriodPrice,
  getContractPeriodLabel,
  getContractTypeLabel,
  groupContractPeriodsByInstrumentType,
  normalizeContractPeriods,
} from "@/src/lib/contract-period-utils";
import { axiosInstance } from "@/src/utils/axios";
import { useQuery } from "@tanstack/react-query";
import { Building2, Pentagon } from "lucide-react";
import { useState } from "react";

function DurationCard({ item }) {
  const contractLabel = getContractTypeLabel(item?.contract_type);

  return (
    <div className="bg-gray-200 rounded-[16px] border border-[#E4E4E4] p-4 transition-all">
      <div className="flex items-start justify-end gap-2">
        <h3 className="text-sm font-bold">عقد {contractLabel}</h3>
      </div>
      <div className="mt-4 space-y-1">
        <p className="text-sm font-bold">مدة العقد: {getContractPeriodLabel(item)}</p>
        <p className="text-sm text-[#616161]">
          السعر: {formatContractPeriodPrice(item?.price) || "—"}
        </p>
      </div>
      <div className="flex items-center justify-end gap-2 mt-4">
        <ViewDurationDialog duration={item} />
        <EditDurationDialog duration={item} />
      </div>
    </div>
  );
}

function DurationSections({ activeTab }) {
  const { data: orderDurations, isLoading } = useQuery({
    queryKey: ["contract-periods", activeTab],
    queryFn: () => axiosInstance.get(`/admin/contract-periods?contract_type=${activeTab}`),
  });

  const items = normalizeContractPeriods(orderDurations?.data);
  const sections = groupContractPeriodsByInstrumentType(items);
  const contractLabel = getContractTypeLabel(activeTab);

  if (isLoading) {
    return <p className="text-sm text-[#A3A3A3] py-8">جاري التحميل...</p>;
  }

  if (!sections.length) {
    return <p className="text-sm text-[#A3A3A3] py-8">لا توجد مدد عقد</p>;
  }

  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <section key={section.id}>
          <h2 className="text-sm font-bold text-[#616161] mb-4">
            عقد {contractLabel} - تصنيف وثيقة الملكية - {section.name} :
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {section.items.map((item) => (
              <DurationCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default function OrderDurationPage() {
  const [activeTab, setActiveTab] = useState("housing");

  return (
    <div className="p-6">
      <Header
        page="welcome"
        title="الإعـدادات"
        isMain={false}
        first="الرئيــسية"
        firstURL="/"
        second="الإعـدادات"
        secondURL="/home/settings"
        third="مدة العقد"
        thirdURL="/home/settings/order-duration"
      />

      <Tabs dir="rtl" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-transparent gap-4">
            <TabsTrigger
              value="housing"
              className="data-[state=active]:bg-brand-hover data-[state=active]:text-white font-bold p-4 px-8 rounded-full gap-2 bg-gray-200"
            >
              <Pentagon className="w-4 h-4" />
              سكني
            </TabsTrigger>
            <TabsTrigger
              value="commercial"
              className="data-[state=active]:bg-brand-hover data-[state=active]:text-white font-bold p-4 px-8 rounded-full gap-2 bg-gray-200"
            >
              <Building2 className="w-4 h-4" />
              تجاري
            </TabsTrigger>
          </TabsList>
          <AddNewDurationDialog activeTab={activeTab} />
        </div>

        <TabsContent value="housing">
          <DurationSections activeTab="housing" />
        </TabsContent>
        <TabsContent value="commercial">
          <DurationSections activeTab="commercial" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
