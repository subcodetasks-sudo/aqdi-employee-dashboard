"use client";
import EmployeeCard from "../finAnalysis/EmployeeCard";
import AnalysisSection, { CardGrid, GRID_2, GRID_3 } from "../AnalysisSection";

export default function EmployeeAnalyticsSection({ employees }) {
    return (
        <AnalysisSection title="تحلــيلات الموظفيــن :">
            {employees.row1.length > 0 && (
                <CardGrid columns={GRID_3}>
                    {employees.row1.map((card, index) => (
                        <EmployeeCard key={`employee-1-${index}`} item={card} />
                    ))}
                </CardGrid>
            )}
            {employees.row2.length > 0 && (
                <CardGrid columns={GRID_2} className="max-w-full lg:max-w-[66%]">
                    {employees.row2.map((card, index) => (
                        <EmployeeCard key={`employee-2-${index}`} item={card} />
                    ))}
                </CardGrid>
            )}
        </AnalysisSection>
    );
}
