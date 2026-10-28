import { describe, expect, it } from "vitest";
import { conciseFightPreview, conciseMatchupEdge, conciseUfcSpotlight, spotlightWithinEditorialLimits } from "./ufcSpotlightEditorial";

const longPreview = "Moicano's veteran Brazilian jiu-jitsu and chain-wrestling game faces Nolan's southpaw range striking and five-fight surge. Moicano must force clinch and mat exchanges, where his back-taking and submission experience can test Nolan's 58% takedown defense; Nolan's four-inch height and one-inch reach advantages, higher striking volume and body attacks can keep the contest at his preferred distance. A five-round fight will test Nolan's ability to sustain distance management against Moicano's positional pressure. Another speculative paragraph must never appear.";

describe("locked UFC Fight Spotlight editorial format", () => {
  it("keeps complete concise sentences and never cuts decimal statistics into fragments", () => {
    const short=conciseFightPreview(longPreview);
    expect(short.split(/\s+/).length).toBeLessThanOrEqual(75);
    expect(short).not.toContain("Another speculative");
    expect(conciseFightPreview("He lands 4.84 strikes per minute. That is the main edge.")).toBe("He lands 4.84 strikes per minute. That is the main edge.");
  });
  it("preserves source-provided tape data and limits wordy edges", () => {
    const spotlight={
      boutId:"moicano-nolan",preview:longPreview,
      red:{fighterSlug:"renato-moicano",record:"21-7-1",age:"37",height:"5'11",reach:"72",stance:"Orthodox",
        edges:["11 career submission wins and proven back-taking threat","1.68 takedowns per 15 minutes against Nolan's 58% takedown defense"]},
      blue:{fighterSlug:"tom-nolan",record:"11-1-0",age:"26",height:"6'3",reach:"73",stance:"Southpaw",
        edges:["Five consecutive wins with both striking and submission finishes"]},
      watchSpotlights:[],source:"UFCStats" as const,generatedAt:"2026-10-27T00:00:00Z",
    };
    const compact=conciseUfcSpotlight(spotlight);
    expect(compact.red.record).toBe(spotlight.red.record);
    expect(compact.blue.reach).toBe(spotlight.blue.reach);
    expect(compact.red.edges).toHaveLength(2);
    expect(compact.red.edges.every(x=>x.split(/\s+/).length<=9)).toBe(true);
    expect(compact.blue.edges.every(x=>x.length<=68)).toBe(true);
    expect(spotlightWithinEditorialLimits(compact)).toBe(true);
    expect(conciseMatchupEdge("Back-taking threat")).toBe("Back-taking threat");
  });
});
