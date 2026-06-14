import { reactionColorVar } from "@/lib/constants";
import type { BadgeWithState } from "@/lib/badges";

// Badge grid (Sprint 4 §4.3). Earned badges show in colour with the date earned;
// unearned show grayed out with their requirement text. Guests see every badge
// locked with a "sign up to earn" hint.

function requirementText(b: BadgeWithState): string {
  switch (b.requirementType) {
    case "reactions_completed":
      return `Complete ${b.requirementValue} reaction${b.requirementValue > 1 ? "s" : ""}`;
    case "correct_streak":
      return `${b.requirementValue} correct in a row`;
    case "streak_days":
      return `Maintain a ${b.requirementValue}-day streak`;
    case "level_reached":
      return `Reach Level ${b.requirementValue}`;
    case "cards_collected":
      return `Unlock ${b.requirementValue} reaction cards`;
    case "cards_collected_all":
      return "Collect every reaction card";
    case "boss_cleared":
      return "Clear a boss level";
    case "perfect_boss":
      return "Score 100% on a boss level";
    case "timed_score":
      return `Score ${b.requirementValue}+ in a timed challenge`;
    case "pathway_completed":
      return "Complete a pathway challenge";
    default:
      return b.description;
  }
}

function fmtDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function BadgeGrid({
  badges,
  isGuest,
}: {
  badges: BadgeWithState[];
  isGuest: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {badges.map((b) => {
        const earned = !isGuest && b.earnedAt != null;
        const accent = reactionColorVar(b.color);
        return (
          <div
            key={b.id}
            className={
              "flex flex-col items-center rounded-2xl border p-4 text-center transition-all " +
              (earned
                ? "border-border bg-card shadow-soft hover:-translate-y-0.5 hover:shadow-soft-lg"
                : "border-dashed border-border")
            }
            style={              earned
                ? { }
                : { backgroundColor: `#35c19f` }
            }
          >
            <div
              className={
                "flex h-16 w-16 items-center justify-center rounded-full text-3xl " +
                (earned ? "" : "grayscale")
              }
              style={
                earned
                  ? {
                      backgroundColor: `color-mix(in srgb, ${accent} 18%, transparent)`,
                    }
                  : { backgroundColor: "var(--muted)" }
              }
            >
              <span aria-hidden className={earned ? "" : "opacity-40"}>
                {b.icon ?? "🏅"}
              </span>
            </div>

            <h3
              className={
                "mt-3 text-sm font-extrabold tracking-tight " +
                (earned ? "" : "text-muted-foreground")
              }
            >
              {b.name}
            </h3>

            {earned ? (
              <p className="mt-1 text-xs font-bold text-primary">
                Earned {fmtDate(b.earnedAt!)}
              </p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">
                {isGuest ? "Sign up to earn badges" : requirementText(b)}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
