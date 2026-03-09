import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const kitchen = await prisma.cloudKitchen.findUnique({
    where: { id },
    include: {
      owner: { select: { name: true } },
      menuItems: {
        where: { isAvailable: true },
        include: { ratings: { select: { score: true } } },
        orderBy: { category: "asc" },
      },
    },
  });
  if (!kitchen) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(kitchen);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const kitchen = await prisma.cloudKitchen.findUnique({ where: { id } });
  if (!kitchen) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (kitchen.ownerId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const updated = await prisma.cloudKitchen.update({ where: { id }, data: body });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const kitchen = await prisma.cloudKitchen.findUnique({ where: { id } });
  if (!kitchen) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (kitchen.ownerId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await prisma.cloudKitchen.delete({ where: { id } });
  return NextResponse.json({ message: "Kitchen deleted" });
}
