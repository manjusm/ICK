import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  try {
    const event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    if (event.type === "checkout.session.completed") {
      const s = event.data.object;
      const orderId = s.metadata?.orderId;
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "CONFIRMED", stripePaymentId: s.payment_intent as string },
        });
      }
    }
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
  }
}
