"use client";

import { useState } from "react";

export const GRID_5 =
    "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 w-full min-w-0";

export const GRID_4 = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full min-w-0";

export const GRID_3 = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full min-w-0";

export const GRID_2 = "grid grid-cols-1 sm:grid-cols-2 gap-4 w-full min-w-0";

export function CardGrid({ children, columns = GRID_5, className = "" }) {
    if (!children || (Array.isArray(children) && children.length === 0)) return null;
    return <div className={`${columns} ${className}`}>{children}</div>;
}

export default function AnalysisSection({
    title,
    children,
    defaultOpen = true,
}) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <section className="min-w-0 w-full border-b border-[#E5E5E5] pb-6 last:border-b-0">
            <div className="flex items-center justify-between gap-4 mb-5">
                <h2 className="text-lg font-bold text-black">{title}</h2>
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    aria-label={open ? "طي القسم" : "فتح القسم"}
                    className="w-8 h-8 shrink-0 rounded-full bg-[#363636] flex items-center justify-center transition-transform hover:bg-[#1a1a1a]"
                >
                    <i
                        className={`fa-solid fa-chevron-down text-white text-11 transition-transform duration-200 ${
                            open ? "" : "-rotate-90"
                        }`}
                    />
                </button>
            </div>
            {open ? <div className="flex flex-col gap-4">{children}</div> : null}
        </section>
    );
}
