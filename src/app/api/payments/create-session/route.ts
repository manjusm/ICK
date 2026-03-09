import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ orderId: z.string() });

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { orderId } = schema.parse(await req.json());
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { menuItem: true } }, kitchen: true },
    });
    if (!order || order.customerId !== session.user.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.stripePaymentId) {
      return NextResponse.json({ error: "Order already paid" }, { status: 400 });
    }

    const lineItems = order.items.map((item) => ({
      price_data: {
        currency: "sek",
        product_data: { name: item.menuItem.name, description: item.menuItem.description },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const checkoutSession = await getStripe().checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/cart`,
      metadata: { orderId, customerId: session.user.id },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues }, { status: 400 });
    console.error("Stripe session error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
