import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a14] text-gray-100">
      <header className="border-b border-white/10 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-lg font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent"
          >
            AutoMarketer AI
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/dashboard"
              className="text-gray-400 hover:text-gray-100 transition-colors"
            >
              Generate
            </Link>
            <Link
              href="/history"
              className="text-gray-400 hover:text-gray-100 transition-colors"
            >
              History
            </Link>
            <Link
              href="/billing"
              className="text-gray-400 hover:text-gray-100 transition-colors"
            >
              Billing
            </Link>
            <UserButton />
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
