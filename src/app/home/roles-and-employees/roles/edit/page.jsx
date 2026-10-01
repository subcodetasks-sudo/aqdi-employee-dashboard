import EditRole from "@/components/roles/edit-role";

export default async function Page({ params, searchParams }) {
  await Promise.all([params, searchParams]);
  return <EditRole />;
}
