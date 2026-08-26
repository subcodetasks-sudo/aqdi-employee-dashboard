import EditRole from "@/components/Roles/EditRole";

export default async function Page({ params, searchParams }) {
  await Promise.all([params, searchParams]);
  return <EditRole />;
}
