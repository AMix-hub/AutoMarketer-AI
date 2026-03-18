import type { Metadata } from "next";
import "./globals.css";
import ProfileImage from "./components/ProfileImage";

export const metadata: Metadata = {
  title: "AutoMarketer AI",
  description:
    "Generate SEO blog articles and LinkedIn posts with AI in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-end px-6 py-3 bg-[#0a0a14]/80 backdrop-blur border-b border-white/5">
          <ProfileImage />
        </header>
        <div className="pt-16">{children}</div>
      </body>
    </html>
  );
}
