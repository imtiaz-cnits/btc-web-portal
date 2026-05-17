import { getAllUsers } from "@/app/actions/auth";
import RolesClient from "./RolesClient";

export const revalidate = 0; // Fresh DB state on every visit

export default async function AdminRolesPage() {
  const users = await getAllUsers();
  return <RolesClient initialUsers={users} />;
}
