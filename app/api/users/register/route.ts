// src/app/api/users/register/route.ts
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators/auth.schema";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = registerSchema.parse(body);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return NextResponse.json(
      { message: "Email already registered" },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  return NextResponse.json(
    { message: "User registered successfully" },
    { status: 201 }
  );
}
