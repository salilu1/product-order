"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewUser() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");

  const handleCreate = async () => {
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });

    if (!res.ok) return alert("Failed to create user");
    router.push("/admin/users");
  };

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-4">Create New User</h1>

      <div className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button
          onClick={handleCreate}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Create
        </button>
      </div>
    </div>
  );
}
