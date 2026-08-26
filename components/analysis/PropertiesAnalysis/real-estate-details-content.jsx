"use client";

import { Copy, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import waIcon from "@/public/images/waIcon.svg";

const display = (value) => {
  if (value === null || value === undefined || value === "") return "---";
  return String(value);
};

const copy = (value) => {
  if (!value) return;
  navigator.clipboard.writeText(String(value));
  toast.success("تم النسخ بنجاح");
};

const getInstrumentTypeLabel = (type) => {
  if (type === "electronic") return "صك إلكتروني";
  if (type === "paper" || type === "handwritten") return "صك ورقي";
  return display(type);
};

const getContractTypeLabel = (type) => {
  if (type === "housing") return "سكني";
  if (type === "commercial") return "تجاري";
  return display(type);
};

const DetailCard = ({ label, value, copyable = false, borderColor = "border-gray-200" }) => (
  <div className={`bg-white p-4 rounded-2xl shadow-sm border-r-4 ${borderColor}`}>
    <span className="text-gray-400 text-xs font-medium block mb-1">{label}</span>
    <p className="flex items-center gap-2 text-gray-800 font-bold text-sm">
      {copyable && value && value !== "---" && (
        <button type="button" onClick={() => copy(value)} className="text-gray-400 hover:text-brand-main">
          <Copy size={14} />
        </button>
      )}
      <span>{display(value)}</span>
    </p>
  </div>
);

const Section = ({ title, children }) => (
  <section>
    <div className="flex items-center gap-2 mb-4 px-2">
      <FileText className="text-green-600 w-5 h-5" />
      <h3 className="text-gray-800 font-bold text-lg">{title}</h3>
    </div>
    <div className="bg-gray-100/50 p-6 rounded-[28px] border border-gray-100">{children}</div>
  </section>
);

const ImagePreview = ({ label, src }) => {
  if (!src) return null;
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-gray-400 font-medium">{label}</span>
      <div className="relative w-full max-w-[280px] h-[180px] rounded-2xl overflow-hidden border border-gray-200 bg-white">
        <Image src={src} alt={label} fill className="object-contain p-2" unoptimized />
      </div>
    </div>
  );
};

export default function RealEstateDetailsContent({ data }) {
  const images = [
    { label: "صورة الصك الورقي", src: data?.old_handwritten_photo },
    { label: "صورة الصك الإلكتروني", src: data?.photo_of_the_electronic },
    { label: "صورة الحجة القوية", src: data?.strong_argument_photo },
  ].filter((item) => item.src);

  return (
    <div dir="rtl" className="flex flex-col gap-8">
      <Section title="بيانات المالك">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DetailCard label="اسم المالك" value={data?.name_owner} copyable borderColor="border-green-500" />
          <DetailCard label="رقم الهوية" value={data?.national_num} copyable borderColor="border-blue-500" />
          <DetailCard label="تاريخ الميلاد (ميلادي)" value={data?.DOB} borderColor="border-purple-500" />
          <DetailCard label="تاريخ الميلاد (هجري)" value={data?.dob_hijri} borderColor="border-orange-500" />
          <DetailCard label="رقم الجوال" value={data?.mobile} copyable borderColor="border-lime-500" />
          <DetailCard label="الآيبان" value={data?.iban_bank} copyable borderColor="border-gray-400" />
        </div>
        {data?.mobile && (
          <div className="mt-4 flex items-center gap-2">
            <Link href={`https://wa.me/${data.mobile}`} target="_blank" className="hover:scale-110 transition-all">
              <Image src={waIcon} alt="WhatsApp" width={22} height={22} />
            </Link>
            <span className="text-sm text-gray-500">تواصل عبر واتساب</span>
          </div>
        )}
      </Section>

      <Section title="بيانات الصك">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <DetailCard label="نوع الوثيقة" value={getInstrumentTypeLabel(data?.instrument_type)} borderColor="border-pink-500" />
          <DetailCard label="رقم الصك" value={data?.instrument_number} copyable borderColor="border-blue-600" />
          <DetailCard label="تاريخ الصك" value={data?.instrument_history} borderColor="border-yellow-400" />
          <DetailCard label="رقم السجل العقاري" value={data?.real_estate_registry_number} copyable borderColor="border-indigo-500" />
          <DetailCard label="تاريخ أول تسجيل" value={data?.date_first_registration} borderColor="border-teal-500" />
        </div>
        {images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {images.map((img) => (
              <ImagePreview key={img.label} {...img} />
            ))}
          </div>
        )}
      </Section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* <Section title="تفاصيل العقار">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailCard label="اسم العقار" value={data?.name_real_estate || data?.name_owner} borderColor="border-green-600" />
            <DetailCard label="نوع العقار" value={data?.property_type_name} borderColor="border-lime-500" />
            <DetailCard label="استخدام العقار" value={data?.property_usages_name} borderColor="border-blue-600" />
            <DetailCard label="نوع العقد" value={getContractTypeLabel(data?.contract_type)} borderColor="border-purple-600" />
            <DetailCard label="عدد الوحدات المضافة" value={data?.Count_Units} borderColor="border-orange-500" />
            <DetailCard label="إجمالي عدد الوحدات" value={data?.number_of_units_in_realestate} borderColor="border-sky-400" />
            <DetailCard label="عدد الطوابق" value={data?.number_of_floors} borderColor="border-gray-300" />
            <DetailCard label="نوع آخر" value={data?.type_real_estate_other} borderColor="border-gray-400" />
          </div>
        </Section> */}

        <Section title="العنوان الوطني">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailCard label="المنطقة" value={data?.property_place_name || data?.property_place_id} borderColor="border-pink-500" />
            <DetailCard label="المدينة" value={data?.property_city_name || data?.property_city_id} borderColor="border-blue-500" />
            <DetailCard label="الحي" value={data?.neighborhood} borderColor="border-purple-500" />
            <DetailCard label="الشارع" value={data?.street} borderColor="border-orange-500" />
            <DetailCard label="رقم المبنى" value={data?.building_number} borderColor="border-blue-400" />
            <DetailCard label="رقم إضافي" value={data?.extra_figure} borderColor="border-green-500" />
            <DetailCard label="الرمز البريدي" value={data?.postal_code} borderColor="border-gray-800" />
          </div>
        </Section>
      </div>
    </div>
  );
}
