import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const kitchenSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  cuisine: z.string().min(2),
  address: z.string().min(5),
  phone: z.string().min(5),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export async function GET() {
  const kitchens = await prisma.cloudKitchen.findMany({
    where: { isActive: true },
    include: {
      owner: { select: { name: true } },
      _count: { select: { menuItems: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(kitchens);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "KITCHEN_OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const data = kitchenSchema.parse(body);
    const kitchen = await prisma.cloudKitchen.create({
      data: { ...data, imageUrl: data.imageUrl || null, ownerId: session.user.id },
    });
    return NextResponse.json(kitchen, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
