import {
  AlertCircle,
  CheckCircle2,
  Undo2,
  UserRound,
} from "lucide-react";

/** Filter pills with Lucide icons (no emojis). */
export const STATUS_FILTER_PILLS = [
  { id: "authenticated", label: "موثق", Icon: CheckCircle2 },
  { id: "myFiles", label: "ملفي", Icon: UserRound },
  { id: "returned", label: "مسترجع", Icon: Undo2 },
  { id: "incomplete", label: "طلب غير مكتمل", Icon: AlertCircle },
];
