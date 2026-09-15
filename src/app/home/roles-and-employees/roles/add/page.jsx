import AddRole from "@/components/roles/add-role";

export default async function Page({ params, searchParams }) {
  await Promise.all([params, searchParams]);
  return <AddRole />;
}
