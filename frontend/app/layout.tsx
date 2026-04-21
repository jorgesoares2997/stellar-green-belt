import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StellarVault | Secure Yield on Stellar",
  description: "Maximize your USDC returns with StellarVault. Secure, transparent, and optimized yield strategies built on the Stellar network for the Green Belt challenge.",
  keywords: ["Stellar", "DeFi", "Vault", "USDC", "Yield", "Green Belt", "Blockchain", "Soroban"],
  authors: [{ name: "Stellar Green Belt Team" }],
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
