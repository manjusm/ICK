import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ratingSchema = z.object({
  orderId: z.string(),
  menuItemId: z.string(),
  score: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = ratingSchema.parse(body);

    const order = await prisma.order.findUnique({ where: { id: data.orderId }, include: { items: true } });
    if (!order || order.customerId !== session.user.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.status !== "DELIVERED") {
      return NextResponse.json({ error: "Can only rate delivered orders" }, { status: 400 });
    }
    if (!order.items.some((i) => i.menuItemId === data.menuItemId)) {
      return NextResponse.json({ error: "Item not in this order" }, { status: 400 });
    }

    const existing = await prisma.rating.findUnique({
      where: { customerId_menuItemId_orderId: { customerId: session.user.id, menuItemId: data.menuItemId, orderId: data.orderId } },
    });
    if (existing) return NextResponse.json({ error: "Already rated" }, { status: 400 });

    const rating = await prisma.rating.create({
      data: { score: data.score, comment: data.comment, customerId: session.user.id, menuItemId: data.menuItemId, orderId: data.orderId },
    });
    return NextResponse.json(rating, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues }, { status: 400 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
