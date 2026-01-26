// src/app/(protected)/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome {session?.user.email}</p>
    </div>
  );
}
