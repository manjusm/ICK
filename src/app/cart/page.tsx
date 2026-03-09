"use client";

import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

export default function CartPage() {
  const { cart, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();

  if (totalItems === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <span className="text-6xl block mb-4">🛒</span>
        <h1 className="text-2xl font-bold text-stone-800 mb-2">Your cart is empty</h1>
        <p className="text-stone-500 mb-6">Browse our kitchens and add some delicious Indian food!</p>
        <Link href="/kitchens" className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">Browse Kitchens</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-stone-800 mb-2">Your Cart</h1>
      <p className="text-stone-500 mb-8">Ordering from <span className="font-semibold text-amber-600">{cart.kitchenName}</span></p>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="divide-y divide-stone-100">
          {cart.items.map((item) => (
            <div key={item.menuItemId} className="flex items-center justify-between p-6">
              <div className="flex-1">
                <h3 className="font-semibold text-stone-800">{item.name}</h3>
                <p className="text-amber-600 font-medium">{formatPrice(item.price)}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors">-</button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors">+</button>
                </div>
                <span className="font-bold text-stone-800 w-24 text-right">{formatPrice(item.price * item.quantity)}</span>
                <button onClick={() => removeItem(item.menuItemId)} className="text-red-400 hover:text-red-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-stone-50 p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-stone-600">Total ({totalItems} {totalItems === 1 ? "item" : "items"})</span>
            <span className="text-2xl font-bold text-stone-800">{formatPrice(totalPrice)}</span>
          </div>
          <div className="flex gap-4">
            <button onClick={clearCart} className="px-6 py-3 border border-stone-300 text-stone-600 hover:bg-stone-100 rounded-lg font-medium transition-colors">Clear Cart</button>
            <Link href="/checkout" className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg font-semibold text-center transition-colors">Proceed to Checkout</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
