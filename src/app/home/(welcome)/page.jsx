import HomeWelcomeWrapper from "@/components/home/home-welcome-wrapper";

export default async function Page({ params, searchParams }) {
  await Promise.all([params, searchParams]);
  return <HomeWelcomeWrapper />;
}
