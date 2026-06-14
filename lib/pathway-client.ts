// Client-safe pathway constants and types — no DB imports.

export type PathwayStepDTO = {
  stepOrder: number;
  compoundName: string;
  reagentUsed: string | null;
  reactionTypeColor: string | null;
};

export type PathwayDTO = {
  id: number;
  name: string;
  description: string | null;
  steps: PathwayStepDTO[];
  startCompound: string;
  endCompound: string;
};

export const PATHWAY_STEP_XP = 20;
export const PATHWAY_COMPLETE_XP = 80;
