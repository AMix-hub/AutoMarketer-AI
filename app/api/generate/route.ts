import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "../../../lib/prisma";
import type { Prisma } from "../../generated/prisma/client";

export async function POST(req: NextRequest) {
  // Require authentication
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Fetch user record
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  // Check access: active subscription OR credits remaining
  const hasAccess = user.subscriptionStatus === "active" || user.credits > 0;
  if (!hasAccess) {
    return NextResponse.json(
      { error: "No active subscription or credits. Please visit /billing." },
      { status: 403 }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key is not configured." },
      { status: 500 }
    );
  }

  const openai = new OpenAI({ apiKey });

  try {
    const body = await req.json();
    const prompt: string = body?.prompt ?? "";

    if (!prompt.trim()) {
      return NextResponse.json(
        { error: "Prompt is required." },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert marketing copywriter and SEO specialist.
Given a product description, you will produce:
1. A detailed SEO blog article (≈600 words) with a compelling title, introduction, 3–4 subheadings, and a conclusion.
2. Exactly 3 LinkedIn posts (each 100–150 words) that are engaging, professional and include relevant hashtags.

Respond with valid JSON matching this exact structure (no markdown code fences):
{
  "blogArticle": "<full article text>",
  "linkedinPosts": ["<post 1>", "<post 2>", "<post 3>"]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Product description: ${prompt}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    let parsed: { blogArticle: string; linkedinPosts: string[] };
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {
        blogArticle: raw,
        linkedinPosts: [],
      };
    }

    // Save generation to database and deduct credit if not subscribed
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.generation.create({
        data: {
          userId: user.id,
          prompt,
          blogArticle: parsed.blogArticle,
          linkedinPosts: JSON.stringify(parsed.linkedinPosts),
        },
      });

      if (user.subscriptionStatus !== "active" && user.credits > 0) {
        await tx.user.update({
          where: { id: user.id },
          data: { credits: { decrement: 1 } },
        });
      }
    });

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    console.error("[/api/generate]", err);
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
