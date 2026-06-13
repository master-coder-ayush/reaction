import type { MetadataRoute } from "next";

// PWA manifest (Sprint 8 §8.9). Minimal install metadata. Served at
// /manifest.webmanifest and referenced from the root layout.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Level Up Chemistry",
    short_name: "LevelUp Chem",
    description:
      "Practise organic chemistry reactions, earn XP, collect cards, and climb the leaderboard.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#7c3aed",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
