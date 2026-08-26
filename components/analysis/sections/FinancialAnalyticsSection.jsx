"use client";
import DayCard from "../finAnalysis/DayCard";
import AnalysisSection, { CardGrid } from "../AnalysisSection";

export default function FinancialAnalyticsSection({ financial }) {
    return (
        <AnalysisSection title="التحليــلات المــاليــة :">
            <CardGrid>
                {financial.incomes.map((card, index) => (
                    <DayCard key={`fin-income-${index}`} item={card} />
                ))}
            </CardGrid>
            <CardGrid>
                {financial.orders.map((card, index) => (
                    <DayCard key={`fin-orders-${index}`} item={card} />
                ))}
            </CardGrid>
            <CardGrid>
                {financial.incomplete.map((card, index) => (
                    <DayCard key={`fin-incomplete-${index}`} item={card} />
                ))}
            </CardGrid>
            <CardGrid>
                {financial.returns.map((card, index) => (
                    <DayCard key={`fin-returns-${index}`} item={card} />
                ))}
            </CardGrid>
            <CardGrid>
                {financial.expenses.map((card, index) => (
                    <DayCard key={`fin-expenses-${index}`} item={card} />
                ))}
            </CardGrid>
        </AnalysisSection>
    );
}
