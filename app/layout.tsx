import type { Metadata } from "next";
import { Nunito, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
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

const BASE_URL = "https://levelupchemistry.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Level Up Chemistry — Master Organic Chemistry",
    template: "%s · Level Up Chemistry",
  },
  description:
    "A free Duolingo-style app for Class 11 & 12 students to master Organic Chemistry reactions. Practice MCQs, name reactions, mechanisms and pathways. Earn XP, collect cards, and climb the leaderboard.",
  keywords: [
    "organic chemistry",
    "class 11 chemistry",
    "class 12 chemistry",
    "chemistry practice",
    "name reactions",
    "reaction mechanisms",
    "chemistry app",
    "gamified learning",
    "CBSE chemistry",
    "chemistry quiz",
  ],
  authors: [{ name: "Prachi Gupta" }],
  creator: "Prachi Gupta",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon", sizes: "32x32", type: "image/png" },
      { url: "/icon", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
    shortcut: "/icon",
  },
  openGraph: {
    siteName: "Level Up Chemistry",
    type: "website",
    url: BASE_URL,
    title: "Level Up Chemistry — Master Organic Chemistry",
    description:
      "Free gamified Organic Chemistry practice for Class 11 & 12. Earn XP, unlock reaction cards, tackle boss levels and escape rooms.",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Level Up Chemistry — Master Organic Chemistry",
    description:
      "Free gamified Organic Chemistry practice for Class 11 & 12. Earn XP, unlock reaction cards, tackle boss levels and escape rooms.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
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
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-V6S5NQPMJN"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-V6S5NQPMJN');
        `}</Script>
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
        <BadgeRevealModal />
      </body>
    </html>
  );
}
