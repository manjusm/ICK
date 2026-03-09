"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { formatPrice } from "@/lib/utils";
import RatingStars from "@/components/RatingStars";

type Order = {
  id: string; status: string; totalAmount: number; createdAt: string;
  kitchen: { name: string };
  items: { id: string; quantity: number; price: number; menuItem: { id: string; name: string } }[];
  ratings: { id: string; score: number; comment: string | null; menuItemId: string }[];
};

export default function CustomerDashboard() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingForm, setRatingForm] = useState<{ orderId: string; menuItemId: string; menuItemName: string } | null>(null);
  const [ratingScore, setRatingScore] = useState(0);
  const [ratingComment, setRatingComment] = useState("");

  const loadOrders = useCallback(async () => {
    const res = await fetch("/api/orders");
    if (res.ok) setOrders(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { if (status === "authenticated") loadOrders(); }, [status, loadOrders]);

  async function handleSubmitRating() {
    if (!ratingForm || ratingScore === 0) return;
    const res = await fetch("/api/ratings", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: ratingForm.orderId, menuItemId: ratingForm.menuItemId, score: ratingScore, comment: ratingComment || undefined }),
    });
    if (res.ok) { setRatingForm(null); setRatingScore(0); setRatingComment(""); loadOrders(); }
  }

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700", CONFIRMED: "bg-blue-100 text-blue-700",
    PREPARING: "bg-purple-100 text-purple-700", DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  if (loading) return <div className="flex justify-center items-center min-h-[60vh]"><p className="text-stone-400 text-lg">Loading...</p></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-stone-800 mb-2">My Orders</h1>
      <p className="text-stone-500 mb-8">Welcome back, {session?.user?.name}</p>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-6xl block mb-4">📦</span>
          <h3 className="text-xl font-semibold text-stone-600 mb-2">No orders yet</h3>
          <p className="text-stone-400">Start exploring our kitchens and place your first order!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-lg overflow-hidden p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-stone-800 text-lg">{order.kitchen.name}</h3>
                  <p className="text-stone-400 text-sm">{new Date(order.createdAt).toLocaleString("sv-SE")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-amber-600 text-lg">{formatPrice(order.totalAmount)}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || "bg-stone-100 text-stone-600"}`}>{order.status}</span>
                </div>
              </div>
              <div className="space-y-3">
                {order.items.map((item) => {
                  const rated = order.ratings.find((r) => r.menuItemId === item.menuItem.id);
                  return (
                    <div key={item.id} className="flex items-center justify-between bg-stone-50 rounded-lg p-3">
                      <div>
                        <span className="text-stone-700 font-medium">{item.quantity}x {item.menuItem.name}</span>
                        <span className="text-stone-400 text-sm ml-2">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                      <div>
                        {rated ? (
                          <div className="flex items-center gap-2">
                            <RatingStars rating={rated.score} size="sm" />
                            {rated.comment && <span className="text-stone-400 text-xs max-w-32 truncate">{rated.comment}</span>}
                          </div>
                        ) : order.status === "DELIVERED" ? (
                          <button onClick={() => setRatingForm({ orderId: order.id, menuItemId: item.menuItem.id, menuItemName: item.menuItem.name })}
                            className="text-amber-600 hover:text-amber-700 text-sm font-medium">Rate</button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {ratingForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-stone-800 mb-1">Rate {ratingForm.menuItemName}</h3>
            <p className="text-stone-500 text-sm mb-6">How was this dish?</p>
            <div className="flex justify-center mb-6"><RatingStars rating={ratingScore} size="lg" interactive onRate={setRatingScore} /></div>
            <textarea value={ratingComment} onChange={(e) => setRatingComment(e.target.value)} placeholder="Leave a comment (optional)" rows={3}
              className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => { setRatingForm(null); setRatingScore(0); setRatingComment(""); }}
                className="flex-1 px-4 py-3 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors">Cancel</button>
              <button onClick={handleSubmitRating} disabled={ratingScore === 0}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50">Submit Rating</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
