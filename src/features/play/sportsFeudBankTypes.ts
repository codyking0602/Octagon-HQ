import type { FamilyFeudEntityKind } from "../games/familyFeudEngine";

export type SportsFeudBankDomain = "ufc" | "nfl" | "cfb";

export interface SportsFeudAuthoredAnswer {
  name: string;
  aliases?: readonly string[];
}

export interface SportsFeudAuthoredQuestion {
  id: string;
  category: string;
  prompt: string;
  entityKind: FamilyFeudEntityKind;
  collisionGroup?: string;
  answers: readonly SportsFeudAuthoredAnswer[];
  alsoAcceptedAnswers?: readonly SportsFeudAuthoredAnswer[];
}
