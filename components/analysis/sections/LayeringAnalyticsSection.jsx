"use client";
import LayeringCard from "../finAnalysis/LayeringCard";
import AnalysisSection, { CardGrid, GRID_3 } from "../AnalysisSection";

export default function LayeringAnalyticsSection({ layering }) {
    if (layering.length === 0) return null;

    return (
        <AnalysisSection title="تحليــلات انتقال الطلب من تصنيف الى تصنيف أخر :" defaultOpen={false}>
            <CardGrid columns={`${GRID_3} xl:grid-cols-6`}>
                {layering.map((card, index) => (
                    <LayeringCard key={`layer-${index}`} item={card} />
                ))}
            </CardGrid>
        </AnalysisSection>
    );
}
