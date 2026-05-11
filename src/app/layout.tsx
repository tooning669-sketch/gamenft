import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full bg-[#0786a0] text-white">
        {children}
      </body>
    </html>
  );
}
