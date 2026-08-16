import { cleanup, render, screen, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { AppProviders } from "./providers";
import { appRoutes } from "./router";
import { allTime, getFighter } from "../features/rankings/rankingModel";
import { profileCategories, profileDisplayName } from "../features/rankings/profilePresentation";
import { resolveProfileWatchAction } from "../features/rankings/rankingPresentation";

afterEach(cleanup);

function renderRoute(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return router;
}

function compactNames(names: string[]) {
  if (!names.length) return "None";
  const counts = new Map<string, number>();
  names.forEach((name) => counts.set(name, (counts.get(name) ?? 0) + 1));
  return [...counts.entries()].map(([name, count]) => count > 1 ? `${name} ×${count}` : name).join(", ");
}

describe("all-fighter profile coverage", () => {
  it("validates loss-context public evidence for every fighter from penalty traces", () => {
    for (const fighter of allTime) {
      const primeEvents = fighter.traces.penalty.events.filter((event) => event.phase === "prime" && event.penaltyEligible && !event.technicalException);
      const postPrimeEvents = fighter.traces.penalty.events.filter((event) => event.phase === "post-prime" && event.penaltyEligible && !event.technicalException);
      const prePrimeEvents = fighter.traces.penalty.events.filter((event) => event.phase === "pre-prime");
      expect(fighter.profileEvidence.primeLosses).toBe(compactNames(primeEvents.map((event) => event.upwardDivision ? `${event.opponent} — upward division` : event.opponent)));
      expect(fighter.profileEvidence.postPrimeLosses).toBe(postPrimeEvents.length);
      for (const event of prePrimeEvents) {
        const alsoPrime = primeEvents.some((prime) => prime.opponent === event.opponent);
        if (!alsoPrime) expect(fighter.profileEvidence.primeLosses).not.toContain(event.opponent);
      }
    }
  });

  it("validates nickname audit coverage for every current fighter", async () => {
    const audit = await import("../../docs/profile-nickname-audit.md?raw");
    const rows = audit.default.split("\n").filter((line: string) => line.startsWith("| ") && !line.includes("---") && !line.includes("Fighter slug"));
    expect(rows).toHaveLength(allTime.length);
    const seen = new Set<string>();
    for (const row of rows) {
      const [, slug, display] = row.split("|").map((part: string) => part.trim());
      expect(seen.has(slug)).toBe(false);
      seen.add(slug);
      const fighter = getFighter(slug)!;
      expect(fighter).toBeTruthy();
      expect(profileDisplayName(fighter)).toBe(display);
    }
    expect([...seen].sort()).toEqual(allTime.map((fighter) => fighter.slug).sort());
  });

  it("validates streak invariants for every fighter", () => {
    for (const fighter of allTime) {
      const wins = fighter.visibleStats.ufcRecord.split("-")[0];
      expect(Number.isInteger(fighter.longestUfcWinStreak)).toBe(true);
      expect(fighter.longestUfcWinStreak).toBeGreaterThanOrEqual(0);
      expect(fighter.longestUfcWinStreak).toBeLessThanOrEqual(Number(wins));
    }
  });

  it("renders every current fighter profile without invalid public output", async () => {
    for (const fighter of allTime) {
      cleanup();
      renderRoute(`/fighters/${fighter.slug}`);
      expect(await screen.findByRole("heading", { name: profileDisplayName(fighter) })).toBeInTheDocument();
      expect(screen.getByLabelText(`${fighter.name} photo`)).toHaveTextContent("OVR");
      const resume = screen.getByRole("heading", { name: "Resume Snapshot" }).closest("section")!;
      ["UFC Record", "Longest UFC Win Streak", "UFC Title-Fight Wins", "Top-5 Wins", "Finish Rate", "Prime UFC Record", "Rounds Won", "Active Elite Years"].forEach((label) => expect(within(resume).getByText(label)).toBeInTheDocument());
      profileCategories.forEach((category) => expect(screen.getByRole("button", { name: new RegExp(category.label) })).toBeInTheDocument());
      expect(screen.getByTestId("category-expanded")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Why Ranked Here" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: fighter.rank === 1 ? "Why Not Lower?" : "Why Not Ranked Higher?" })).toBeInTheDocument();
      expect(document.body).not.toHaveTextContent(/NaN|undefined|\[object Object\]|#0/);
      expect(screen.getByRole("button", { name: "Share" })).toBeInTheDocument();
      const watchAction = resolveProfileWatchAction(fighter.slug);
      if (watchAction) expect(screen.getByRole("link", { name: watchAction.label })).toHaveAttribute("href", watchAction.url);
      else expect(screen.queryByRole("link", { name: /Watch/ })).not.toBeInTheDocument();
      within(screen.getByTestId("category-expanded")).getAllByTestId("evidence-tile").forEach((tile) => expect(tile).not.toHaveTextContent(/^\s*$/));
    }
  }, 120_000);
});
