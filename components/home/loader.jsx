import PageSkeleton from "@/components/home/page-skeleton";

/**
 * Page-level loading state. Renders an inline skeleton in the content area
 * (not a fixed overlay) so the sidebar stays interactive.
 */
export default function Loader() {
  return <PageSkeleton />;
}
