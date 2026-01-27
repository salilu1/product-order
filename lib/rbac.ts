import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { NextResponse } from "next/server";

type Role = "ADMIN" | "USER";

export async function requireAuth(requiredRole?: Role) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = {
    id: session.user.id,
    email: session.user.email!,
    role: session.user.role as Role,
  };

  if (requiredRole && user.role !== requiredRole) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return { user };
}
