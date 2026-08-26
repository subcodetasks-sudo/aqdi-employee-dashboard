import {
  AlertCircle,
  Ban,
  CheckCircle2,
  Undo2,
} from "lucide-react";

/** Quick section buttons — matches design.html #listWrap .qsb (موثق / ملغي / مسترجع / غير مكتمل). */
export const STATUS_FILTER_PILLS = [
  { id: "authenticated", label: "موثق", Icon: CheckCircle2, sectionTitle: "موثق في إيجار" },
  { id: "canceled", label: "ملغي", Icon: Ban, sectionTitle: "ملغي" },
  { id: "returned", label: "مسترجع", Icon: Undo2, sectionTitle: "مسترجع" },
  { id: "incomplete", label: "طلب غير مكتمل", Icon: AlertCircle, sectionTitle: "طلب غير مكتمل" },
];

export const SECTION_NOTE = "صفحة مستقلة — الطلبات المؤرشفة بهذه الحالة";
