import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FighterPhoto } from "./FighterPhoto";

describe("FighterPhoto", () => {
  it("renders initials instead of an empty image request when no URL is available", () => {
    const { container } = render(<FighterPhoto name="Jon Jones" src="" />);

    expect(screen.getByText("JJ")).toBeInTheDocument();
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("canvas")).toBeNull();
  });
});
