import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Level Up Chemistry — Master Organic Chemistry reactions through gamified practice";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0d1033 0%, #1a0566 50%, #3d0099 100%)",
          fontFamily: "sans-serif",
          padding: "60px",
        }}
      >
        {/* Logo area */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #00b3ff, #7c00ff, #ff00b3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="42"
              height="42"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2" />
              <path d="M6.453 15h11.094" />
              <path d="M8.5 2h7" />
            </svg>
          </div>
          <span
            style={{
              fontSize: "42px",
              fontWeight: 900,
              color: "#ffffff",
              letterSpacing: "-1px",
            }}
          >
            Level Up Chemistry
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: "56px",
            fontWeight: 900,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.15,
            marginBottom: "24px",
            maxWidth: "900px",
          }}
        >
          Master Organic Chemistry —{" "}
          <span style={{ color: "#00b3ff" }}>one reaction at a time</span>
        </div>

        {/* Sub */}
        <div
          style={{
            fontSize: "26px",
            color: "rgba(255,255,255,0.75)",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.4,
            marginBottom: "48px",
          }}
        >
          Earn XP · Collect Cards · Climb the Leaderboard · Free for all students
        </div>

        {/* Pills */}
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
          {["Practice Reactions", "Boss Levels", "Escape Room", "Timed Challenges"].map((label) => (
            <div
              key={label}
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: "100px",
                padding: "10px 24px",
                fontSize: "20px",
                color: "#ffffff",
                fontWeight: 700,
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* URL badge */}
        <div
          style={{
            position: "absolute",
            bottom: "36px",
            right: "52px",
            fontSize: "18px",
            color: "rgba(255,255,255,0.5)",
            fontWeight: 600,
          }}
        >
          levelupchemistry.vercel.app
        </div>
      </div>
    ),
    size
  );
}
