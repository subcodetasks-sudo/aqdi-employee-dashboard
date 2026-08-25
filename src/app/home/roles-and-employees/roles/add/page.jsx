import AddRole from "@/components/Roles/AddRole";

export default async function Page({ params, searchParams }) {
  await Promise.all([params, searchParams]);
  return <AddRole />;
}
