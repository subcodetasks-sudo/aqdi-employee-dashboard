import HomeWelcomeWrapper from "@/components/home/HomeWelcomeWrapper";

export default async function Page({ params, searchParams }) {
  await Promise.all([params, searchParams]);
  return <HomeWelcomeWrapper />;
}
