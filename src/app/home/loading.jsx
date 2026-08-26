import PageSkeleton from "@/components/home/page-skeleton";

/**
 * Route-level Suspense fallback for /home/*. Nested inside home/layout so
 * SideData and UtilitySidePanel stay mounted while the page segment loads.
 */
export default function HomeLoading() {
  return <PageSkeleton />;
}
