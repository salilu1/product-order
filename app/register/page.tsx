"use client";

import { useRouter } from "next/navigation";
import axios from "axios";

export default function RegisterPage() {
  const router = useRouter();

  async function handleSubmit(e: any) {
    e.preventDefault();

    await axios.post("/api/register", {
      email: e.target.email.value,
      password: e.target.password.value,
    });

    router.push("/login");
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Register</h1>

      <input name="email" placeholder="Email" className="input" />
      <input name="password" type="password" placeholder="Password" className="input" />

      <button className="bg-green-600 text-white px-4 py-2 rounded">
        Register
      </button>
    </form>
  );
}
