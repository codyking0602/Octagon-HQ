import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  FootballFindLeaderPresentation,
  type FootballFindLeaderPresentationCandidate,
} from "./FootballFindLeaderPresentation";

function renderCandidate(candidate: FootballFindLeaderPresentationCandidate) {
  return renderToStaticMarkup(
    <FootballFindLeaderPresentation
      question="Who has the most?"
      context="Highest total among the ten shown."
      categoryLabel="NFL QB SEASONS"
      statLabel="Passing yards"
      shortLabel="YDS"
      candidates={[candidate]}
      eliminatedIds={[]}
      eyebrow="REPLAYABLE GAME"
      onEliminate={() => undefined}
      renderVisual={() => <span className="test-visual" />}
    />,
  );
}

describe("Football Find the Leader candidate identity presentation", () => {
  it("keeps a long NFL quarterback season year outside the truncatable name", () => {
    const html = renderCandidate({
      id: "peyton-manning-2013",
      name: "Peyton Manning 2013",
      displayName: "Peyton Manning",
      season: 2013,
      subtitle: "NFL quarterback season",
    });

    expect(html).toContain(
      '<span class="football-find-card__identity"><strong>Peyton Manning</strong><b class="football-find-card__season">2013</b></span>',
    );
    expect(html).not.toContain("<strong>Peyton Manning 2013</strong>");
  });

  it("keeps a long team-season year visible in the dedicated season token", () => {
    const html = renderCandidate({
      id: "2022-jacksonville-jaguars",
      name: "2022 Jacksonville Jaguars",
      displayName: "Jacksonville Jaguars",
      season: 2022,
      subtitle: "NFL team season",
    });

    expect(html).toContain("<strong>Jacksonville Jaguars</strong>");
    expect(html).toContain('<b class="football-find-card__season">2022</b>');
  });

  it("leaves career subjects clean without an empty or fake season token", () => {
    const html = renderCandidate({
      id: "peyton-manning",
      name: "Peyton Manning",
      subtitle: "NFL quarterback career",
    });

    expect(html).toContain("<strong>Peyton Manning</strong>");
    expect(html).not.toContain("football-find-card__season");
  });

  it("keeps season context out of ellipsized subtitle text and outside the clamped strong element", () => {
    const html = renderCandidate({
      id: "trevor-lawrence-2022",
      name: "Trevor Lawrence 2022",
      displayName: "Trevor Lawrence",
      season: 2022,
      subtitle: "NFL quarterback season",
    });

    expect(html).not.toContain("NFL quarterback season · 2022");
    expect(html).toContain(
      '<strong>Trevor Lawrence</strong><b class="football-find-card__season">2022</b>',
    );
  });

  it("keeps the compact phone card while reserving a non-shrinking season lane", () => {
    const css = readFileSync(resolve("src/styles/football-find-leader.css"), "utf8");
    const phoneCss = css.slice(css.indexOf("@media (max-width: 640px)"));

    expect(phoneCss).toMatch(
      /\.football-find-card\s*\{[^}]*grid-template-columns:\s*52px minmax\(0, 1fr\);[^}]*height:\s*72px;/s,
    );
    expect(css).toMatch(
      /\.football-find-card__identity\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\) auto;/s,
    );
    expect(css).toMatch(
      /\.football-find-card__season\s*\{[^}]*white-space:\s*nowrap;/s,
    );
  });
});
