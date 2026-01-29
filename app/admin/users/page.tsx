import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";

export default async function AdminUsers() {
  const auth = await requireAuth("ADMIN");
  if (auth instanceof Response) return auth;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <Link
        href="/admin/users/new"
        className="mb-4 inline-block bg-green-600 text-white px-4 py-2 rounded"
      >
        Add New User
      </Link>

      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">ID</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="border p-2">{u.id}</td>
              <td className="border p-2">{u.email}</td>
              <td className="border p-2">{u.role}</td>
              <td className="border p-2 flex gap-2">
                <Link
                  href={`/admin/users/${u.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
