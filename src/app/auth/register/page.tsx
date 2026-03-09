"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"CUSTOMER" | "KITCHEN_OWNER">("CUSTOMER");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      password: fd.get("password") as string,
      role,
      phone: (fd.get("phone") as string) || undefined,
      address: (fd.get("address") as string) || undefined,
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(typeof data.error === "string" ? data.error : "Registration failed.");
        setLoading(false);
        return;
      }
      const result = await signIn("credentials", { email: body.email, password: body.password, redirect: false });
      if (result?.ok) {
        router.push(role === "KITCHEN_OWNER" ? "/dashboard/kitchen" : "/");
        router.refresh();
      }
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center text-stone-800 mb-2">Create Account</h1>
        <p className="text-center text-stone-500 mb-6">Join ICK Stockholm</p>

        <div className="flex rounded-lg bg-stone-100 p-1 mb-6">
          <button type="button" onClick={() => setRole("CUSTOMER")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${role === "CUSTOMER" ? "bg-amber-600 text-white shadow" : "text-stone-600 hover:text-stone-800"}`}>
            Customer
          </button>
          <button type="button" onClick={() => setRole("KITCHEN_OWNER")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${role === "KITCHEN_OWNER" ? "bg-amber-600 text-white shadow" : "text-stone-600 hover:text-stone-800"}`}>
            Kitchen Owner
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
            <input type="text" name="name" required className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none" placeholder="Your full name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
            <input type="email" name="email" required className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
            <input type="password" name="password" required minLength={6} className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none" placeholder="Min 6 characters" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Phone (optional)</label>
            <input type="tel" name="phone" className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none" placeholder="+46 70 123 4567" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Address (optional)</label>
            <input type="text" name="address" className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none" placeholder="Stockholm, Sweden" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50">
            {loading ? "Creating account..." : role === "KITCHEN_OWNER" ? "Register as Kitchen Owner" : "Register as Customer"}
          </button>
        </form>

        <p className="text-center text-stone-500 mt-6 text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-amber-600 hover:text-amber-700 font-semibold">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
