"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { data: session } = useSession();
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-amber-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-2xl">🍛</span><span>ICK Stockholm</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/kitchens" className="hover:text-amber-200 transition-colors">Kitchens</Link>
            <Link href="/cart" className="hover:text-amber-200 transition-colors relative">
              Cart
              {totalItems > 0 && <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{totalItems}</span>}
            </Link>
            {session ? (
              <>
                {session.user.role === "KITCHEN_OWNER" && <Link href="/dashboard/kitchen" className="hover:text-amber-200 transition-colors">My Kitchen</Link>}
                {session.user.role === "CUSTOMER" && <Link href="/dashboard/customer" className="hover:text-amber-200 transition-colors">My Orders</Link>}
                {session.user.role === "ADMIN" && <Link href="/admin" className="hover:text-amber-200 transition-colors">Admin</Link>}
                <span className="text-amber-200 text-sm">{session.user.name}</span>
                <button onClick={() => signOut()} className="bg-amber-700 hover:bg-amber-800 px-4 py-2 rounded-lg text-sm transition-colors">Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="hover:text-amber-200 transition-colors">Login</Link>
                <Link href="/auth/register" className="bg-white text-amber-600 hover:bg-amber-50 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">Register</Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-amber-700 px-4 pb-4 space-y-2">
          <Link href="/kitchens" className="block py-2 hover:text-amber-200" onClick={() => setMenuOpen(false)}>Kitchens</Link>
          <Link href="/cart" className="block py-2 hover:text-amber-200" onClick={() => setMenuOpen(false)}>Cart {totalItems > 0 && `(${totalItems})`}</Link>
          {session ? (
            <>
              {session.user.role === "KITCHEN_OWNER" && <Link href="/dashboard/kitchen" className="block py-2 hover:text-amber-200" onClick={() => setMenuOpen(false)}>My Kitchen</Link>}
              {session.user.role === "CUSTOMER" && <Link href="/dashboard/customer" className="block py-2 hover:text-amber-200" onClick={() => setMenuOpen(false)}>My Orders</Link>}
              {session.user.role === "ADMIN" && <Link href="/admin" className="block py-2 hover:text-amber-200" onClick={() => setMenuOpen(false)}>Admin</Link>}
              <button onClick={() => signOut()} className="block w-full text-left py-2 hover:text-amber-200">Sign Out ({session.user.name})</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="block py-2 hover:text-amber-200" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link href="/auth/register" className="block py-2 hover:text-amber-200" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
