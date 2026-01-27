import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  const secret = req.headers.get("x-bootstrap-secret");

  if (secret !== process.env.ADMIN_BOOTSTRAP_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = process.env.DEFAULT_ADMIN_EMAIL!;
  const password = process.env.DEFAULT_ADMIN_PASSWORD!;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ message: "Admin already exists" });
  }

  await prisma.user.create({
    data: {
      email,
      password: await bcrypt.hash(password, 12),
      role: "ADMIN",
    },
  });

  return NextResponse.json({ message: "Admin created successfully" });
}
