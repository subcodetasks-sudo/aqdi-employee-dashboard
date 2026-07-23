"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { axiosInstance } from "@/src/utils/axios";
import {
  ADMIN_TENANT_ROLES_API,
  ADMIN_TENANT_ROLES_QUERY_KEY,
  buildTenantRolePayload,
} from "@/src/hooks/use-admin-tenant-roles";
import { TENANT_ROLES_QUERY_KEY } from "@/src/hooks/use-tenant-roles";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, X } from "lucide-react";
import { toast } from "sonner";

const EMPTY_FORM = {
  text_of_reason: "",
  service_definition: "",
  icon: "",
  input_icon: "",
  pop: false,
  hasUserInput: false,
  input_field_label: "",
  input_field_type: "text",
};

function roleToForm(role) {
  if (!role) return { ...EMPTY_FORM };
  const hasUserInput = Boolean(
    role.has_user_input ||
      role.input_field_label ||
      role.input_field_type
  );
  return {
    text_of_reason: role.text_of_reason || role.name || "",
    service_definition: role.service_definition || "",
    icon: role.icon || "",
    input_icon: role.input_icon || "",
    pop: Boolean(role.pop),
    hasUserInput,
    input_field_label: role.input_field_label || "",
    input_field_type: role.input_field_type || "text",
  };
}

export default function TenantRoleFormDialog({ role = null }) {
  const isEdit = Boolean(role?.id);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setForm(isEdit ? roleToForm(role) : { ...EMPTY_FORM });
    }
  }, [open, isEdit, role]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const payload = buildTenantRolePayload(form);
      if (isEdit) {
        return axiosInstance.post(
          `${ADMIN_TENANT_ROLES_API}/${role.id}`,
          payload
        );
      }
      return axiosInstance.post(ADMIN_TENANT_ROLES_API, payload);
    },
    onSuccess: (res) => {
      toast.success(
        res?.data?.message ||
          (isEdit ? "تم تحديث الصلاحية بنجاح" : "تم إضافة الصلاحية بنجاح")
      );
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: [ADMIN_TENANT_ROLES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [TENANT_ROLES_QUERY_KEY] });
    },
    onError: (error) => {
      const apiErrors = error?.response?.data?.errors;
      if (apiErrors && typeof apiErrors === "object") {
        const first = Object.values(apiErrors)[0];
        toast.error(Array.isArray(first) ? first[0] : String(first));
        return;
      }
      toast.error(
        error?.response?.data?.message ||
          (isEdit ? "حدث خطأ أثناء التحديث" : "حدث خطأ أثناء الإضافة")
      );
    },
  });

  const handleSubmit = () => {
    if (!form.text_of_reason.trim()) {
      toast.error("عنوان الصلاحية مطلوب");
      return;
    }
    if (form.hasUserInput) {
      if (!form.input_field_label.trim()) {
        toast.error("اسم حقل الإدخال مطلوب");
        return;
      }
      if (!form.input_field_type) {
        toast.error("نوع حقل الإدخال مطلوب");
        return;
      }
    }
    mutate();
  };

  return (
    <Dialog dir="rtl" open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button
            type="button"
            className="bg-brand-hover/15 text-brand-hover text-xs h-9 px-3 hover:bg-brand-hover/25"
          >
            <Pencil className="size-3.5" />
            تعديل
          </Button>
        ) : (
          <Button className="bg-brand-hover text-white h-12 rounded-full font-bold px-6 flex items-center gap-2 shadow-lg shadow-brand-main/20">
            <Plus className="size-4" />
            إضافة صلاحية
          </Button>
        )}
      </DialogTrigger>

      <DialogContent closeButton={false} className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between border-b pb-5">
            <h2 className="text-xl font-bold">
              {isEdit ? "تعديل صلاحية المستأجر" : "إضافة صلاحية مستأجر"}
            </h2>
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>
              <X className="size-4" />
            </Button>
          </div>

          <div className="space-y-5 text-right pt-2" dir="rtl">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                عنوان الصلاحية <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="مثال: غرامة يومية لتأخير الإخلاء"
                value={form.text_of_reason}
                onChange={(e) => setField("text_of_reason", e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">تعريف الخدمة</label>
              <Textarea
                placeholder="نص يظهر داخل المودال عند اختيار الصلاحية..."
                value={form.service_definition}
                onChange={(e) => setField("service_definition", e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="rounded-[16px] border border-[#EEEEEE] bg-[#FAFAFA] p-4 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold">فتح نافذة منبثقة؟</p>
                  <p className="text-[11px] text-[#A3A3A3]">
                    عند التفعيل يظهر مودال التعريف/الإدخال في التطبيق
                  </p>
                </div>
                <Switch
                  dir="ltr"
                  checked={form.pop}
                  onCheckedChange={(checked) => setField("pop", checked)}
                  className="data-[state=checked]:bg-brand-main"
                />
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-[#EEEEEE] pt-4">
                <div className="text-right">
                  <p className="text-sm font-bold">حقل من المستخدم؟</p>
                  <p className="text-[11px] text-[#A3A3A3]">
                    يطلب إدخال قيمة (نص أو رقم) داخل المودال
                  </p>
                </div>
                <Switch
                  dir="ltr"
                  checked={form.hasUserInput}
                  onCheckedChange={(checked) => setField("hasUserInput", checked)}
                  className="data-[state=checked]:bg-brand-main"
                />
              </div>
            </div>

            {form.hasUserInput ? (
              <div className="space-y-4 rounded-[16px] border border-brand-hover/20 bg-brand-hover/5 p-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    اسم حقل الإدخال <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="أدخل مبلغ الغرامة اليومية"
                    value={form.input_field_label}
                    onChange={(e) => setField("input_field_label", e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    نوع الحقل <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={form.input_field_type || "text"}
                    onValueChange={(value) => setField("input_field_type", value)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">نص (text)</SelectItem>
                      <SelectItem value="number">رقم (number)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : null}

            <Button
              type="button"
              disabled={isPending}
              onClick={handleSubmit}
              className="mx-auto block h-12 bg-brand-hover min-w-[160px]"
            >
              {isPending ? (
                <Loader2 className="animate-spin" />
              ) : isEdit ? (
                "حفظ التعديلات"
              ) : (
                "إضافة"
              )}
            </Button>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
