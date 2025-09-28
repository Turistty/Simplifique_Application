// app/admin/page.tsx (Server Component)
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import RewardsShop from "./RewardsShop";

export default async function RewardsPage() {
  const cookieStore = cookies();
  const auth = (await cookieStore).get("auth");

  if (!auth) {
    redirect("/login");
  }

  // aqui você pode até chamar /api/me no servidor e checar role
  return <RewardsShop />;
}
