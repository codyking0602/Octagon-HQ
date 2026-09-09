// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FootballTwentyQuestionsPage from "./FootballTwentyQuestionsPage";
import UfcTwentyQuestionsPage from "./UfcTwentyQuestionsPage";

const { mockUseIdentity } = vi.hoisted(() => ({ mockUseIdentity: vi.fn() }));

vi.mock("../identity/IdentityProvider", () => ({
  useIdentity: mockUseIdentity,
}));

vi.mock("./TwentyQuestionsPage", () => ({
  default: ({ sport }: { sport: string }) => <div>{sport} 20 Questions</div>,
}));

describe("20 Questions admin access", () => {
  beforeEach(() => {
    mockUseIdentity.mockReturnValue({
      ready: true,
      profile: { canControlPicks: false },
    });
  });

  it("redirects non-admin UFC deep links back to Play", () => {
    render(
      <MemoryRouter initialEntries={["/play/20-questions"]}>
        <Routes>
          <Route path="/play/20-questions" element={<UfcTwentyQuestionsPage />} />
          <Route path="/play" element={<div>UFC Play</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("UFC Play")).toBeInTheDocument();
    expect(screen.queryByText("ufc 20 Questions")).not.toBeInTheDocument();
  });

  it("redirects non-admin Football deep links back to Football Play", () => {
    render(
      <MemoryRouter initialEntries={["/football/20-questions"]}>
        <Routes>
          <Route path="/football/20-questions" element={<FootballTwentyQuestionsPage />} />
          <Route path="/football/play" element={<div>Football Play</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Football Play")).toBeInTheDocument();
    expect(screen.queryByText("football 20 Questions")).not.toBeInTheDocument();
  });

  it("keeps direct UFC and Football access available to admins", () => {
    mockUseIdentity.mockReturnValue({
      ready: true,
      profile: { canControlPicks: true },
    });

    const { unmount } = render(
      <MemoryRouter>
        <UfcTwentyQuestionsPage />
      </MemoryRouter>,
    );
    expect(screen.getByText("ufc 20 Questions")).toBeInTheDocument();
    unmount();

    render(
      <MemoryRouter>
        <FootballTwentyQuestionsPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: "20 Questions" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "NFL" })).toBeInTheDocument();
  });
});
