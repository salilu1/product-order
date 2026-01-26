// src/app/api/admin/users/route.ts
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/rbac";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await requireRole(["ADMIN"]);

  const { email, password, role } = await req.json();

  if (!["ADMIN", "USER"].includes(role)) {
    return NextResponse.json(
      { message: "Invalid role" },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role,
    },
  });

  return NextResponse.json(user, { status: 201 });
}
