import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Forge — Private Athletic Club",
  description: "Exclusive luxury gym companion and performance tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased bg-bg text-text-primary"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

