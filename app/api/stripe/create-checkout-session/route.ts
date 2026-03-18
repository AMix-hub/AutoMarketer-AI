import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { stripe } from "../../../../lib/stripe";
import { prisma } from "../../../../lib/prisma";

const MONTHLY_PRICE_ID = process.env.STRIPE_MONTHLY_PRICE_ID!;
const CREDITS_PRICE_ID = process.env.STRIPE_CREDITS_PRICE_ID!;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await req.json();
  const type: "subscription" | "credits" = body.type;

  if (type !== "subscription" && type !== "credits") {
    return NextResponse.json({ error: "Invalid type." }, { status: 400 });
  }

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? "";

  let user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) {
    user = await prisma.user.create({ data: { clerkId: userId, email } });
  }

  // Get or create a Stripe customer
  let customerId = user.stripeCustomerId ?? undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email,
      metadata: { clerkId: userId },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  if (type === "subscription") {
    if (!MONTHLY_PRICE_ID) {
      return NextResponse.json(
        { error: "Subscription price not configured." },
        { status: 500 }
      );
    }
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: MONTHLY_PRICE_ID, quantity: 1 }],
      success_url: `${baseUrl}/dashboard?payment=success`,
      cancel_url: `${baseUrl}/billing`,
      metadata: { clerkId: userId },
    });
    return NextResponse.json({ url: session.url });
  } else {
    if (!CREDITS_PRICE_ID) {
      return NextResponse.json(
        { error: "Credits price not configured." },
        { status: 500 }
      );
    }
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      line_items: [{ price: CREDITS_PRICE_ID, quantity: 1 }],
      success_url: `${baseUrl}/dashboard?payment=success`,
      cancel_url: `${baseUrl}/billing`,
      metadata: { clerkId: userId, creditsToAdd: "10" },
    });
    return NextResponse.json({ url: session.url });
  }
}
