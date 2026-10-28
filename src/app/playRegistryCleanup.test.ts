import { describe, expect, it } from "vitest";
import { PLAY_ROUTE_BY_GAME } from "../features/challenges/challengeRuntime";
import { playGames } from "../features/play/playRegistry";
import { appRoutes } from "./router";

describe("Play registry runtime cleanup", () => {
  it("removes Better Than from every live Play registration while keeping one Hit the Number route", () => {
    const childPaths = appRoutes.flatMap((route) => route.children ?? []).map((route) => route.path);

    expect(playGames.map((game) => game.id)).not.toContain("better-than");
    expect(PLAY_ROUTE_BY_GAME["better-than"]).toBeUndefined();
    expect(childPaths).not.toContain("play/better-than");
    expect(childPaths.filter((path) => path === "play/hit-the-number")).toHaveLength(1);
  });
});
