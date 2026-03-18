import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import type { Generation } from "../../generated/prisma/client";

export default async function HistoryPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/dashboard");

  const generations = await prisma.generation.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main className="px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-8">
          Generation History
        </h1>

        {generations.length === 0 ? (
          <div className="bg-[#12121f] border border-white/10 rounded-2xl p-8 text-center">
            <p className="text-gray-400">No generations yet. Start creating!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {generations.map((gen: Generation) => {
              let posts: string[] = [];
              try {
                posts = JSON.parse(gen.linkedinPosts);
              } catch {
                posts = [];
              }

              return (
                <details
                  key={gen.id}
                  className="bg-[#12121f] border border-white/10 rounded-2xl shadow-xl group"
                >
                  <summary className="cursor-pointer px-6 py-4 flex items-center justify-between gap-4 list-none select-none">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">
                        {gen.prompt}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(gen.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className="text-gray-500 group-open:rotate-90 transition-transform text-sm">
                      ▶
                    </span>
                  </summary>

                  <div className="px-6 pb-6 space-y-4 border-t border-white/10 pt-4">
                    <section>
                      <h3 className="text-sm font-bold text-violet-300 mb-2 flex items-center gap-2">
                        <span>📝</span> SEO Blog Article
                      </h3>
                      <pre className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed font-sans bg-[#1c1c2e] rounded-xl p-4">
                        {gen.blogArticle}
                      </pre>
                    </section>

                    {posts.length > 0 && (
                      <section>
                        <h3 className="text-sm font-bold text-violet-300 mb-2 flex items-center gap-2">
                          <span>💼</span> LinkedIn Posts
                        </h3>
                        <div className="space-y-3">
                          {posts.map((post, i) => (
                            <div
                              key={i}
                              className="bg-[#1c1c2e] border border-white/10 rounded-xl p-4"
                            >
                              <p className="text-xs font-semibold text-violet-400 mb-1">
                                Post {i + 1}
                              </p>
                              <pre className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed font-sans">
                                {post}
                              </pre>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
