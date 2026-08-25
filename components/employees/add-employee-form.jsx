"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ImageUp, Loader2 } from "lucide-react";
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Zod schema matching requested backend keys
const employeeSchema = (isEdit) => z.object({
  firstName: z.string().min(2, "الإسم يجب أن يكون على الأقل حرفين"),
  lastName: z.string().min(2, "الاسم الأخير يجب أن يكون على الأقل حرفين"),
  password: isEdit 
    ? z.string().optional() 
    : z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  phone: z.string().min(10, "رقم الهاتف غير صحيح"),
  base_salary: z.string().min(1, "الراتب الأساسي مطلوب"),
  role_id: z.string().min(1, "الدور الوظيفي مطلوب"),
  is_active: z.string().optional().default("1"),
  image: isEdit 
    ? z.any().optional() 
    : z.any().refine((files) => files?.length > 0, "الرجاء اختيار صورة"),
});

export default function AddEmployeeForm({ isEdit = false, employee, onSuccess }) {
  const queryClient = useQueryClient();
  const nameParts = (employee?.name || "").trim().split(/\s+/);
  const employeeFirstName = nameParts[0] || "";
  const employeeLastName = nameParts.slice(1).join(" ") || "";

  // Get roles list dynamically for the dropdown selector
  const { data: rolesData } = useQuery({
    queryKey: ["roles-list"],
    queryFn: () => axiosInstance.get("/admin/roles").then(res => res?.data),
  });

  const roles = rolesData?.data?.items || rolesData?.items || [];

  const form = useForm({
    resolver: zodResolver(employeeSchema(isEdit)),
    defaultValues: {
      firstName: isEdit ? employeeFirstName : "",
      lastName: isEdit ? employeeLastName : "",
      password: "",
      email: isEdit ? (employee?.email || "") : "",
      phone: isEdit ? (employee?.phone || "") : "",
      base_salary: isEdit ? String(parseFloat(employee?.base_salary || 0)) : "",
      role_id: isEdit ? String(employee?.role_id || "") : "",
      is_active: isEdit ? (employee?.is_active ? "1" : "0") : "1",
      image: null,
    },
  });

  const [preview, setPreview] = useState(isEdit ? (employee?.profile_image || "/images/defaultUser.jpg") : null);

  // Watch image changes for preview
  const imageFile = form.watch("image");

  useEffect(() => {
    if (imageFile && imageFile.length > 0) {
      const file = imageFile[0];
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else if (!isEdit) {
      setPreview(null);
    }
  }, [imageFile, isEdit]);

  const { mutate: saveEmployee, isPending } = useMutation({
    mutationFn: (formDataPayload) => {
      const url = isEdit ? `/admin/employees/${employee?.id}` : "/admin/employees";
      return axiosInstance.post(url, formDataPayload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: (res) => {
      toast.success(res?.data?.message || (isEdit ? "تم تعديل بيانات الموظف بنجاح" : "تم إضافة الموظف بنجاح"));
      queryClient.invalidateQueries({ queryKey: ["allEmployees"] });
      queryClient.invalidateQueries({ queryKey: ["employee", String(employee?.id)] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء حفظ بيانات الموظف");
    }
  });

  const onSubmit = (data) => {
    const formDataPayload = new FormData();
    formDataPayload.append("name", `${data.firstName} ${data.lastName}`);
    formDataPayload.append("email", data.email);
    if (!isEdit || data.password) {
      formDataPayload.append("password", data.password);
    }
    formDataPayload.append("phone", data.phone);
    formDataPayload.append("base_salary", String(data.base_salary));
    formDataPayload.append("role_id", String(data.role_id));
    formDataPayload.append("is_active", String(data.is_active));

    if (data.image && data.image[0]) {
      formDataPayload.append("profile_image", data.image[0]);
    }

    saveEmployee(formDataPayload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Image Upload */}
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <div className="min-h-30 p-6 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200/50 transition-all">
                  <div className="flex items-center gap-2 flex-col ">
                    {preview ? (
                      <Image
                        width={100}
                        height={100}
                        src={preview}
                        alt="preview"
                        className="size-20 object-cover rounded-full border"
                      />
                    ) :
                      (
                        <div className="size-20 bg-white rounded-full flex items-center justify-center">
                          <ImageUp className="size-8 text-ink-placeholder" />
                        </div>
                      )
                    }

                    <span className="text-black text-sm font-bold">إضغط هنا لاختيــار الصور</span>
                    <span className="text-gray-500 text-xs">اسحب وادرج ملفاتك أو تصفح png - jpeg</span>
                  </div>
                </div>
              </FormLabel>
              <FormControl>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => field.onChange(e.target.files)}
                  className="border rounded p-2 w-full hidden"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Name Fields */}
        <div dir='rtl' className="grid grid-cols-2 gap-4 text-right">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الإسم الأول</FormLabel>
                <FormControl>
                  <Input className="h-12" placeholder="أكتب هنا ..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم العائلة / اللقب</FormLabel>
                <FormControl>
                  <Input className="h-12" placeholder="أكتب هنا ..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem dir='rtl' className="text-right">
              <FormLabel>كلمة المرور {isEdit && <span className="text-xs text-gray-400 font-normal">(اتركها فارغة إذا لم تكن تريد تغييرها)</span>}</FormLabel>
              <FormControl>
                <Input className="h-12" type="password" placeholder="أكتب هنا ..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email and Phone */}
        <div dir='rtl' className="grid grid-cols-2 gap-4 text-right">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>البريد الإلكتروني</FormLabel>
                <FormControl>
                  <Input className="h-12" placeholder="أكتب هنا ..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رقم الهاتف</FormLabel>
                <FormControl>
                  <Input className="h-12" placeholder="أكتب هنا ..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Basic Salary and Role dropdown */}
        <div dir='rtl' className="grid grid-cols-2 gap-4 text-right">
          <FormField
            control={form.control}
            name="base_salary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الراتب الأساسي</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" className="h-12" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الدور الوظيفي</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    dir='rtl'
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="اختر الدور الوظيفي للموظف" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={String(role.id)}>
                          {role.title_trans || role.title_ar || role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Active Status */}
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem dir='rtl' className="text-right">
              <FormLabel>حالة الحساب</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  dir='rtl'
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="اختر حالة الحساب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">نشط / مفعل</SelectItem>
                    <SelectItem value="0">غير نشط</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button size="lg" type="submit" disabled={isPending} className="block w-fit mx-auto bg-brand-hover text-white px-8">
          {isPending ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin size-4" />
              <span>جاري الحفظ...</span>
            </div>
          ) : (
            "حفظ البيانات"
          )}
        </Button>
      </form>
    </Form>
  );
}