import RealEstateDetailsWrapper from "@/components/analysis/properties-analysis/real-estate-details-wrapper";

export default async function RealEstateDetailsPage({ params, searchParams }) {
  await Promise.all([params, searchParams]);
  return <RealEstateDetailsWrapper />;
}
