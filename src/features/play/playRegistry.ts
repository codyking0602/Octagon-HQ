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
    description: "Make four guesses. Each new UFC clue adjusts to your last answer.",
  },
  {
    id: "blind-resume",
    icon: "?",
    title: "Blind Resume",
    description: "Choose the stronger UFC-only career five times without seeing either fighter’s name.",
  },
  {
    id: "blind-rank",
    icon: "1–5",
    title: "Blind Rank 5",
    description: "Place five UFC fighters one at a time. Every slot locks before the next reveal.",
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
