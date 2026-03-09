"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-2xl shadow-lg p-10">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-stone-800 mb-2">Payment Successful!</h1>
        <p className="text-stone-500 mb-2">Your order has been confirmed and is being prepared.</p>
        {orderId && <p className="text-stone-400 text-sm mb-8">Order ID: {orderId}</p>}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard/customer" className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">View My Orders</Link>
          <Link href="/kitchens" className="border border-stone-300 text-stone-600 hover:bg-stone-50 px-6 py-3 rounded-lg font-semibold transition-colors">Continue Browsing</Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return <Suspense><SuccessContent /></Suspense>;
}
