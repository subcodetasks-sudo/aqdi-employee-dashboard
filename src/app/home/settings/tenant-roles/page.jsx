"use client";

import { useEffect, useState } from "react";
import Header from "@/components/home/Header";
import Loader from "@/components/home/loader";
import { Input } from "@/components/ui/input";
import TenantRoleFormDialog from "@/components/analysis/settings/tenant-roles/tenant-role-form-dialog";
import DeleteTenantRoleDialog from "@/components/analysis/settings/tenant-roles/delete-tenant-role-dialog";
import { useAdminTenantRoles } from "@/src/hooks/use-admin-tenant-roles";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

const PER_PAGE = 20;
const TABLE_HEADERS = [
  "العنوان",
  "نافذة منبثقة",
  "حقل مستخدم",
  "الإجراءات",
];

export default function TenantRolesPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { items, pagination, isLoading } = useAdminTenantRoles({
    search,
    page: currentPage,
    perPage: PER_PAGE,
    sortBy: "id",
    sortOrder: "asc",
  });

  return (
    <div className="min-h-screen p-6 flex flex-col gap-6" dir="rtl">
      <Header
        page="welcome"
        title="الإعـدادات"
        isMain={false}
        first="الرئيــسية"
        firstURL="/"
        second="الإعـدادات"
        secondURL="/home/settings"
        third="صلاحيات المستأجر"
        thirdURL="/home/settings/tenant-roles"
      />

      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#F5F5F5] mt-2">
        <div className="flex flex-col gap-1.5 text-right">
          <h2 className="text-[22px] font-black text-black">صلاحيات المستأجر</h2>
          <p className="text-[13px] text-gray-500 font-medium">
            إدارة صلاحيات المستأجر الظاهرة في التطبيق والعقود
            {pagination?.total != null ? (
              <span className="mr-2 text-brand-main">({pagination.total})</span>
            ) : null}
          </p>
        </div>
        <TenantRoleFormDialog />
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#A3A3A3]" />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="بحث في العنوان / التعريف / اسم الحقل..."
          className="h-12 pr-10"
        />
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full overflow-x-auto bg-white rounded-[24px] border border-[#E4E4E4] shadow-sm">
          <table className="w-full border-collapse">
            <thead className="bg-[#FAFAFA]">
              <tr>
                {TABLE_HEADERS.map((header) => (
                  <th
                    key={header}
                    className="text-right p-[15px_20px] text-[#A3A3A3] text-[13px] font-medium border-b border-[#E4E4E4] whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((role) => (
                  <tr
                    key={role.id}
                    className="border-b border-[#F5F5F5] last:border-0 hover:bg-[#fafafa] transition-all"
                  >
                    <td className="p-[15px_20px] align-middle min-w-[220px]">
                      <p className="text-black text-[13px] font-bold leading-relaxed">
                        {role.text_of_reason || role.name || "—"}
                      </p>
                      {role.service_definition ? (
                        <p className="mt-1 text-[12px] text-[#737373] line-clamp-2 whitespace-pre-wrap">
                          {role.service_definition}
                        </p>
                      ) : null}
                    </td>
                    <td className="p-[15px_20px] align-middle">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          role.pop
                            ? "bg-[#E7F5FF] text-[#228BE6]"
                            : "bg-[#F5F5F5] text-[#737373]"
                        }`}
                      >
                        {role.pop ? "مودال" : "بدون مودال"}
                      </span>
                    </td>
                    <td className="p-[15px_20px] align-middle">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          role.has_user_input
                            ? "bg-[#E6FCF5] text-[#0C6055]"
                            : "bg-[#F5F5F5] text-[#737373]"
                        }`}
                      >
                        {role.has_user_input
                          ? `${role.input_field_type || "input"}`
                          : "لا"}
                      </span>
                      {role.has_user_input && role.input_field_label ? (
                        <p className="mt-1 text-[11px] text-[#A3A3A3]">
                          {role.input_field_label}
                        </p>
                      ) : null}
                    </td>
                    <td className="p-[15px_20px] align-middle">
                      <div className="flex items-center gap-2">
                        <TenantRoleFormDialog role={role} />
                        <DeleteTenantRoleDialog role={role} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={TABLE_HEADERS.length}
                    className="text-center p-10 text-[#A3A3A3] text-sm"
                  >
                    لا توجد صلاحيات حالياً. اضغط على &quot;إضافة صلاحية&quot; للبدء.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.last_page > 1 ? (
        <div className="flex items-center justify-center gap-2.5 mt-2" dir="rtl">
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="w-9 h-9 rounded-full border border-[#E4E4E4] flex items-center justify-center text-[#A3A3A3] hover:bg-brand-main hover:text-white transition-all disabled:opacity-50"
          >
            <ChevronRight className="size-4" />
          </button>

          {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
            .filter((page) => {
              if (pagination.last_page <= 7) return true;
              return (
                page === 1 ||
                page === pagination.last_page ||
                Math.abs(page - currentPage) <= 1
              );
            })
            .reduce((acc, page, idx, arr) => {
              if (idx > 0 && page - arr[idx - 1] > 1) acc.push("...");
              acc.push(page);
              return acc;
            }, [])
            .map((page, idx) =>
              page === "..." ? (
                <span key={`dots-${idx}`} className="text-[#A3A3A3] px-1">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-medium transition-all ${
                    currentPage === page
                      ? "bg-brand-main text-white shadow-lg shadow-brand-main/20"
                      : "border border-[#E4E4E4] text-[#A3A3A3] hover:bg-[#f5f5f5]"
                  }`}
                >
                  {page}
                </button>
              )
            )}

          <button
            type="button"
            onClick={() =>
              setCurrentPage((prev) => Math.min(pagination.last_page, prev + 1))
            }
            disabled={currentPage === pagination.last_page}
            className="w-9 h-9 rounded-full border border-[#E4E4E4] flex items-center justify-center text-[#A3A3A3] hover:bg-brand-main hover:text-white transition-all disabled:opacity-50"
          >
            <ChevronLeft className="size-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
