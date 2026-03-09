"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type Kitchen = { id: string; name: string; description: string; cuisine: string; address: string; phone: string; isActive: boolean };
type MenuItem = { id: string; name: string; description: string; price: number; category: string; isAvailable: boolean };
type OrderType = {
  id: string; status: string; totalAmount: number; createdAt: string;
  customer: { name: string; email: string };
  items: { quantity: number; menuItem: { name: string }; price: number }[];
};

export default function KitchenDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [kitchen, setKitchen] = useState<Kitchen | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showKitchenForm, setShowKitchenForm] = useState(false);
  const [showMenuForm, setShowMenuForm] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/kitchen");
      if (res.ok) {
        const data = await res.json();
        setKitchen(data.kitchen);
        setMenuItems(data.menuItems || []);
        setOrders(data.orders || []);
        setShowKitchenForm(!data.kitchen);
      } else { setShowKitchenForm(true); }
    } catch { setShowKitchenForm(true); }
    setLoading(false);
  }, []);

  useEffect(() => { if (status === "authenticated") loadData(); }, [status, loadData]);

  if (status === "loading" || loading) return <div className="flex justify-center items-center min-h-[60vh]"><p className="text-stone-400 text-lg">Loading...</p></div>;
  if (!session || session.user.role !== "KITCHEN_OWNER") { router.push("/"); return null; }

  async function handleCreateKitchen(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/kitchens", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: fd.get("name"), description: fd.get("description"), cuisine: fd.get("cuisine"), address: fd.get("address"), phone: fd.get("phone") }),
    });
    if (res.ok) { setShowKitchenForm(false); loadData(); }
  }

  async function handleAddMenuItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/menus", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: fd.get("name"), description: fd.get("description"), price: parseFloat(fd.get("price") as string), category: fd.get("category"), kitchenId: kitchen!.id }),
    });
    if (res.ok) { setShowMenuForm(false); loadData(); }
  }

  async function handleDeleteMenuItem(id: string) {
    if (!confirm("Delete this menu item?")) return;
    await fetch(`/api/menus/${id}`, { method: "DELETE" });
    loadData();
  }

  async function handleToggleAvailability(id: string, current: boolean) {
    await fetch(`/api/menus/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isAvailable: !current }) });
    loadData();
  }

  async function handleUpdateOrderStatus(orderId: string, newStatus: string) {
    await fetch(`/api/orders/${orderId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) });
    loadData();
  }

  const inputCls = "w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-stone-800 mb-8">Kitchen Dashboard</h1>

      {showKitchenForm && !kitchen && (
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-stone-800 mb-6">Register Your Kitchen</h2>
          <form onSubmit={handleCreateKitchen} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-stone-700 mb-1">Kitchen Name</label><input name="name" required className={inputCls} placeholder="e.g., Spice House" /></div>
              <div><label className="block text-sm font-medium text-stone-700 mb-1">Cuisine Type</label><input name="cuisine" required className={inputCls} placeholder="e.g., North Indian" /></div>
            </div>
            <div><label className="block text-sm font-medium text-stone-700 mb-1">Description</label><textarea name="description" required rows={3} className={inputCls} placeholder="Tell customers about your kitchen..." /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-stone-700 mb-1">Address</label><input name="address" required className={inputCls} placeholder="Stockholm, Sweden" /></div>
              <div><label className="block text-sm font-medium text-stone-700 mb-1">Phone</label><input name="phone" required className={inputCls} placeholder="+46 70 123 4567" /></div>
            </div>
            <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">Register Kitchen</button>
          </form>
        </div>
      )}

      {kitchen && (
        <>
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-stone-800">{kitchen.name}</h2>
                <p className="text-amber-600 font-medium">{kitchen.cuisine}</p>
                <p className="text-stone-500 mt-1">{kitchen.description}</p>
                <p className="text-stone-400 text-sm mt-2">{kitchen.address} &middot; {kitchen.phone}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${kitchen.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {kitchen.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-stone-800">Menu Items</h2>
              <button onClick={() => setShowMenuForm(!showMenuForm)} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                {showMenuForm ? "Cancel" : "+ Add Item"}
              </button>
            </div>

            {showMenuForm && (
              <form onSubmit={handleAddMenuItem} className="bg-amber-50 rounded-xl p-6 mb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-stone-700 mb-1">Item Name</label><input name="name" required className={inputCls} placeholder="e.g., Butter Chicken" /></div>
                  <div><label className="block text-sm font-medium text-stone-700 mb-1">Price (SEK)</label><input name="price" type="number" step="0.01" min="0" required className={inputCls} placeholder="149" /></div>
                </div>
                <div><label className="block text-sm font-medium text-stone-700 mb-1">Description</label><input name="description" required className={inputCls} placeholder="Tender chicken in rich tomato sauce" /></div>
                <div><label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
                  <select name="category" required className={inputCls}><option value="STARTER">Starter</option><option value="MAIN">Main Course</option><option value="DESSERT">Dessert</option><option value="BEVERAGE">Beverage</option></select>
                </div>
                <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">Add Item</button>
              </form>
            )}

            {menuItems.length === 0 ? <p className="text-stone-400 text-center py-8">No menu items yet. Add your first dish!</p> : (
              <div className="space-y-3">
                {menuItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-stone-800">{item.name}</span>
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{item.category}</span>
                        {!item.isAvailable && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Unavailable</span>}
                      </div>
                      <p className="text-stone-500 text-sm">{item.description}</p>
                      <p className="text-amber-600 font-semibold text-sm mt-1">{item.price} SEK</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleToggleAvailability(item.id, item.isAvailable)}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${item.isAvailable ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`}>
                        {item.isAvailable ? "Mark Unavailable" : "Mark Available"}
                      </button>
                      <button onClick={() => handleDeleteMenuItem(item.id)} className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded text-xs font-medium transition-colors">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-stone-800 mb-6">Recent Orders</h2>
            {orders.length === 0 ? <p className="text-stone-400 text-center py-8">No orders yet.</p> : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-stone-200 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium text-stone-800">{order.customer.name}</p>
                        <p className="text-stone-400 text-sm">{new Date(order.createdAt).toLocaleString("sv-SE")}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-600">{order.totalAmount} SEK</span>
                        <select value={order.status} onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="text-xs border border-stone-300 rounded px-2 py-1">
                          <option value="PENDING">Pending</option><option value="CONFIRMED">Confirmed</option>
                          <option value="PREPARING">Preparing</option><option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </div>
                    </div>
                    <div className="text-sm text-stone-500">
                      {order.items.map((it, i) => <span key={i}>{it.quantity}x {it.menuItem.name}{i < order.items.length - 1 ? ", " : ""}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
