import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import FootballRankFivePage from "./FootballRankFivePage";
import {
  buildFootballRankFiveLineup,
  footballRankFivePacks,
} from "./footballRankFiveModel";

describe("Football Rank 5", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("owns a deep football content pool across both leagues", () => {
    expect(footballRankFivePacks).toHaveLength(6);
    expect(footballRankFivePacks.filter((pack) => pack.items.every((item) => item.league === "NFL"))).toHaveLength(3);
    expect(footballRankFivePacks.filter((pack) => pack.items.every((item) => item.league === "CFB"))).toHaveLength(3);

    for (const pack of footballRankFivePacks) {
      expect(pack.items.length).toBeGreaterThanOrEqual(15);
      expect(new Set(pack.items.map((item) => item.id)).size).toBe(pack.items.length);
      expect(pack.items.every((item) => Number.isInteger(item.rating) && item.rating >= 0 && item.rating <= 100)).toBe(true);
    }
  });

  it("builds deterministic five-item lineups with real rating separation", () => {
    for (const pack of footballRankFivePacks) {
      const first = buildFootballRankFiveLineup(pack.id, "rank-five-proof");
      const second = buildFootballRankFiveLineup(pack.id, "rank-five-proof");
      expect(first.map((item) => item.id)).toEqual(second.map((item) => item.id));
      expect(first).toHaveLength(5);
      expect(new Set(first.map((item) => item.id)).size).toBe(5);
      const ratings = first.map((item) => item.rating);
      expect(Math.max(...ratings) - Math.min(...ratings)).toBeGreaterThanOrEqual(8);
    }
  });

  it("locks all five placements and reveals the final score and canonical order", () => {
    render(
      <MemoryRouter>
        <FootballRankFivePage />
      </MemoryRouter>,
    );

    expect(screen.getByText("RANK 5")).toBeInTheDocument();
    for (let rank = 1; rank <= 5; rank += 1) {
      fireEvent.click(screen.getByRole("button", { name: `Place current item at rank ${rank}` }));
    }

    expect(screen.getByLabelText("Football Rank 5 score")).toHaveTextContent("/100");
    expect(screen.getByText("YOUR FINAL RANKING")).toBeInTheDocument();
    expect(screen.getByText("BACK ROOM ORDER")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "NEW LINEUP" })).toBeInTheDocument();
  });
});
