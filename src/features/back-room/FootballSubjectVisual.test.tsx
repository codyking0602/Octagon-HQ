import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { footballRankFivePacks } from "./footballRankFiveModel";
import { footballSubjectAsset, footballSubjectAssets, footballTeamAssets } from "./footballSubjectAssets";
import { getFootballSubject } from "./footballSubjectRegistry";
import { FootballSubjectVisual } from "./FootballSubjectVisual";

describe("Football subject visuals", () => {
  it("covers every current Football comparison subject through the one canonical media resolver", () => {
    const subjects = footballRankFivePacks.flatMap((pack) => pack.items.map((item) => ({ item, pack })));
    expect(subjects).toHaveLength(350);

    for (const { item } of subjects) {
      const asset = footballSubjectAsset(item.id);
      expect(asset, item.id).toBeDefined();
      expect(asset?.src).toMatch(/^https:\/\/a\.espncdn\.com\/i\/teamlogos\//);
      expect(asset?.label.length).toBeGreaterThan(1);
    }
  });

  it("uses NFL team marks for NFL subjects and college program marks for CFB subjects", () => {
    for (const pack of footballRankFivePacks) {
      for (const item of pack.items) {
        expect(footballSubjectAsset(item.id)?.kind).toBe(item.league === "NFL" ? "team-mark" : "program-mark");
      }
    }
  });

  it("normalizes historical Alabama seasons onto one canonical team media identity", () => {
    const ids = ["2011-alabama", "2017-alabama", "2020-alabama"] as const;
    expect(ids.map((id) => getFootballSubject(id)?.teamId)).toEqual([
      "cfb:alabama",
      "cfb:alabama",
      "cfb:alabama",
    ]);

    const assets = ids.map((id) => footballSubjectAsset(id));
    expect(assets.every((asset) => asset === footballTeamAssets["cfb:alabama"])).toBe(true);
    expect(footballTeamAssets["cfb:alabama"]?.src).toContain("/ncaa/500/333.png");
    expect(footballSubjectAssets["2011-alabama"]).toBeUndefined();
    expect(footballSubjectAssets["2017-alabama"]).toBeUndefined();
    expect(footballSubjectAssets["2020-alabama"]).toBeUndefined();
  });

  it("normalizes punctuation-heavy program names to the same season identity", () => {
    expect(getFootballSubject("2022-texas-am")?.teamId).toBe("cfb:texas-am");
  });

  it("renders the registered mark instead of the generic league/type fallback", () => {
    const pack = footballRankFivePacks.find((row) => row.id === "nfl-defensive-players")!;
    const item = pack.items.find((row) => row.id === "lawrence-taylor")!;

    render(<FootballSubjectVisual item={item} packId={pack.id} />);

    const visual = screen.getByLabelText("Lawrence Taylor visual");
    expect(visual).toHaveAttribute("data-visual-kind", "team-mark");
    expect(visual.querySelector("img")).toHaveAttribute(
      "src",
      "https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png",
    );
    expect(visual.querySelector(".football-subject-visual__fallback")).not.toBeInTheDocument();
  });
});
