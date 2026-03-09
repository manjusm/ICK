"use client";

import { useCart } from "@/context/CartContext";

type Props = {
  menuItemId: string;
  name: string;
  price: number;
  kitchenId: string;
  kitchenName: string;
};

export default function AddToCartButton({ menuItemId, name, price, kitchenId, kitchenName }: Props) {
  const { addItem, cart } = useCart();
  const inCart = cart.items.find((i) => i.menuItemId === menuItemId);

  return (
    <button onClick={() => addItem({ menuItemId, name, price, kitchenId, kitchenName })}
      className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0">
      {inCart ? `In cart (${inCart.quantity})` : "Add to Cart"}
    </button>
  );
}
