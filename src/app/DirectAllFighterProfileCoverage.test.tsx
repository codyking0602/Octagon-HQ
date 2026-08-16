import { cleanup, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import FighterProfilePage from "../features/rankings/FighterProfilePage";
import { allTime } from "../features/rankings/rankingModel";
import { profileCategories, profileDisplayName } from "../features/rankings/profilePresentation";
import { resolveProfileWatchAction } from "../features/rankings/rankingPresentation";

afterEach(cleanup);

function renderProfile(slug: string) {
  render(
    <MemoryRouter initialEntries={[`/fighters/${slug}`]}>
      <Routes>
        <Route path="/fighters/:slug" element={<FighterProfilePage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("direct all-fighter profile coverage proof", () => {
  it("renders every current fighter profile without invalid public output", async () => {
    for (const fighter of allTime) {
      cleanup();
      renderProfile(fighter.slug);
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
