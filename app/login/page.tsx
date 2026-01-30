"use client";

import { signIn, getSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const form = e.currentTarget;
    const email = (form.email as HTMLInputElement).value;
    const password = (form.password as HTMLInputElement).value;

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid credentials");
      return;
    }

    // ✅ Fetch session after successful login
    const session = await getSession();

    if (session?.user?.role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Login</h1>

      {error && <p className="text-red-500">{error}</p>}

      <input
        name="email"
        type="email"
        required
        placeholder="Email"
        className="input"
      />

      <input
        name="password"
        type="password"
        required
        placeholder="Password"
        className="input"
      />

      <button className="bg-blue-600 text-white px-4 py-2 rounded">
        Login
      </button>
    </form>
  );
}
