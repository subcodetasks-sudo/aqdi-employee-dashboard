"use client";

export default function EmptyNote({ children = "لا توجد بيانات في هذه الفترة." }) {
  return <p className="text-13 text-gray-400 dark:text-white/50">{children}</p>;
}
