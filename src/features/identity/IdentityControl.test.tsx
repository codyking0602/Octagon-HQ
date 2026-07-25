import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { IdentityControl } from "./IdentityControl";
import { IdentityProvider } from "./IdentityProvider";

afterEach(() => {
  document.body.style.overflow = "";
});

describe("IdentityControl", () => {
  it("portals the dialog to document.body and locks page scrolling", () => {
    const { container } = render(
      <IdentityProvider gateway={null}>
        <IdentityControl />
      </IdentityProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /sign in to octagon hq/i }));

    const dialog = screen.getByRole("dialog", { name: /get into hq/i });
    expect(document.body.contains(dialog)).toBe(true);
    expect(container.contains(dialog)).toBe(false);
    expect(dialog.parentElement).toHaveClass("identity-overlay--viewport");
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.click(screen.getByRole("button", { name: /close profile dialog/i }));

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.body.style.overflow).toBe("");
  });
});
