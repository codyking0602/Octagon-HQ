import { describe, expect, it } from "vitest";
import actions from "../../styles/nba-game-actions.css?raw";
import higherLower from "../../styles/nba-higher-lower.css?raw";
import nbaWhoAmI from "../play/NbaWhoAmIPage.tsx?raw";
import nbaHit from "./NbaHitTheNumberPage.tsx?raw";
import nbaLeader from "./NbaFindTheLeaderPage.tsx?raw";
import nbaHigher from "./NbaHigherLowerPage.tsx?raw";

describe("NBA-only replay actions and sport accents", () => {
  it("all completed NBA games load the same scoped replay palette", () => {
    for (const source of [nbaWhoAmI, nbaHit, nbaLeader, nbaHigher]) {
      expect(source).toContain('nba-game-actions.css');
    }
    expect(actions).toContain('.who-am-i-page[data-sport="nba"]');
    expect(actions).toContain('.nba-hit-number-page');
    expect(actions).toContain('.nba-find-leader-page');
    expect(actions).toContain('.nba-higher-lower .game-result-actions > .primary-action');
    expect(actions).toContain('.find-secondary-action:nth-child(2)');
    expect(actions).toContain('background: linear-gradient(115deg, #d98c31, #f2b65c)');
  });
  it("uses bronze and charcoal without changing Football's styling", () => {
    expect(higherLower).toContain('--hl-blue: #e9a84b');
    expect(higherLower).toContain('background: #644322');
    expect(higherLower).toContain('transform: translateY(12px) scale(1.18)');
  });
});
