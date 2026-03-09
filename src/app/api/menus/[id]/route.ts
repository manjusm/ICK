import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const item = await prisma.menuItem.findUnique({ where: { id }, include: { kitchen: true } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (item.kitchen.ownerId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const updated = await prisma.menuItem.update({ where: { id }, data: body });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const item = await prisma.menuItem.findUnique({ where: { id }, include: { kitchen: true } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (item.kitchen.ownerId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await prisma.menuItem.delete({ where: { id } });
  return NextResponse.json({ message: "Item deleted" });
}
