import { beforeEach, describe, expect, it } from "vitest";
import { nextFootballEntryState, resetFootballEntrySessionForTests } from "./footballEntrySession";

beforeEach(() => {
  resetFootballEntrySessionForTests();
});

describe("football entry session", () => {
  it("allows only the first hidden Football entry reveal across Play and Picks", () => {
    expect(nextFootballEntryState("picks")).toEqual({ footballEntry: "picks" });
    expect(nextFootballEntryState("play")).toBeUndefined();
    expect(nextFootballEntryState("picks")).toBeUndefined();
  });

  it("uses the section that discovers Football first to choose the reveal", () => {
    expect(nextFootballEntryState("play")).toEqual({ footballEntry: "play" });
    expect(nextFootballEntryState("picks")).toBeUndefined();
  });
});
