"use client";
import AnalsCard from "../finAnalysis/AnalsCard";
import AnalysisSection, { CardGrid } from "../AnalysisSection";

export default function ControlPanelSection({ controlPanel }) {
    if (controlPanel.length === 0) return null;

    return (
        <AnalysisSection title="لوحة التحكم :">
            <CardGrid>
                {controlPanel.map((item, index) => (
                    <AnalsCard key={`control-${index}`} item={item} />
                ))}
            </CardGrid>
        </AnalysisSection>
    );
}
