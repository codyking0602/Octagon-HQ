import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { GroupPickReveal } from "./GroupPickReveal";
import type { PickGroupPick } from "./picksModel";

afterEach(cleanup);

const picks: PickGroupPick[] = [
  { displayName: "CODY", pickedFighterSlug: "red-fighter", isCurrentUser: true },
  { displayName: "SHANE", pickedFighterSlug: "red-fighter", isCurrentUser: false },
  { displayName: "TYLER", pickedFighterSlug: "blue-fighter", isCurrentUser: false },
  { displayName: "BROCK", pickedFighterSlug: null, isCurrentUser: false },
];

function renderReveal(groupPicks: PickGroupPick[] = picks) {
  return render(
    <GroupPickReveal
      redFighterSlug="red-fighter"
      redFighterName="Red Fighter"
      blueFighterSlug="blue-fighter"
      blueFighterName="Blue Fighter"
      picks={groupPicks}
    />,
  );
}

describe("GroupPickReveal", () => {
  it("shows only totals by default and reveals one selected group at a time", () => {
    renderReveal();

    const red = screen.getByRole("button", { name: "Red Fighter: 2 picks" });
    const blue = screen.getByRole("button", { name: "Blue Fighter: 1 pick" });
    const missing = screen.getByRole("button", { name: "NO PICK: 1 pick" });

    expect(red).toHaveAttribute("aria-expanded", "false");
    expect(blue).toHaveAttribute("aria-expanded", "false");
    expect(missing).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("CODY · YOU")).not.toBeInTheDocument();
    expect(screen.queryByText("SHANE")).not.toBeInTheDocument();

    fireEvent.click(red);
    expect(red).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("CODY · YOU")).toBeInTheDocument();
    expect(screen.getByText("SHANE")).toBeInTheDocument();
    expect(screen.queryByText("TYLER")).not.toBeInTheDocument();

    fireEvent.click(blue);
    expect(red).toHaveAttribute("aria-expanded", "false");
    expect(blue).toHaveAttribute("aria-expanded", "true");
    expect(screen.queryByText("CODY · YOU")).not.toBeInTheDocument();
    expect(screen.getByText("TYLER")).toBeInTheDocument();

    fireEvent.click(blue);
    expect(blue).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("TYLER")).not.toBeInTheDocument();
  });

  it("keeps empty totals visible but non-interactive", () => {
    renderReveal(picks.filter((pick) => pick.pickedFighterSlug !== "blue-fighter"));

    expect(screen.getByRole("button", { name: "Blue Fighter: 0 picks" })).toBeDisabled();
  });
});
