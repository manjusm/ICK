import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "KITCHEN_OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const kitchen = await prisma.cloudKitchen.findFirst({ where: { ownerId: session.user.id } });
  if (!kitchen) return NextResponse.json({ kitchen: null, menuItems: [], orders: [] });

  const menuItems = await prisma.menuItem.findMany({
    where: { kitchenId: kitchen.id }, orderBy: { createdAt: "desc" },
  });

  const orders = await prisma.order.findMany({
    where: { kitchenId: kitchen.id },
    include: {
      customer: { select: { name: true, email: true } },
      items: { include: { menuItem: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ kitchen, menuItems, orders });
}
