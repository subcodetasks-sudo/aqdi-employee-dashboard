"use client";
import UserCard from "../finAnalysis/UserCard";
import AnalysisSection, { CardGrid, GRID_2 } from "../AnalysisSection";

export default function UserAnalyticsSection({ users }) {
    return (
        <AnalysisSection title="تحلــيلات المستخدميــن :">
            <CardGrid>
                {users.newUsers.map((card, index) => (
                    <UserCard key={`user-${index}`} item={card} />
                ))}
            </CardGrid>
            <CardGrid columns={GRID_2}>
                {users.activity.map((card, index) => (
                    <UserCard key={`user-activity-${index}`} item={card} />
                ))}
            </CardGrid>
            <CardGrid columns={`${GRID_2} lg:grid-cols-4`}>
                {users.orders.map((card, index) => (
                    <UserCard key={`user-orders-${index}`} item={card} />
                ))}
            </CardGrid>
        </AnalysisSection>
    );
}
