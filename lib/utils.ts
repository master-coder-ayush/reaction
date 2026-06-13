/**
 * Minimal className combiner — joins truthy class strings.
 * (Avoids pulling in clsx/tailwind-merge for Sprint 1's small UI surface.)
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
