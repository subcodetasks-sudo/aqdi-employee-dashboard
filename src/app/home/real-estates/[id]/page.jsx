import RealEstateDetailsWrapper from "@/components/analysis/PropertiesAnalysis/RealEstateDetailsWrapper";

export default async function RealEstateDetailsPage({ params, searchParams }) {
  await Promise.all([params, searchParams]);
  return <RealEstateDetailsWrapper />;
}
