import type { MetadataRoute } from "next";

const BASE = "https://levelupchemistry.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const static_pages = [
    { url: BASE, priority: 1.0 },
    { url: `${BASE}/learn`, priority: 0.9 },
    { url: `${BASE}/timed`, priority: 0.8 },
    { url: `${BASE}/escape-room`, priority: 0.8 },
    { url: `${BASE}/leaderboard`, priority: 0.7 },
    { url: `${BASE}/cards`, priority: 0.7 },
    { url: `${BASE}/badges`, priority: 0.6 },
    { url: `${BASE}/reference`, priority: 0.6 },
    { url: `${BASE}/about`, priority: 0.5 },
  ];

  return static_pages.map(({ url, priority }) => ({
    url,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority,
  }));
}
