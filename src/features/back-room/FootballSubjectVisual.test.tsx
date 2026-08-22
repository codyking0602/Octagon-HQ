import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { footballRankFivePacks } from "./footballRankFiveModel";
import { footballSubjectAssets } from "./footballSubjectAssets";
import { FootballSubjectVisual } from "./FootballSubjectVisual";

describe("Football subject visuals", () => {
  it("covers every current Football Rank 5 subject through the one canonical asset catalog", () => {
    const subjects = footballRankFivePacks.flatMap((pack) => pack.items.map((item) => ({ item, pack })));
    expect(subjects).toHaveLength(90);

    for (const { item } of subjects) {
      const asset = footballSubjectAssets[item.id];
      expect(asset, item.id).toBeDefined();
      expect(asset?.src).toMatch(/^https:\/\/a\.espncdn\.com\/i\/teamlogos\//);
      expect(asset?.label.length).toBeGreaterThan(1);
    }

    expect(Object.keys(footballSubjectAssets)).toHaveLength(subjects.length);
  });

  it("uses NFL team marks for NFL subjects and college program marks for CFB subjects", () => {
    for (const pack of footballRankFivePacks) {
      for (const item of pack.items) {
        expect(footballSubjectAssets[item.id]?.kind).toBe(item.league === "NFL" ? "team-mark" : "program-mark");
      }
    }
  });

  it("renders the registered mark instead of the generic league/type fallback", () => {
    const pack = footballRankFivePacks.find((row) => row.id === "nfl-quarterbacks")!;
    const item = pack.items.find((row) => row.id === "patrick-mahomes")!;

    render(<FootballSubjectVisual item={item} packId={pack.id} />);

    const visual = screen.getByLabelText("Patrick Mahomes visual");
    expect(visual).toHaveAttribute("data-visual-kind", "team-mark");
    expect(visual.querySelector("img")).toHaveAttribute(
      "src",
      "https://a.espncdn.com/i/teamlogos/nfl/500/kc.png",
    );
    expect(visual.querySelector(".football-subject-visual__fallback")).not.toBeInTheDocument();
  });
});
