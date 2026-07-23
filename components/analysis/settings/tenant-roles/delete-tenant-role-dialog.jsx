"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { axiosInstance } from "@/src/utils/axios";
import {
  ADMIN_TENANT_ROLES_API,
  ADMIN_TENANT_ROLES_QUERY_KEY,
} from "@/src/hooks/use-admin-tenant-roles";
import { TENANT_ROLES_QUERY_KEY } from "@/src/hooks/use-tenant-roles";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";

export default function DeleteTenantRoleDialog({ role }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      axiosInstance.post(`${ADMIN_TENANT_ROLES_API}/${role.id}/delete`),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم حذف الصلاحية بنجاح");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: [ADMIN_TENANT_ROLES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [TENANT_ROLES_QUERY_KEY] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "حدث خطأ أثناء حذف الصلاحية"
      );
    },
  });

  return (
    <Dialog dir="rtl" open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          className="bg-red-500/15 text-red-500 text-xs h-9 px-3 hover:bg-red-500/25"
        >
          <Trash2 className="size-3.5" />
          حذف
        </Button>
      </DialogTrigger>
      <DialogContent closeButton={false} className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-lg font-bold">حذف الصلاحية</h2>
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>
              <X className="size-4" />
            </Button>
          </div>
          <div className="space-y-4 pt-2 text-right" dir="rtl">
            <p className="text-sm text-[#4D4D4D] leading-relaxed">
              هل أنت متأكد من حذف صلاحية{" "}
              <span className="font-bold text-black">
                {role?.text_of_reason || role?.name || `#${role?.id}`}
              </span>
              ؟
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                إلغاء
              </Button>
              <Button
                type="button"
                disabled={isPending}
                onClick={() => mutate()}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                {isPending ? <Loader2 className="animate-spin" /> : "تأكيد الحذف"}
              </Button>
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
