import Image from "next/image";
import Link from "next/link";
import rial from "@/public/images/rial.svg";
import redRial from "@/public/images/redRial.svg";
import {
    ANALYSIS_CARD,
    ANALYSIS_ICON_WRAP,
    ANALYSIS_VIEW_BTN,
    getLabelColorClass,
    getValueColorClass,
    PercentageBadge,
} from "./analysis-card-styles";
import NameAvatarStack from "./NameAvatarStack";

export default function AnalysisMetricCard({
    item,
    icon,
    iconSize = 16,
    showViewButton = true,
    showIcon = true,
    className = "",
    valueContent,
}) {
    const showLink = showViewButton && item?.link;
    const hideButton = item?.type === "onlyNumber" && !item?.link;

    return (
        <div
            className={`${ANALYSIS_CARD} ${item?.type === "onlyNumberTwoSpace" ? "lg:col-span-2" : ""} ${className}`}
        >
            <div className="flex items-start justify-between gap-3 w-full">
                <div className="flex flex-col gap-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-xs font-normal leading-snug ${getLabelColorClass(item)}`}>
                            {item.name}
                        </span>
                        <PercentageBadge percentage={item.percentage} />
                    </div>
                    <div className="w-full min-w-0">
                        {valueContent ?? (
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[20px] font-bold leading-tight ${getValueColorClass(item)}`}>
                                    {item.value}
                                </span>
                                {item.valueType === "price" ? (
                                    <Image
                                        src={item.type === "totalLoss" ? redRial : rial}
                                        alt=""
                                        width={20}
                                        height={20}
                                    />
                                ) : null}
                            </div>
                        )}
                    </div>
                </div>
                {showIcon && icon ? (
                    <div className={ANALYSIS_ICON_WRAP}>
                        <Image src={icon} alt="" width={iconSize} height={iconSize} />
                    </div>
                ) : null}
            </div>

            {showLink && !hideButton ? (
                <div className="flex justify-end w-full pt-1">
                    <Link href={item.link} className={ANALYSIS_VIEW_BTN}>
                        عــرض
                    </Link>
                </div>
            ) : (
                <span className="h-[34px] shrink-0" aria-hidden />
            )}
        </div>
    );
}

export { NameAvatarStack };
