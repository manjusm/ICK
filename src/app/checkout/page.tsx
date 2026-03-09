"use client";

import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

export default function CheckoutPage() {
  const { cart, totalPrice, totalItems, clearCart } = useCart();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (totalItems === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <span className="text-6xl block mb-4">🛒</span>
        <h1 className="text-2xl font-bold text-stone-800 mb-2">Nothing to checkout</h1>
        <Link href="/kitchens" className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors mt-4">Browse Kitchens</Link>
      </div>
    );
  }

  async function handleCheckout() {
    if (!session) return;
    setLoading(true); setError("");
    try {
      const orderRes = await fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kitchenId: cart.kitchenId, items: cart.items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })) }),
      });
      if (!orderRes.ok) { setError((await orderRes.json()).error || "Failed to create order"); setLoading(false); return; }
      const order = await orderRes.json();

      const payRes = await fetch("/api/payments/create-session", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      if (!payRes.ok) { setError("Failed to initiate payment"); setLoading(false); return; }

      const { url } = await payRes.json();
      clearCart();
      window.location.href = url;
    } catch { setError("Something went wrong."); setLoading(false); }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-stone-800 mb-8">Checkout</h1>
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="font-bold text-stone-800 text-lg mb-4">Order Summary</h2>
        <p className="text-amber-600 font-medium mb-4">{cart.kitchenName}</p>
        <div className="divide-y divide-stone-100">
          {cart.items.map((item) => (
            <div key={item.menuItemId} className="flex justify-between py-3">
              <span className="text-stone-700">{item.quantity}x {item.name}</span>
              <span className="font-medium text-stone-800">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-stone-200 pt-4 mt-4 flex justify-between">
          <span className="font-bold text-stone-800 text-lg">Total</span>
          <span className="font-bold text-amber-600 text-lg">{formatPrice(totalPrice)}</span>
        </div>
      </div>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
      <button onClick={handleCheckout} disabled={loading}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white py-4 rounded-xl font-bold text-lg transition-colors disabled:opacity-50">
        {loading ? "Processing..." : `Pay ${formatPrice(totalPrice)}`}
      </button>
      <p className="text-center text-stone-400 text-sm mt-4">You will be redirected to Stripe for secure payment</p>
    </div>
  );
}
