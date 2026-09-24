import { describe, expect, it } from "vitest";
import footballPlaySource from "../back-room/FootballBackRoomPage.tsx?raw";
import routerSource from "../../app/router.tsx?raw";
import ufcPlaySource from "./TodayChallengeHubPage.tsx?raw";

describe("Sports Feud Casual owner preview retirement", () => {
  it("keeps the owner preview off both live Casual game libraries", () => {
    expect(ufcPlaySource).not.toContain("familyFeudVisible");
    expect(ufcPlaySource).not.toContain("isFamilyFeudPrototypeOwner");
    expect(footballPlaySource).not.toContain("familyFeudVisible");
    expect(footballPlaySource).not.toContain("isFamilyFeudPrototypeOwner");
  });

  it("preserves the official Sports Feud Daily routes and isolates the owner QA replay", () => {
    expect(routerSource).toContain('path: "play/sports-feud"');
    expect(routerSource).toContain('gameType="sports_feud"');
    expect(routerSource).toContain('path: "football/sports-feud"');
    expect(routerSource).toContain('path: "play/sports-feud/qa-replay"');
    expect(routerSource).toContain('qaReplayDay="2026-09-24"');
  });
});
