import { beforeEach, describe, expect, it } from "vitest";
import {
  nextFootballEntryState,
  resetFootballEntrySessionForTests,
} from "./footballEntrySession";

beforeEach(() => {
  resetFootballEntrySessionForTests();
});

describe("Football Easter egg entry session", () => {
  it("uses the first hidden Play entry as the only cinematic reveal in the app session", () => {
    expect(nextFootballEntryState("play")).toEqual({ footballEntry: "play" });
    expect(nextFootballEntryState("picks")).toBeUndefined();
    expect(nextFootballEntryState("play")).toBeUndefined();
  });

  it("uses the first hidden Picks entry as the only cinematic reveal in the app session", () => {
    expect(nextFootballEntryState("picks")).toEqual({ footballEntry: "picks" });
    expect(nextFootballEntryState("play")).toBeUndefined();
    expect(nextFootballEntryState("picks")).toBeUndefined();
  });
});
