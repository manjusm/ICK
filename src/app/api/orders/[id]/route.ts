import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const order = await prisma.order.findUnique({ where: { id }, include: { kitchen: true } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const isOwner = order.kitchen.ownerId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const updated = await prisma.order.update({ where: { id }, data: { status: body.status } });
  return NextResponse.json(updated);
}
