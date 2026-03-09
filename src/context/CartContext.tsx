"use client";

import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react";
import type { CartItem, CartState } from "@/types";

type Action =
  | { type: "ADD_ITEM"; payload: { menuItemId: string; name: string; price: number; kitchenId: string; kitchenName: string } }
  | { type: "REMOVE_ITEM"; payload: { menuItemId: string } }
  | { type: "UPDATE_QTY"; payload: { menuItemId: string; quantity: number } }
  | { type: "CLEAR" }
  | { type: "LOAD"; payload: CartState };

const empty: CartState = { items: [], kitchenId: null, kitchenName: null };

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const { menuItemId, name, price, kitchenId, kitchenName } = action.payload;
      if (state.kitchenId && state.kitchenId !== kitchenId) {
        if (!window.confirm("Your cart has items from another kitchen. Clear cart and add this item?")) return state;
        return { items: [{ id: crypto.randomUUID(), menuItemId, name, price, quantity: 1, kitchenId, kitchenName }], kitchenId, kitchenName };
      }
      const existing = state.items.find((i) => i.menuItemId === menuItemId);
      if (existing) {
        return { ...state, items: state.items.map((i) => i.menuItemId === menuItemId ? { ...i, quantity: i.quantity + 1 } : i) };
      }
      return { items: [...state.items, { id: crypto.randomUUID(), menuItemId, name, price, quantity: 1, kitchenId, kitchenName }], kitchenId, kitchenName };
    }
    case "REMOVE_ITEM": {
      const filtered = state.items.filter((i) => i.menuItemId !== action.payload.menuItemId);
      return { items: filtered, kitchenId: filtered.length ? state.kitchenId : null, kitchenName: filtered.length ? state.kitchenName : null };
    }
    case "UPDATE_QTY": {
      if (action.payload.quantity <= 0) {
        const remaining = state.items.filter((i) => i.menuItemId !== action.payload.menuItemId);
        return { items: remaining, kitchenId: remaining.length ? state.kitchenId : null, kitchenName: remaining.length ? state.kitchenName : null };
      }
      return { ...state, items: state.items.map((i) => i.menuItemId === action.payload.menuItemId ? { ...i, quantity: action.payload.quantity } : i) };
    }
    case "CLEAR": return empty;
    case "LOAD": return action.payload;
    default: return state;
  }
}

type Ctx = {
  cart: CartState;
  addItem: (item: { menuItemId: string; name: string; price: number; kitchenId: string; kitchenName: string }) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<Ctx | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, dispatch] = useReducer(reducer, empty);

  useEffect(() => {
    const saved = localStorage.getItem("ick-cart");
    if (saved) try { dispatch({ type: "LOAD", payload: JSON.parse(saved) }); } catch { /* ignore */ }
  }, []);

  useEffect(() => { localStorage.setItem("ick-cart", JSON.stringify(cart)); }, [cart]);

  const addItem = (item: { menuItemId: string; name: string; price: number; kitchenId: string; kitchenName: string }) => dispatch({ type: "ADD_ITEM", payload: item });
  const removeItem = (menuItemId: string) => dispatch({ type: "REMOVE_ITEM", payload: { menuItemId } });
  const updateQuantity = (menuItemId: string, quantity: number) => dispatch({ type: "UPDATE_QTY", payload: { menuItemId, quantity } });
  const clearCart = () => dispatch({ type: "CLEAR" });
  const totalItems = cart.items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);

  return <CartContext.Provider value={{ cart, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
