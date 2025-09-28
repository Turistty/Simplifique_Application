// app/admin/page.tsx (Server Component)
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboard from "./AdminDashboard"; // Client Component

export default async function AdminPage() {
  const cookieStore = cookies();
  const auth = (await cookieStore).get("auth");

  if (!auth) {
    redirect("/login");
  }

  // aqui você pode até chamar /api/me no servidor e checar role
  return <AdminDashboard />;
}
