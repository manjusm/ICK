"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type Kitchen = { id: string; name: string; cuisine: string; address: string; isActive: boolean; createdAt: string; owner: { name: string; email: string }; _count: { menuItems: number; orders: number } };
type User = { id: string; name: string; email: string; role: string; createdAt: string };

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"kitchens" | "users">("kitchens");

  const loadData = useCallback(async () => {
    const [kRes, uRes] = await Promise.all([fetch("/api/admin/kitchens"), fetch("/api/admin/users")]);
    if (kRes.ok) setKitchens(await kRes.json());
    if (uRes.ok) setUsers(await uRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role !== "ADMIN") { router.push("/"); return; }
      loadData();
    }
  }, [status, session, router, loadData]);

  async function toggleKitchen(id: string, isActive: boolean) {
    await fetch(`/api/kitchens/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !isActive }) });
    loadData();
  }

  async function deleteKitchen(id: string) {
    if (!confirm("Delete this kitchen permanently?")) return;
    await fetch(`/api/kitchens/${id}`, { method: "DELETE" });
    loadData();
  }

  if (loading) return <div className="flex justify-center items-center min-h-[60vh]"><p className="text-stone-400 text-lg">Loading...</p></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-stone-800 mb-8">Admin Panel</h1>
      <div className="flex gap-2 mb-8">
        <button onClick={() => setTab("kitchens")} className={`px-6 py-2 rounded-lg font-medium transition-colors ${tab === "kitchens" ? "bg-amber-600 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}>Kitchens ({kitchens.length})</button>
        <button onClick={() => setTab("users")} className={`px-6 py-2 rounded-lg font-medium transition-colors ${tab === "users" ? "bg-amber-600 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}>Users ({users.length})</button>
      </div>

      {tab === "kitchens" && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-stone-500">Kitchen</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-stone-500">Owner</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-stone-500">Items</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-stone-500">Orders</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-stone-500">Status</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-stone-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {kitchens.map((k) => (
                  <tr key={k.id}>
                    <td className="px-6 py-4"><div className="font-medium text-stone-800">{k.name}</div><div className="text-stone-400 text-sm">{k.cuisine}</div></td>
                    <td className="px-6 py-4"><div className="text-stone-700">{k.owner.name}</div><div className="text-stone-400 text-sm">{k.owner.email}</div></td>
                    <td className="px-6 py-4 text-stone-600">{k._count.menuItems}</td>
                    <td className="px-6 py-4 text-stone-600">{k._count.orders}</td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${k.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{k.isActive ? "Active" : "Inactive"}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => toggleKitchen(k.id, k.isActive)} className={`text-xs font-medium px-3 py-1 rounded transition-colors ${k.isActive ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`}>{k.isActive ? "Deactivate" : "Activate"}</button>
                        <button onClick={() => deleteKitchen(k.id)} className="bg-red-100 text-red-600 hover:bg-red-200 text-xs font-medium px-3 py-1 rounded transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {kitchens.length === 0 && <p className="text-center text-stone-400 py-8">No kitchens registered yet.</p>}
        </div>
      )}

      {tab === "users" && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-stone-500">Name</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-stone-500">Email</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-stone-500">Role</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-stone-500">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-6 py-4 font-medium text-stone-800">{u.name}</td>
                    <td className="px-6 py-4 text-stone-600">{u.email}</td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === "ADMIN" ? "bg-purple-100 text-purple-700" : u.role === "KITCHEN_OWNER" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>{u.role}</span></td>
                    <td className="px-6 py-4 text-stone-500 text-sm">{new Date(u.createdAt).toLocaleDateString("sv-SE")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
