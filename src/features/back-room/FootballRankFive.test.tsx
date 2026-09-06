import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import FootballRankFivePage from "./FootballRankFivePage";
import { footballSubjectAssetPath } from "./FootballSubjectVisual";
import {
  footballGreatnessTierForItem,
  footballGreatnessTierLabel,
} from "./footballGreatnessTier";
import {
  getFootballRankFivePack as getReviewedCatalogPack,
  type FootballRankFivePackId,
} from "./footballRankFiveModel";
import {
  buildFootballRankFiveLineup,
  footballRankFivePacks,
  getFootballReviewedRankFivePack,
} from "./footballRankFivePlayableModel";

vi.mock("../challenges/ChallengeProvider", () => ({
  usePlayChallenges: () => ({ beginChallenge: vi.fn(async () => "") }),
}));

vi.mock("../challenges/challengeRuntime", () => ({
  useProfileChallengeMatch: () => ({
    code: "",
    challenge: null,
    creator: null,
    isRecipient: false,
    activeProfile: null,
    submitResult: vi.fn(),
  }),
}));

const RETIRED_PACK_IDS = [
  "nfl-defensive-players",
  "nfl-qb-seasons",
  "nfl-team-seasons",
  "college-programs",
  "college-team-seasons",
] as const;

describe("Football Blind Rank 5", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("owns the live deep comparison universe across both leagues", () => {
    expect(footballRankFivePacks).toHaveLength(12);
    expect(footballRankFivePacks.filter((pack) => pack.items.every((item) => item.league === "NFL"))).toHaveLength(8);
    expect(footballRankFivePacks.filter((pack) => pack.items.every((item) => item.league === "CFB"))).toHaveLength(4);

    const subjects = footballRankFivePacks.flatMap((pack) => pack.items);
    expect(subjects.length).toBeGreaterThanOrEqual(350);

    for (const pack of footballRankFivePacks) {
      // The shared comparison authority guarantees eight playable subjects per supported pack;
      // PR10 must preserve that exact post-gate runtime floor rather than invent a second threshold.
      expect(pack.items.length).toBeGreaterThanOrEqual(8);
      expect(new Set(pack.items.map((item) => item.id)).size).toBe(pack.items.length);
      expect(pack.items.every((item) => Number.isInteger(item.rating) && item.rating >= 0 && item.rating <= 100)).toBe(true);
      expect(pack.items.every((item) => (
        /^TIER \d+$/.test(footballGreatnessTierLabel(footballGreatnessTierForItem(item), pack.items))
      ))).toBe(true);
    }

    const liveReceivers = footballRankFivePacks.find((pack) => pack.id === "nfl-wide-receivers")!;
    const reviewedReceivers = getFootballReviewedRankFivePack("nfl-wide-receivers");
    expect(liveReceivers.items.length).toBeGreaterThan(reviewedReceivers.items.length);
    expect(liveReceivers.items.some((item) => !reviewedReceivers.items.some((reviewed) => reviewed.id === item.id))).toBe(true);
  });

  it("does not resolve retired categories as hidden Rank Five packs", () => {
    for (const packId of RETIRED_PACK_IDS) {
      expect(() => getReviewedCatalogPack(packId as FootballRankFivePackId)).toThrow(
        `Unsupported Football Rank 5 pack: ${packId}`,
      );
    }
  });

  it("builds deterministic five-item lineups with non-flat category-relative separation", () => {
    for (const pack of footballRankFivePacks) {
      const first = buildFootballRankFiveLineup(pack.id, "rank-five-proof");
      const second = buildFootballRankFiveLineup(pack.id, "rank-five-proof");
      expect(first.map((item) => item.id)).toEqual(second.map((item) => item.id));
      expect(first).toHaveLength(5);
      expect(new Set(first.map((item) => item.id)).size).toBe(5);
      const ratings = first.map((item) => item.rating);
      expect(Math.max(...ratings) - Math.min(...ratings)).toBeGreaterThan(0);
    }
  });

  it("actually exposes non-legacy canonical receivers in playable Blind Rank boards", () => {
    const reviewedIds = new Set(
      getFootballReviewedRankFivePack("nfl-wide-receivers").items.map((item) => item.id),
    );
    let exposed = false;
    for (let index = 0; index < 96 && !exposed; index += 1) {
      exposed = buildFootballRankFiveLineup("nfl-wide-receivers", `deep-rank-wr-${index}`)
        .some((item) => !reviewedIds.has(item.id));
    }
    expect(exposed).toBe(true);
  });

  it("uses one canonical football asset path convention for the expanded packs", () => {
    expect(footballSubjectAssetPath("patrick-mahomes", "nfl-quarterbacks"))
      .toBe("/images/football/players/patrick-mahomes.webp");
    expect(footballSubjectAssetPath("jerry-rice", "nfl-wide-receivers"))
      .toBe("/images/football/players/jerry-rice.webp");
    expect(footballSubjectAssetPath("lawrence-taylor", "nfl-front-seven"))
      .toBe("/images/football/players/lawrence-taylor.webp");
    expect(footballSubjectAssetPath("nfl-era-patriots-belichick-brady", "nfl-team-eras"))
      .toBe("/images/football/teams/nfl-era-patriots-belichick-brady.webp");
    expect(footballSubjectAssetPath("nick-saban-cfb", "college-head-coaches"))
      .toBe("/images/football/coaches/nick-saban-cfb.webp");
    expect(footballSubjectAssetPath("alabama-2009-2020", "college-program-eras"))
      .toBe("/images/football/programs/alabama-2009-2020.webp");
  });

  it("locks all five placements and reveals the final score and canonical tiers", () => {
    render(
      <MemoryRouter>
        <FootballRankFivePage />
      </MemoryRouter>,
    );

    expect(screen.getByText("BLIND RANK 5")).toBeInTheDocument();
    for (let rank = 1; rank <= 5; rank += 1) {
      fireEvent.click(screen.getByRole("button", { name: `Place current item at rank ${rank}` }));
    }

    expect(screen.getByLabelText("Football Blind Rank 5 score")).toHaveTextContent("/100");
    expect(screen.getByText("YOUR FINAL RANKING")).toBeInTheDocument();
    expect(screen.getByText("FOOTBALL HQ TIERS")).toBeInTheDocument();
    expect(screen.getByText(/Same-tier swaps do not cost points/i)).toBeInTheDocument();
    expect(screen.queryByText("FOOTBALL HQ ORDER")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "PLAY AGAIN" })).toBeInTheDocument();
  });
});