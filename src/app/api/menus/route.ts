import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const menuItemSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(5),
  price: z.number().positive(),
  category: z.enum(["STARTER", "MAIN", "DESSERT", "BEVERAGE"]),
  imageUrl: z.string().url().optional().or(z.literal("")),
  kitchenId: z.string(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "KITCHEN_OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const data = menuItemSchema.parse(body);
    const kitchen = await prisma.cloudKitchen.findUnique({ where: { id: data.kitchenId } });
    if (!kitchen || kitchen.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const item = await prisma.menuItem.create({
      data: { name: data.name, description: data.description, price: data.price, category: data.category, imageUrl: data.imageUrl || null, kitchenId: data.kitchenId },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues }, { status: 400 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
