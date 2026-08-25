import LoginPage from "@/components/ui/login/LoginPage";

export default async function Page({ params, searchParams }) {
  await Promise.all([params, searchParams]);
  return <LoginPage />;
}
