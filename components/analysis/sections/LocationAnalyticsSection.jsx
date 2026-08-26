"use client";
import LocationsCard from "../finAnalysis/LocationsCard";
import AnalysisSection, { CardGrid, GRID_4 } from "../AnalysisSection";

export default function LocationAnalyticsSection({ locations }) {
    if (locations.length === 0) return null;

    return (
        <AnalysisSection title="أكثر المدن توثيقاً للعقود :">
            <CardGrid columns={GRID_4}>
                {locations.map((card, index) => (
                    <LocationsCard key={`location-${index}`} item={card} />
                ))}
            </CardGrid>
        </AnalysisSection>
    );
}
