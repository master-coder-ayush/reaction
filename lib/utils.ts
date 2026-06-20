/**
 * Minimal className combiner — joins truthy class strings.
 * (Avoids pulling in clsx/tailwind-merge for Sprint 1's small UI surface.)
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Masks the part of an equation that gives away the answer.
 * reagent:  replaces the " + X" term (or arrow condition) with " + ?"
 * product:  replaces everything after the arrow with "?"
 * reactant: replaces the substrate (before "+") with "?"
 * name:     unchanged (equation is the clue)
 */
export function maskEquation(
  equationText: string,
  _correctAnswerText: string,
  questionType: string,
): string {
  if (questionType === "name") return equationText;

  // Condition block attached to the arrow — two formats:
  //   --conditions-->   e.g. --alc. KOH-->   --[O]-->   --CaO,Δ-->
  //   —(conditions)→   e.g. —(conc. H₂SO₄, 443 K)→
  // We capture the condition text separately so we can mask it.
  // The bare arrow chars that follow: →, ⟶, >, ->, =>
  const arrowRe =
    /\s*((?:--[^-→>⟶][^→>⟶]*?-*|[—─]\([^)]*\))\s*)?[-=]*[→>⟶]\s*/;

  const arrowMatch = equationText.match(arrowRe);
  if (!arrowMatch || arrowMatch.index == null) return equationText;

  const leftSide = equationText.slice(0, arrowMatch.index);
  const fullArrow = arrowMatch[0];          // e.g. " —(conc. H₂SO₄, 443 K)→ "
  const hasCondition = !!arrowMatch[1];     // true if condition block present
  const rightSide = equationText.slice(arrowMatch.index + fullArrow.length);

  if (questionType === "product") {
    return leftSide + fullArrow + "?";
  }

  const plusIdx = leftSide.indexOf(" + ");

  if (plusIdx === -1) {
    // Reagent is embedded in the arrow condition (no explicit " + " on left).
    if (questionType === "reagent") {
      if (hasCondition) {
        // Replace the condition block with "(?)" keeping the arrow char.
        const maskedArrow = fullArrow
          .replace(/--[^-→>⟶][^→>⟶]*?-*(?=\s*[→>⟶])/, "--?--")
          .replace(/[—─]\([^)]*\)/, "(?)");
        return leftSide + maskedArrow + rightSide;
      }
      // Bare arrow, no condition — nothing to mask; show as-is
      return equationText;
    }
    // reactant with no "+": mask the whole left side
    return "?" + fullArrow + rightSide;
  }

  const substrate = leftSide.slice(0, plusIdx);
  const reagentPart = leftSide.slice(plusIdx + 3);

  if (questionType === "reactant") {
    return "? + " + reagentPart + fullArrow + rightSide;
  }

  // reagent with explicit " + ": mask the reagent term; strip arrow condition
  const bareArrow = hasCondition
    ? fullArrow.replace(/(?:--[^-→>⟶][^→>⟶]*?-*|[—─]\([^)]*\))\s*/, "")
    : fullArrow;
  return substrate + " + ?" + bareArrow + rightSide;
}
