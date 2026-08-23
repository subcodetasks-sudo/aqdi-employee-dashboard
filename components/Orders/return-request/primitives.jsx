// design.html's terminal-status confirm modals use the "refunded" tone (#557086)
// for the استرجاع flow — matches .tm-refunded / .tmconfirm.tm-refunded
export const RETURN_ACCENT = "#557086";

export const RETURN_INPUT_CLASS =
    "w-full h-[52px] bg-white border border-[#E3E8E6] rounded-[16px] px-4 text-[14px] focus:outline-none focus:border-[#557086] focus:ring-1 focus:ring-[#557086]/20 transition-all";

export const RETURN_WHATSAPP_MESSAGE = `عميلنا العزيز،

الرجاء تعبئة البيانات لإتمام طلب الاسترجاع :
أسم البنك :
أسم صاحب الحساب :
رقم الحساب او الآيبان :
🔴 يشترط ان يكون رقم الحساب هو نفس وفي حالة تغييره سيتم رفض الطلب
⏱️ سيتم استرجاع المبلغ خلال يوم إلى 3 أيام عمل

شكراً لتفهمكم.`;

export function formatReturnDateTime(dateString) {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "—";
    const time = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${time} · ${day}/${month}/${date.getFullYear()}`;
}

// design.html .tmd — muted card, #F7FAF9 bg, #EEF2F0 border, 10px radius
export function ReturnTile({ label, value, className = "" }) {
    return (
        <div className={`rounded-[10px] bg-[#F7FAF9] border border-[#EEF2F0] px-4 py-3 ${className}`}>
            <p className="text-[11.5px] text-[#8A968F] mb-1">{label}</p>
            <p className="text-[14px] font-bold text-[#2B3A34] truncate">{value ?? "—"}</p>
        </div>
    );
}
