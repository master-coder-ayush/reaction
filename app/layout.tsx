import type { Metadata } from "next";
import { Nunito, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { BadgeRevealModal } from "@/components/BadgeRevealModal";

// Nunito is the rounded, playful typeface that gives the app its Duolingo feel.
const nunito = Nunito({
  variable: "--font-sans-app",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono-app",
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
      className={`${nunito.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
        <BadgeRevealModal />
      </body>
    </html>
  );
}
