export type SportsFeudBankDomain = "ufc" | "nfl" | "cfb";

export interface SportsFeudAuthoredAnswer {
  name: string;
  aliases?: readonly string[];
}

export interface SportsFeudAuthoredQuestion {
  id: string;
  category: string;
  prompt: string;
  collisionGroup?: string;
  answers: readonly SportsFeudAuthoredAnswer[];
}
