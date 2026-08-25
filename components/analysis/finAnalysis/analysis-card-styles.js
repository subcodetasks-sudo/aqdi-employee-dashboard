export const ANALYSIS_CARD =
    "flex flex-col justify-between gap-3 p-5 bg-white rounded-2xl border border-[#ECECEC] shadow-[0_1px_3px_rgba(0,0,0,0.04)] min-w-0 w-full min-h-[132px] max-[1700px]:p-[15px_18px]";

export const ANALYSIS_VIEW_BTN =
    "inline-flex items-center justify-center rounded-full border border-[#0c6055]/20 bg-[#E8F5F0] text-[#0c6055] text-xs font-medium px-[18px] py-[7px] transition-all hover:bg-[#0c6055] hover:text-white hover:border-[#0c6055] whitespace-nowrap";

export const ANALYSIS_ICON_WRAP =
    "w-[30px] h-[30px] shrink-0 rounded-full bg-neutral-100 flex items-center justify-center";

export function getValueColorClass(item) {
    if (item?.type === "totalLoss") return "text-[#E24444]";
    if (item?.type === "total" || item?.variant === "income") return "text-brand-hover";
    return "text-black";
}

export function getLabelColorClass(item) {
    if (item?.type === "totalLoss") return "text-[#E24444]";
    return "text-[#6C757D]";
}

export function PercentageBadge({ percentage }) {
    if (!percentage) return null;
    const isNegative = String(percentage).includes("-");
    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-10 font-medium ${
                isNegative ? "text-[#E24444] bg-[#FFF0F0]" : "text-[#0c6055] bg-[#E8F5F0]"
            }`}
        >
            <i className={`fa-solid text-[8px] ${isNegative ? "fa-arrow-down" : "fa-arrow-up"}`} />
            {percentage}
        </span>
    );
}
