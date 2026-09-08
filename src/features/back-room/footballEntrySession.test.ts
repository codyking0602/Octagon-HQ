import { beforeEach, describe, expect, it } from "vitest";
import {
  nextFootballEntryState,
  resetFootballEntrySessionForTests,
} from "./footballEntrySession";

beforeEach(() => {
  resetFootballEntrySessionForTests();
});

describe("Football Easter egg entry session", () => {
  it("keeps Play and Picks reveals independently available in the same app session", () => {
    expect(nextFootballEntryState("play")).toEqual({ footballEntry: "play" });
    expect(nextFootballEntryState("picks")).toEqual({ footballEntry: "picks" });
    expect(nextFootballEntryState("play")).toBeUndefined();
    expect(nextFootballEntryState("picks")).toBeUndefined();
  });

  it("keeps both reveals available when Picks is discovered first", () => {
    expect(nextFootballEntryState("picks")).toEqual({ footballEntry: "picks" });
    expect(nextFootballEntryState("play")).toEqual({ footballEntry: "play" });
    expect(nextFootballEntryState("picks")).toBeUndefined();
    expect(nextFootballEntryState("play")).toBeUndefined();
  });
});
