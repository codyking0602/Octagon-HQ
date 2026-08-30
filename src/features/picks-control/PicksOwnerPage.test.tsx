import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import PicksOwnerPage from "./PicksOwnerPage";

afterEach(cleanup);

describe("Picks owner sport selector", () => {
  it("preserves UFC as the default canonical owner and swaps to one Football setup owner", () => {
    render(
      <PicksOwnerPage
        ufcOwner={<div>CANONICAL UFC OWNER</div>}
        footballOwner={<div>CANONICAL FOOTBALL SETUP OWNER</div>}
      />,
    );

    expect(screen.getByText("CANONICAL UFC OWNER")).toBeInTheDocument();
    expect(screen.queryByText("CANONICAL FOOTBALL SETUP OWNER")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /FOOTBALL/ }));

    expect(screen.queryByText("CANONICAL UFC OWNER")).not.toBeInTheDocument();
    expect(screen.getByText("CANONICAL FOOTBALL SETUP OWNER")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /FOOTBALL/ })).toHaveLength(1);
  });
});
