import { Card } from "@/components/ui/card";

export type StreakCardProps = {
  streakCurrent: number;
  streakFreezeCount: number;
  /** Whether the user has already completed a reaction today. */
  doneToday: boolean;
  /** Whether the streak has been broken (a day was missed). */
  broken: boolean;
  /** Whether a freeze is available to rescue a broken streak. */
  canFreeze: boolean;
};

/**
 * Dashboard streak card (Sprint 2 §2.2, §2.6). Logged-in only — guests never
 * see this (streaks require an account across days). Renders three states:
 * healthy streak, "keep it alive today", and "Streak lost 😔" + freeze prompt.
 */
export function StreakCard({
  streakCurrent,
  streakFreezeCount,
  doneToday,
  broken,
  canFreeze,
}: StreakCardProps) {
  if (broken) {
    return (
      <Card className="border-destructive/40">
        <div className="text-lg font-semibold">Streak lost 😔</div>
        <p className="mt-1 text-sm text-muted-foreground">
          {canFreeze
            ? `You missed a day — but you have ${streakFreezeCount} streak freeze${
                streakFreezeCount === 1 ? "" : "s"
              }. Complete a reaction today to use one and save your streak.`
            : "You missed a day and your streak reset. Complete today's reaction to start a new one!"}
        </p>
        {canFreeze && (
          <button
            type="button"
            className="mt-3 inline-flex h-9 items-center rounded-lg border border-input bg-background px-3 text-sm font-medium hover:bg-muted"
          >
            ❄️ Use a streak freeze
          </button>
        )}
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl">🔥</span>
        <span className="text-lg font-semibold">
          {streakCurrent}-day streak
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {doneToday
          ? "Nice — today's reaction is done. See you tomorrow!"
          : "Complete today's reaction to keep it alive!"}
      </p>
      {streakFreezeCount > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          ❄️ {streakFreezeCount} streak freeze
          {streakFreezeCount === 1 ? "" : "s"} banked
        </p>
      )}
    </Card>
  );
}
