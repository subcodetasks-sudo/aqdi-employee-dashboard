"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { getMockOrderDetail } from "../order-detail-mock";
import OrderDetailsHeader from "./OrderDetailsHeader";
import OrderGroupsLayout from "./OrderGroupsLayout";
import StaffNotesDrawer from "./StaffNotesDrawer";

export default function RealtimeOrderDetailsWrapper() {
  const params = useParams();
  const id = params?.id;

  const initial = useMemo(() => getMockOrderDetail(id), [id]);
  const [order, setOrder] = useState(initial);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState(initial.notes ?? []);
  const [draft, setDraft] = useState("");

  const handleStatusChange = (_row, status) => {
    setOrder((prev) => ({
      ...prev,
      status_id: status.id,
      status_name: status.label,
    }));
  };

  const handleAddNote = () => {
    const text = draft.trim();
    if (!text) return;
    setNotes((prev) => [
      {
        id: Date.now(),
        text,
        author: "أنت",
        at: new Date().toLocaleTimeString("ar-SA", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
      ...prev,
    ]);
    setDraft("");
    toast.success("تمت إضافة الملاحظة (تجريبي)");
  };

  return (
    <div
      className="flex flex-col gap-5 min-h-full transition-colors -m-[45px] p-[45px] max-[1700px]:-m-[30px] max-[1700px]:p-[30px] bg-[#F4F6F5] dark:bg-[#0B1411]"
      dir="rtl"
    >
      <OrderDetailsHeader
        order={order}
        onStatusChange={handleStatusChange}
        onOpenNotes={() => setNotesOpen(true)}
      />

      <OrderGroupsLayout order={order} />

      <StaffNotesDrawer
        open={notesOpen}
        onOpenChange={setNotesOpen}
        notes={notes}
        draft={draft}
        onDraftChange={setDraft}
        onAdd={handleAddNote}
      />
    </div>
  );
}
