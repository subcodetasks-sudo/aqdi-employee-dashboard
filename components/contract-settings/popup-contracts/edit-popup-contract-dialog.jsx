"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import {
  getAvailablePopupInstrumentTypeOptions,
  getPopupInstrumentTypeLabel,
  POPUP_CONTRACTS_API,
  POPUP_CONTRACTS_QUERY_KEY,
  hasPopupContent,
} from "@/src/lib/popup-contracts";
import PopupContractFormFields from "./popup-contract-form-fields";

function mapItemToForm(item) {
  return {
    instrumentType: item?.instrument_type || "",
    popupStatusContract: Boolean(item?.popup_status_contract),
    popupStatusRealestate: Boolean(item?.popup_status_realestate),
    contentPopup: item?.content_popup || "",
    buttonText: item?.button_text || "",
    buttonLink: item?.button_link || "",
  };
}

export default function EditPopupContractDialog({ item, usedInstrumentTypes = [] }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(mapItemToForm(item));
  const [contentEditorKey, setContentEditorKey] = useState(0);
  const queryClient = useQueryClient();

  const instrumentOptions = useMemo(() => {
    const availableOptions = getAvailablePopupInstrumentTypeOptions({
      usedTypes: usedInstrumentTypes,
      includeType: item?.instrument_type,
    });

    if (availableOptions.length > 0) {
      return availableOptions;
    }

    if (!item?.instrument_type) return [];

    return [
      {
        value: item.instrument_type,
        label: getPopupInstrumentTypeLabel(item.instrument_type),
      },
    ];
  }, [item?.instrument_type, usedInstrumentTypes]);

  useEffect(() => {
    if (open) {
      setForm(mapItemToForm(item));
      setContentEditorKey((current) => current + 1);
    }
  }, [open, item]);

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      axiosInstance.post(`${POPUP_CONTRACTS_API}/${item?.id}`, {
        instrument_type: form.instrumentType,
        popup_status_contract: form.popupStatusContract,
        popup_status_realestate: form.popupStatusRealestate,
        content_popup: form.contentPopup,
        button_text: form.buttonText.trim(),
        button_link: form.buttonLink.trim(),
      }),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم تعديل المحتوى الإرشادي بنجاح");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: [POPUP_CONTRACTS_QUERY_KEY] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء تعديل المحتوى");
    },
  });

  const handleSubmit = () => {
    if (!form.instrumentType || !hasPopupContent(form.contentPopup)) {
      toast.error("يرجى تعبئة نوع الوثيقة ومحتوى البوب أب");
      return;
    }
    mutate();
  };

  return (
    <Dialog dir="rtl" open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="size-9 rounded-full border-0 bg-[#E6FFE6] text-brand-accent hover:bg-brand-accent hover:text-white"
          title="تعديل"
        >
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent closeButton={false} className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between border-b pb-6">
            <h2 className="text-xl font-bold">تعديل المحتوى الإرشادي</h2>
            <Button variant="ghost" type="button" onClick={() => setOpen(false)}>
              <X className="size-4" />
            </Button>
          </div>

          <PopupContractFormFields
            instrumentOptions={instrumentOptions}
            instrumentTypeDisabled
            instrumentType={form.instrumentType}
            onInstrumentTypeChange={(value) =>
              setForm((current) => ({ ...current, instrumentType: value }))
            }
            popupStatusContract={form.popupStatusContract}
            onPopupStatusContractChange={(value) =>
              setForm((current) => ({ ...current, popupStatusContract: value }))
            }
            popupStatusRealestate={form.popupStatusRealestate}
            onPopupStatusRealestateChange={(value) =>
              setForm((current) => ({ ...current, popupStatusRealestate: value }))
            }
            contentPopup={form.contentPopup}
            contentEditorKey={contentEditorKey}
            onContentPopupChange={(value) =>
              setForm((current) => ({ ...current, contentPopup: value }))
            }
            buttonText={form.buttonText}
            onButtonTextChange={(value) =>
              setForm((current) => ({ ...current, buttonText: value }))
            }
            buttonLink={form.buttonLink}
            onButtonLinkChange={(value) =>
              setForm((current) => ({ ...current, buttonLink: value }))
            }
          />

          <Button
            type="button"
            disabled={isPending}
            onClick={handleSubmit}
            className="mx-auto mt-4 block h-12 min-w-[140px] bg-brand-hover"
          >
            {isPending ? <Loader2 className="animate-spin" /> : "حفظ التعديل"}
          </Button>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
