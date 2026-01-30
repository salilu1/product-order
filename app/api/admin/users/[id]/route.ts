import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";

type RouteProps = {
  params: Promise<{ id: string }>;
};

// 🔐 GET: Fetch a single user's details
export async function GET(req: Request, { params }: RouteProps) {
  // Check if current user is an ADMIN
  const auth = await requireAuth("ADMIN");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true }, // Don't send passwords
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET_USER_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 🔐 PUT: Update user role
export async function PUT(req: Request, { params }: RouteProps) {
  const auth = await requireAuth("ADMIN");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  try {
    const body = await req.json();
    const { role } = body;

    // Basic validation
    if (!role || !["USER", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("UPDATE_USER_ERROR:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

// 🔐 DELETE: Remove a user
export async function DELETE(req: Request, { params }: RouteProps) {
  const auth = await requireAuth("ADMIN");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  try {
    // Optional: Prevent an admin from deleting themselves
    // if (auth.id === id) return NextResponse.json({ error: "Self-deletion blocked" }, { status: 403 });

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("DELETE_USER_ERROR:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}