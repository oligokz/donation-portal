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
  title: "Lotus Heart Temple | Online Donations",
  description:
    "Offer your gift securely to Lotus Heart Temple. Login with Singpass, choose a donation tier, and receive instant e-receipts.",
  openGraph: {
    title: "Lotus Heart Temple | Online Donations",
    description:
      "Support Lotus Heart Temple's community outreach and heritage. Authenticate with Singpass and complete your offering in minutes.",
    url: "https://donations.lotushearttemple.sg",
    siteName: "Lotus Heart Temple",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lotus Heart Temple | Online Donations",
    description:
      "Give securely via Singpass and support Lotus Heart Temple's prayers, community meals, and cultural festivals.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
