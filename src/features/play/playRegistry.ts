export type PlayGameId =
  | "find-leader"
  | "wavelength"
  | "blind-resume"
  | "blind-rank"
  | "keep-cut"
  | "better-than";

export interface PlayGameDefinition {
  id: PlayGameId;
  icon: string;
  title: string;
  description: string;
}

export const playGames: readonly PlayGameDefinition[] = [
  {
    id: "find-leader",
    icon: "#1",
    title: "Find the Leader",
    description: "Eliminate nine fighters without removing the verified stat leader.",
  },
  {
    id: "wavelength",
    icon: "≈",
    title: "Wavelength",
    description: "Find a hidden 1–100 rating through four adaptive UFC clues. Each clue reacts to your last guess.",
  },
  {
    id: "blind-resume",
    icon: "?",
    title: "Blind Resume",
    description: "Choose the stronger UFC career five times without seeing either fighter’s name.",
  },
  {
    id: "blind-rank",
    icon: "1–5",
    title: "Blind Rank 5",
    description: "Rank five mystery UFC fighters from 1–5. Once you place a fighter, that slot is locked.",
  },
  {
    id: "keep-cut",
    icon: "4/4",
    title: "Keep 4, Cut 4",
    description: "Make eight locked decisions without knowing which fighter is waiting at the end.",
  },
  {
    id: "better-than",
    icon: ">",
    title: "Better Than…",
    description: "Build a claim, choose your number, and name the exact fighters you can defend.",
  },
] as const;
