"use client";

import { useState } from "react";

export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCheckout(type: "subscription" | "credits") {
    setLoading(type);
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Something went wrong.");
      }
    } catch {
      alert("Something went wrong.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-3 text-center">
          Choose Your Plan
        </h1>
        <p className="text-gray-400 text-center mb-10">
          Unlock unlimited AI-powered marketing content.
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Monthly subscription */}
          <div className="bg-[#12121f] border border-violet-500/60 rounded-2xl p-6 shadow-xl flex flex-col">
            <div className="flex-1">
              <span className="inline-block px-2 py-0.5 text-xs font-semibold uppercase rounded-full bg-violet-900/60 text-violet-300 mb-3">
                Most popular
              </span>
              <h2 className="text-xl font-bold text-white mb-1">
                Monthly Subscription
              </h2>
              <p className="text-4xl font-extrabold text-violet-300 mb-1">
                $49
                <span className="text-lg font-normal text-gray-400">/mo</span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-400">
                <li>✅ Unlimited content generations</li>
                <li>✅ Full generation history</li>
                <li>✅ SEO blog articles & LinkedIn posts</li>
                <li>✅ Cancel anytime</li>
              </ul>
            </div>
            <button
              onClick={() => handleCheckout("subscription")}
              disabled={loading === "subscription"}
              className="mt-6 w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold transition-colors"
            >
              {loading === "subscription" ? "Redirecting…" : "Subscribe now"}
            </button>
          </div>

          {/* Credits pack */}
          <div className="bg-[#12121f] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col">
            <div className="flex-1">
              <span className="inline-block px-2 py-0.5 text-xs font-semibold uppercase rounded-full bg-gray-800 text-gray-400 mb-3">
                Pay as you go
              </span>
              <h2 className="text-xl font-bold text-white mb-1">
                10-Credit Pack
              </h2>
              <p className="text-4xl font-extrabold text-indigo-300 mb-1">
                $15
                <span className="text-lg font-normal text-gray-400">
                  {" "}
                  one-time
                </span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-400">
                <li>✅ 10 content generations</li>
                <li>✅ Full generation history</li>
                <li>✅ SEO blog articles & LinkedIn posts</li>
                <li>✅ Credits never expire</li>
              </ul>
            </div>
            <button
              onClick={() => handleCheckout("credits")}
              disabled={loading === "credits"}
              className="mt-6 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold transition-colors"
            >
              {loading === "credits" ? "Redirecting…" : "Buy 10 credits"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
