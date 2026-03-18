import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
