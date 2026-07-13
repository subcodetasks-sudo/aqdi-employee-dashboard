"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import PaymentLinkDialog from "@/components/Orders/shared/payment-link-dialog";
import {
  CONTRACT_PAID_API,
  CONTRACT_PAID_QUERY_KEY,
  extractPaymentFromResponse,
} from "@/components/Orders/contract-paid/contract-paid-utils";
import {
  getContractPeriodLabel,
  normalizeContractPeriods,
} from "@/src/lib/contract-period-utils";
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link2, Loader2, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const fieldClassName =
  "h-12 rounded-full border-[#E5E7EB] bg-white px-5 shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-brand-main";

export default function CreateContractPaidDialog() {
  const [open, setOpen] = useState(false);
  const [customerMobile, setCustomerMobile] = useState("");
  const [contractType, setContractType] = useState("");
  const [contractPeriodId, setContractPeriodId] = useState("");
  const [draftContractNumber, setDraftContractNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentLink, setPaymentLink] = useState({ paymentUrl: "", cartAmount: null });
  const queryClient = useQueryClient();

  const { data: contractPeriods = [], isLoading: periodsLoading } = useQuery({
    queryKey: ["contract-periods", contractType, "contract-paid"],
    queryFn: () =>
      axiosInstance
        .get("/admin/contract-periods", { params: { contract_type: contractType } })
        .then((res) => normalizeContractPeriods(res.data)),
    enabled: Boolean(contractType),
  });

  useEffect(() => {
    setContractPeriodId("");
  }, [contractType]);

  const resetForm = () => {
    setCustomerMobile("");
    setContractType("");
    setContractPeriodId("");
    setDraftContractNumber("");
    setAmount("");
    setNotes("");
  };

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      axiosInstance.post(CONTRACT_PAID_API, {
        customer_mobile: customerMobile.trim(),
        contract_type: contractType,
        contract_period_id: Number(contractPeriodId),
        draft_contract_number: draftContractNumber.trim(),
        amount: Number(amount),
        notes: notes.trim() || undefined,
      }),
    onSuccess: (res) => {
      const { paymentUrl, cartAmount } = extractPaymentFromResponse(res.data);

      if (!paymentUrl) {
        toast.error(res?.data?.message || "لم يتم إرجاع رابط الدفع");
        return;
      }

      toast.success(res?.data?.message || "تم إنشاء العقد ورابط الدفع بنجاح");
      setOpen(false);
      resetForm();
      setPaymentLink({ paymentUrl, cartAmount });
      setPaymentDialogOpen(true);
      queryClient.invalidateQueries({ queryKey: [CONTRACT_PAID_QUERY_KEY] });
    },
    onError: (error) => {
      const data = error?.response?.data;
      toast.error(
        data?.gateway_error || data?.message || "حدث خطأ أثناء إنشاء العقد"
      );
    },
  });

  const handleSubmit = () => {
    if (!customerMobile.trim()) {
      toast.error("رقم جوال العميل مطلوب");
      return;
    }

    if (!contractType) {
      toast.error("يرجى اختيار نوع العقد");
      return;
    }

    if (!contractPeriodId) {
      toast.error("يرجى اختيار مدة العقد");
      return;
    }

    if (!draftContractNumber.trim()) {
      toast.error("رقم مسودة العقد مطلوب");
      return;
    }

    const parsedAmount = Number(amount);
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("يرجى إدخال مبلغ صحيح");
      return;
    }

    mutate();
  };

  const isSubmitDisabled =
    isPending ||
    !customerMobile.trim() ||
    !contractType ||
    !contractPeriodId ||
    !draftContractNumber.trim() ||
    !amount;

  return (
    <>
      <Dialog
        dir="rtl"
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) resetForm();
        }}
      >
        <DialogTrigger asChild>
          <Button className="bg-brand-hover hover:bg-brand-hover/90 text-white h-12 rounded-full font-bold px-6 gap-2 whitespace-nowrap">
            إنشاء عقد مدفوع
            <Plus className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent closeButton={false} className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-between border-b pb-6">
              <h2 className="text-xl font-bold">إنشاء عقد مدفوع</h2>
              <Button onClick={() => setOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4 text-right">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  رقم جوال العميل <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="05xxxxxxxx"
                  value={customerMobile}
                  onChange={(e) => setCustomerMobile(e.target.value)}
                  className={fieldClassName}
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  نوع العقد <span className="text-red-500">*</span>
                </label>
                <Select dir="rtl" value={contractType} onValueChange={setContractType}>
                  <SelectTrigger className={fieldClassName}>
                    <SelectValue placeholder="اختر نوع العقد (سكني / تجاري)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="housing">سكني</SelectItem>
                    <SelectItem value="commercial">تجاري</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  مدة العقد <span className="text-red-500">*</span>
                </label>
                <Select
                  dir="rtl"
                  value={contractPeriodId}
                  onValueChange={setContractPeriodId}
                  disabled={!contractType || periodsLoading}
                >
                  <SelectTrigger className={fieldClassName}>
                    <SelectValue
                      placeholder={
                        !contractType
                          ? "اختر نوع العقد أولاً"
                          : periodsLoading
                            ? "جاري تحميل المدد..."
                            : "اختر مدة العقد"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {contractPeriods.map((period) => (
                      <SelectItem key={period.id} value={String(period.id)}>
                        {getContractPeriodLabel(period)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  رقم مسودة العقد <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="000042"
                  value={draftContractNumber}
                  onChange={(e) => setDraftContractNumber(e.target.value)}
                  className={fieldClassName}
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  المبلغ <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="500.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={fieldClassName}
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">ملاحظات</label>
                <Textarea
                  placeholder="أضف ملاحظات إضافية هنا..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[110px] rounded-[24px] border-[#E5E7EB] bg-white px-5 py-3 text-right shadow-sm resize-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-brand-main"
                />
              </div>

              <Button
                disabled={isSubmitDisabled}
                onClick={handleSubmit}
                className="mx-auto flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-hover text-base font-bold text-white shadow-sm transition-all hover:bg-brand-hover/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    <Link2 className="size-4" />
                    إنشاء رابط الدفع
                  </>
                )}
              </Button>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <PaymentLinkDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        paymentUrl={paymentLink.paymentUrl}
        cartAmount={paymentLink.cartAmount}
      />
    </>
  );
}
