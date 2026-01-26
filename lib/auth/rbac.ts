// src/lib/auth/rbac.ts
import { getServerSession } from "next-auth";
import { authOptions } from "./auth-options";

export async function requireRole(roles: ("ADMIN" | "USER")[]) {
  const session = await getServerSession(authOptions);

  if (!session || !roles.includes(session.user.role)) {
    throw new Error("Forbidden");
  }

  return session;
}
