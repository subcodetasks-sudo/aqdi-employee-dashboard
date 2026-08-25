"use client";
import UnitsCard from "../finAnalysis/UnitsCard";
import AnalysisSection, { CardGrid } from "../AnalysisSection";

export default function RealEstateAnalyticsSection({ realEstate }) {
    return (
        <AnalysisSection title="تحلــيلات العقــارات والوحــدات :">
            {realEstate.properties.length > 0 && (
                <CardGrid>
                    {realEstate.properties.map((card, index) => (
                        <UnitsCard key={`property-${index}`} item={card} />
                    ))}
                </CardGrid>
            )}
            {realEstate.units.length > 0 && (
                <CardGrid>
                    {realEstate.units.map((card, index) => (
                        <UnitsCard key={`unit-${index}`} item={card} />
                    ))}
                </CardGrid>
            )}
        </AnalysisSection>
    );
}
