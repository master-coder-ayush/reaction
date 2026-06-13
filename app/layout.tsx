import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { BadgeRevealModal } from "@/components/BadgeRevealModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://levelupchemistry.in"),
  title: {
    default: "Level Up Chemistry",
    template: "%s · Level Up Chemistry",
  },
  description:
    "A Duolingo-style organic chemistry app — practise reactions, earn XP, collect cards, and climb the leaderboard.",
  manifest: "/manifest.webmanifest",
  openGraph: {
    siteName: "Level Up Chemistry",
    type: "website",
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
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
        <BadgeRevealModal />
      </body>
    </html>
  );
}
