export type CartItem = {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  kitchenId: string;
  kitchenName: string;
};

export type CartState = {
  items: CartItem[];
  kitchenId: string | null;
  kitchenName: string | null;
};
