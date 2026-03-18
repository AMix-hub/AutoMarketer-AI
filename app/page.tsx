"use client";

import { useState } from "react";

interface GenerateResult {
  blogArticle: string;
  linkedinPosts: string[];
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 text-violet-400"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Server error ${res.status}`);
      }

      const data: GenerateResult = await res.json();
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a14] text-gray-100 px-4 py-16">
      {/* Hero */}
      <div className="max-w-3xl mx-auto text-center mb-12">
        <span className="inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase rounded-full bg-violet-900/60 text-violet-300 mb-4">
          AI-Powered Marketing
        </span>
        <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-4">
          AutoMarketer&nbsp;AI
        </h1>
        <p className="text-gray-400 text-lg">
          Describe your product and get a full SEO blog article + 3 LinkedIn
          posts — instantly.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto bg-[#12121f] border border-white/10 rounded-2xl p-6 shadow-xl"
      >
        <label
          htmlFor="prompt"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Product description
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. A SaaS tool that automates social-media scheduling for small businesses…"
          rows={4}
          className="w-full rounded-xl bg-[#1c1c2e] border border-white/10 text-gray-100 placeholder-gray-600 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          disabled={loading}
        />
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
          >
            {loading && <Spinner />}
            {loading ? "Generating…" : "Generate content"}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="max-w-3xl mx-auto mt-6 p-4 rounded-xl bg-red-900/30 border border-red-700/50 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="max-w-3xl mx-auto mt-8 space-y-6">
          {/* Blog Article */}
          <section className="bg-[#12121f] border border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-violet-300 mb-4 flex items-center gap-2">
              <span>📝</span> SEO Blog Article
            </h2>
            <div className="prose prose-invert prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed font-sans">
                {result.blogArticle}
              </pre>
            </div>
          </section>

          {/* LinkedIn Posts */}
          <section className="bg-[#12121f] border border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-violet-300 mb-4 flex items-center gap-2">
              <span>💼</span> LinkedIn Posts
            </h2>
            <div className="space-y-4">
              {result.linkedinPosts.map((post, i) => (
                <div
                  key={i}
                  className="bg-[#1c1c2e] border border-white/10 rounded-xl p-4"
                >
                  <p className="text-xs font-semibold text-violet-400 mb-2">
                    Post {i + 1}
                  </p>
                  <pre className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed font-sans">
                    {post}
                  </pre>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
