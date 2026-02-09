"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const form = e.currentTarget;
      const email = (form.email as HTMLInputElement).value;
      const password = (form.password as HTMLInputElement).value;

      await axios.post("/api/register", { email, password });
      router.push("/login");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 sm:py-16 md:py-20">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-10 md:p-12 border border-gray-200">
          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
              Register
            </h1>
            <p className="text-gray-500 font-medium italic">
              Create your new account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold border border-red-100 uppercase tracking-wide">
                {error}
              </div>
            )}

            {/* Email Input */}
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder=" "
                className="peer block w-full px-5 pt-5 pb-2 text-gray-900 bg-transparent border-2 border-gray-200 rounded-2xl appearance-none focus:outline-none focus:border-blue-600 transition"
              />
              <label
                htmlFor="email"
                className="absolute left-5 top-2.5 text-gray-400 text-sm font-bold transition-all
                  peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                  peer-focus:top-2.5 peer-focus:text-sm peer-focus:text-blue-600 bg-white px-1"
              >
                Email Address
              </label>
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder=" "
                className="peer block w-full px-5 pt-5 pb-2 text-gray-900 bg-transparent border-2 border-gray-200 rounded-2xl appearance-none focus:outline-none focus:border-blue-600 transition"
              />
              <label
                htmlFor="password"
                className="absolute left-5 top-2.5 text-gray-400 text-sm font-bold transition-all
                  peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                  peer-focus:top-2.5 peer-focus:text-sm peer-focus:text-blue-600 bg-white px-1"
              >
                Password
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-gray-900 hover:bg-blue-600 text-white font-black py-4 md:py-5 rounded-2xl transition-all active:scale-[0.98] disabled:bg-gray-300 shadow-lg"
            >
              {loading ? "Registering..." : "Register"}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm font-bold uppercase tracking-wide">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-blue-600 hover:text-blue-700 transition-colors"
              >
                Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
