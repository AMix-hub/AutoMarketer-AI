import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#0a0a14] text-gray-100 px-4 py-16 flex flex-col items-center justify-center">
      <div className="max-w-3xl mx-auto text-center">
        <span className="inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase rounded-full bg-violet-900/60 text-violet-300 mb-4">
          AI-Powered Marketing
        </span>
        <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-4">
          AutoMarketer&nbsp;AI
        </h1>
        <p className="text-gray-400 text-lg mb-8">
          Describe your product and get a full SEO blog article + 3 LinkedIn
          posts — instantly.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/sign-up"
            className="px-8 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-colors"
          >
            Get started free
          </Link>
          <Link
            href="/sign-in"
            className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
          >
            Sign in
          </Link>
        </div>
        <p className="mt-6 text-gray-500 text-sm">
          $49/month subscription · or buy credits · no commitment
        </p>
      </div>
    </main>
  );
}
