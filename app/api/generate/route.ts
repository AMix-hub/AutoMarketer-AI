import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
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
      // Fallback: return raw text as the blog article if JSON parsing fails
      parsed = {
        blogArticle: raw,
        linkedinPosts: [],
      };
    }

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    console.error("[/api/generate]", err);
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
