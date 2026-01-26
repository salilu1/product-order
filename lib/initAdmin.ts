import { prisma } from "./prisma";
import bcrypt from "bcrypt";

export async function ensureAdmin() {
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@gmail.com";
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "Admin@123";

  const adminExists = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
      },
    });
    console.log("🚀 Default admin created automatically");
  }
}
