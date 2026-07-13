"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { axiosInstance } from "@/src/utils/axios";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function normalizeList(response) {
  const payload = response?.data ?? response;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
}

function getLabel(item, type) {
  const name =
    item?.name ||
    item?.full_name ||
    item?.name_ar ||
    [item?.first_name, item?.last_name].filter(Boolean).join(" ") ||
    "بدون اسم";
  const extra = item?.email || item?.phone || item?.mobile || "";
  return extra ? `${name} — ${extra}` : `${name} (#${item?.id})`;
}

export default function RecipientPicker({
  type = "user",
  value,
  onChange,
  placeholder = "اختر ...",
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const endpoint = type === "employee" ? "/admin/employees" : "/admin/users";

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["notification-recipients", type, debouncedSearch],
    queryFn: async () => {
      const params = { page: 1, per_page: 50 };
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await axiosInstance.get(endpoint, { params });
      return normalizeList(res.data);
    },
    enabled: open,
    staleTime: 30_000,
  });

  const items = data ?? [];
  const selected = items.find((item) => String(item.id) === String(value));
  const selectedLabel = selected
    ? getLabel(selected, type)
    : value
      ? `#${value}`
      : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-12 w-full justify-between font-normal"
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command shouldFilter={false} dir="rtl">
          <CommandInput
            placeholder={type === "employee" ? "بحث عن موظف..." : "بحث عن مستخدم..."}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {(isLoading || isFetching) && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-brand-hover" />
              </div>
            )}
            {!isLoading && !isFetching && (
              <>
                <CommandEmpty>لا توجد نتائج</CommandEmpty>
                <CommandGroup>
                  {items.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={String(item.id)}
                      onSelect={() => {
                        onChange(String(item.id));
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "me-2 h-4 w-4",
                          String(value) === String(item.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="truncate">{getLabel(item, type)}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
