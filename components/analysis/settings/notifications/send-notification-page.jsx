"use client";

import { useState } from "react";
import Header from "@/components/home/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import {
  NOTIFICATION_TARGETS,
  useSendNotification,
} from "@/src/hooks/use-send-notification";
import RecipientPicker from "./recipient-picker";

const PAGE_TITLE = "الإشعارات";
const PAGE_PATH = "/home/settings/notifications";
const TARGET_OPTIONS = Object.values(NOTIFICATION_TARGETS);

const INITIAL_FORM = {
  title: "",
  body: "",
  userId: "",
  employeeId: "",
};

export default function SendNotificationPage() {
  const [target, setTarget] = useState("all-users");
  const [form, setForm] = useState(INITIAL_FORM);

  const config = NOTIFICATION_TARGETS[target];
  const needsUser = config?.needsUser;
  const needsEmployee = config?.needsEmployee;

  const mutation = useSendNotification({
    onSuccess: () => setForm(INITIAL_FORM),
  });

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleTargetChange = (value) => {
    setTarget(value);
    setForm((prev) => ({
      ...prev,
      userId: "",
      employeeId: "",
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.body.trim()) {
      toast.error("يرجى إدخال العنوان ونص الرسالة");
      return;
    }
    if (needsUser && !form.userId) {
      toast.error("يرجى اختيار المستخدم");
      return;
    }
    if (needsEmployee && !form.employeeId) {
      toast.error("يرجى اختيار الموظف");
      return;
    }

    mutation.mutate({
      target,
      form: {
        title: form.title,
        body: form.body,
        userId: form.userId,
        employeeId: form.employeeId,
      },
    });
  };

  return (
    <div className="min-h-screen p-6" dir="rtl">
      <Header
        page="welcome"
        title="الإعـدادات"
        isMain={false}
        first="الرئيــسية"
        firstURL="/"
        second="الإعـدادات"
        secondURL="/home/settings"
        third={PAGE_TITLE}
        thirdURL={PAGE_PATH}
      />

      <div className="mt-6 w-full">
        <h2 className="text-xl font-bold mb-4">{PAGE_TITLE}</h2>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-[20px] border border-[#E4E4E4] p-6 space-y-5 w-full"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium">
              نوع الإرسال <span className="text-red-500">*</span>
            </label>
            <Select dir="rtl" value={target} onValueChange={handleTargetChange}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="اختر نوع الإرسال" />
              </SelectTrigger>
              <SelectContent>
                {TARGET_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {needsUser && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                المستخدم <span className="text-red-500">*</span>
              </label>
              <RecipientPicker
                type="user"
                value={form.userId}
                onChange={(value) => updateField("userId", value)}
                placeholder="اختر المستخدم..."
              />
            </div>
          )}

          {needsEmployee && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                الموظف <span className="text-red-500">*</span>
              </label>
              <RecipientPicker
                type="employee"
                value={form.employeeId}
                onChange={(value) => updateField("employeeId", value)}
                placeholder="اختر الموظف..."
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">
              العنوان <span className="text-red-500">*</span>
            </label>
            <Input
              className="h-12"
              placeholder="عنوان الإشعار"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              نص الرسالة <span className="text-red-500">*</span>
            </label>
            <Textarea
              className="min-h-[120px]"
              placeholder="اكتب محتوى الإشعار هنا..."
              value={form.body}
              onChange={(e) => updateField("body", e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={mutation.isPending}
            className="h-12 bg-brand-hover text-white min-w-[160px]"
          >
            {mutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                إرسال الإشعار
                <Send className="h-4 w-4 ms-1" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
