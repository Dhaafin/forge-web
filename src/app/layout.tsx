import type { Metadata } from "next";
import { Bebas_Neue, Inter, DM_Mono } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const dmMono = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
});

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
      className={`${bebasNeue.variable} ${inter.variable} ${dmMono.variable} h-full antialiased bg-bg text-text-primary`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}


