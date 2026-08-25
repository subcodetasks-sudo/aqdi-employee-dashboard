import Image from "next/image";
import Link from "next/link";
import rial from "@/public/images/rial.svg";
import redRial from "@/public/images/redRial.svg";
import {
    ANALYSIS_CARD,
    ANALYSIS_ICON_WRAP,
    ANALYSIS_VIEW_BTN,
    getValueColorClass,
} from "./analysis-card-styles";
import StaticAvatarStack from "./StaticAvatarStack";
import { parseNamesList, STATIC_AVATAR_COUNT } from "./static-analysis-avatars";

export default function PersonAnalysisCard({
    item,
    icon,
    iconSize = 16,
    showStaticAvatars = true,
}) {
    const names = (item.names ?? parseNamesList(item.value)).slice(0, STATIC_AVATAR_COUNT);
    const hasNames = names.length > 0;
    const showLink = Boolean(item.link);
    const displayNames = hasNames ? names.join(" ، ") : null;
    const showAvatars = showStaticAvatars;

    return (
        <div
            className={`${ANALYSIS_CARD} ${item?.type === "onlyNumberTwoSpace" ? "lg:col-span-2" : ""} min-h-[148px]`}
        >
            <div className="flex items-start justify-between gap-3 w-full">
                <div className="flex flex-col gap-2.5 min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2 w-full">
                        <h3 className="text-13 font-bold text-black  leading-snug flex-1 min-w-0">
                            {item.name}
                        </h3>
                        {showAvatars ? <StaticAvatarStack names={names} /> : null}
                    </div>

                    {displayNames ? (
                        <p className="text-sm font-bold text-black  leading-relaxed">
                            {displayNames}
                        </p>
                    ) : (
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                            <span className={`text-[20px] font-bold leading-tight ${getValueColorClass(item)}`}>
                                {item.value}
                            </span>
                            {item.valueType === "price" ? (
                                <Image src={rial} alt="" width={20} height={20} />
                            ) : null}
                        </div>
                    )}
                </div>

                {icon ? (
                    <div className={ANALYSIS_ICON_WRAP}>
                        <Image src={icon} alt="" width={iconSize} height={iconSize} />
                    </div>
                ) : null}
            </div>

            {showLink ? (
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
