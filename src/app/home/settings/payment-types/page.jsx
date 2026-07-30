"use client";

import Header from "@/components/home/Header";
import AddPaymentTypeDialog from "@/components/analysis/settings/payment-types/add-payment-type-dialog";
import EditPaymentTypeDialog from "@/components/analysis/settings/payment-types/edit-payment-type-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePaymentTypes } from "@/src/hooks/use-payment-types";
import { Building2, Pentagon } from "lucide-react";
import { useState } from "react";

function PaymentTypesGrid({ activeTab }) {
  const { items, isLoading } = usePaymentTypes(activeTab);

  if (isLoading) {
    return <p className="text-sm text-[#A3A3A3] py-8">جاري التحميل...</p>;
  }

  if (!items.length) {
    return <p className="text-sm text-[#A3A3A3] py-8">لا توجد طرق دفع</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-gray-200 rounded-[16px] border border-[#E4E4E4] p-4 transition-all"
        >
          <h3 className="text-sm font-bold text-[#616161]">طريقة الدفع</h3>
          <div className="mt-4 space-y-1">
            <p className="text-sm font-bold">{item.name_ar || item.name}</p>
            {item.name_en ? (
              <p className="text-xs text-[#737373]" dir="ltr">
                {item.name_en}
              </p>
            ) : null}
          </div>
          <div className="flex items-center justify-end gap-2 mt-4">
            <EditPaymentTypeDialog paymentType={item} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PaymentTypesPage() {
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
        third="طرق الدفع"
        thirdURL="/home/settings/payment-types"
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
          <AddPaymentTypeDialog activeTab={activeTab} />
        </div>

        <TabsContent value="housing">
          <PaymentTypesGrid activeTab="housing" />
        </TabsContent>
        <TabsContent value="commercial">
          <PaymentTypesGrid activeTab="commercial" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
