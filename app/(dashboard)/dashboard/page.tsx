import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import GenerateClient from "../GenerateClient";
import Link from "next/link";

async function getOrCreateUser(clerkId: string, email: string) {
  return prisma.user.upsert({
    where: { clerkId },
    update: { email },
    create: { clerkId, email },
  });
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? "";
  const user = await getOrCreateUser(userId, email);

  const hasAccess =
    user.subscriptionStatus === "active" || user.credits > 0;

  return (
    <main className="px-4 py-12">
      <div className="max-w-3xl mx-auto text-center mb-10">
        <span className="inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase rounded-full bg-violet-900/60 text-violet-300 mb-4">
          AI-Powered Marketing
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-3">
          Generate Marketing Content
        </h1>
        <p className="text-gray-400">
          Describe your product and get a full SEO blog article + 3 LinkedIn
          posts — instantly.
        </p>
      </div>

      {!hasAccess ? (
        <div className="max-w-3xl mx-auto bg-[#12121f] border border-violet-500/40 rounded-2xl p-8 text-center shadow-xl">
          <p className="text-violet-300 font-semibold text-lg mb-2">
            No active subscription or credits
          </p>
          <p className="text-gray-400 text-sm mb-6">
            Subscribe for $49/month or buy credits to start generating content.
          </p>
          <Link
            href="/billing"
            className="inline-block px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
          >
            View plans
          </Link>
        </div>
      ) : (
        <GenerateClient
          credits={user.credits}
          isSubscribed={user.subscriptionStatus === "active"}
        />
      )}
    </main>
  );
}
