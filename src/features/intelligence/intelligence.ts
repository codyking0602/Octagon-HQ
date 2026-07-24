import type { RankingFighter } from "../rankings/rankingModel";

export const OCTAGON_VERDICT_URL = "https://chatgpt.com/g/g-6a4c40425d4881919ddebc7231bff09f-octagon-verdict";

export const starterPrompts = [
  "Who is the best UFC fighter never to win undisputed gold?",
  "What would Islam Makhachev need to reach the top three?",
  "Who has the best prime outside the current top 10?",
  "Which active fighter has the clearest path to the all-time top 10?",
  "Which fighter’s clean record hides a lack of career volume?",
  "Why is Alexandre Pantoja’s quality-of-wins ranking lower than expected?",
] as const;

export function matchupPrompt(firstFighter: string, secondFighter: string) {
  return `Compare ${firstFighter} and ${secondFighter} as UFC-only GOAT candidates.`;
}

export function whyPromptFor(fighter: RankingFighter) {
  const rankText = fighter.board === "women"
    ? `#${fighter.rank} on the women’s all-time board`
    : `#${fighter.rank} all-time`;
  const finalQuestion = fighter.rank === 1
    ? "Explain why the fighter is the benchmark and why the fighter should not be ranked lower."
    : "Explain why the fighter is not ranked higher.";

  return `Why is ${fighter.name} ranked ${rankText} in this UFC-only GOAT model? Break down Championship, Opponent Quality, Prime Dominance, Longevity, Peak Apex, and Loss Context. Explain the key judgment calls, why the fighter ranks here, and ${finalQuestion}`;
}

export async function copyText(value: string) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (!clean) return false;

  try {
    if (typeof navigator !== "undefined" && navigator.clipboard && typeof window !== "undefined" && window.isSecureContext) {
      await navigator.clipboard.writeText(clean);
      return true;
    }
  } catch {
    // Fall through to the selection-based clipboard fallback.
  }

  if (typeof document === "undefined") return false;
  try {
    const textarea = document.createElement("textarea");
    textarea.value = clean;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    return copied;
  } catch {
    return false;
  }
}
