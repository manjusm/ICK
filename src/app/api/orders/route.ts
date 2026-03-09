import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const orderSchema = z.object({
  kitchenId: z.string(),
  items: z.array(z.object({ menuItemId: z.string(), quantity: z.number().int().positive() })),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { customerId: session.user.id },
    include: {
      kitchen: { select: { name: true } },
      items: { include: { menuItem: { select: { name: true, id: true } } } },
      ratings: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = orderSchema.parse(body);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: data.items.map((i) => i.menuItemId) }, kitchenId: data.kitchenId, isAvailable: true },
    });
    if (menuItems.length !== data.items.length) {
      return NextResponse.json({ error: "Some menu items are unavailable" }, { status: 400 });
    }
    const priceMap = new Map(menuItems.map((m) => [m.id, m.price]));
    let totalAmount = 0;
    const orderItems = data.items.map((item) => {
      const price = priceMap.get(item.menuItemId)!;
      totalAmount += price * item.quantity;
      return { menuItemId: item.menuItemId, quantity: item.quantity, price };
    });
    const order = await prisma.order.create({
      data: { customerId: session.user.id, kitchenId: data.kitchenId, totalAmount, items: { create: orderItems } },
      include: { items: { include: { menuItem: { select: { name: true } } } } },
    });
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues }, { status: 400 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
