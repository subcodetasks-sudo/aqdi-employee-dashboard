"use client";
import OrderCard from "../finAnalysis/OrderCard";
import AnalysisSection, { CardGrid, GRID_3 } from "../AnalysisSection";

export default function OrderAnalyticsSection({ orders }) {
    return (
        <AnalysisSection title="تحلــيلات الطلبــات :">
            {orders.row1.length > 0 && (
                <CardGrid columns={GRID_3}>
                    {orders.row1.map((card, index) => (
                        <OrderCard key={`order-1-${index}`} item={card} />
                    ))}
                </CardGrid>
            )}
            {orders.row2.length > 0 && (
                <CardGrid columns={GRID_3}>
                    {orders.row2.map((card, index) => (
                        <OrderCard key={`order-2-${index}`} item={card} />
                    ))}
                </CardGrid>
            )}
        </AnalysisSection>
    );
}
