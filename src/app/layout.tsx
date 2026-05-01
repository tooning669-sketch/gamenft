import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Bubble Blast | Web3 Shooter Game",
  description: "Pop bubbles, earn rewards! A Web3-powered dart shooter mini-game with NFT rewards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased dark`}>
      <body className="min-h-full font-[family-name:var(--font-outfit)] bg-[#0a0e1a] text-white">
        {children}
      </body>
    </html>
  );
}
