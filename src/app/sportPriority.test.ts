import { describe, expect, it } from "vitest";
import { prioritizedSports, entrySport, sportsForDisplay } from "./sportPriority";

const allOff = { football:false, ufc:false, nba:false, mlb:false };
describe("personalized sport navigation", () => {
  it("keeps football, UFC, basketball, baseball as the one canonical default", () => {
    expect(prioritizedSports(null)).toEqual(["football","ufc","nba","mlb"]);
    expect(prioritizedSports(allOff)).toEqual(["football","ufc","nba","mlb"]);
  });
  it("promotes only push-selected sports without reordering either group", () => {
    expect(prioritizedSports({...allOff,nba:true})).toEqual(["nba","football","ufc","mlb"]);
    expect(prioritizedSports({...allOff,nba:true,ufc:true})).toEqual(["ufc","nba","football","mlb"]);
    expect(prioritizedSports({...allOff,mlb:true,football:true})).toEqual(["football","mlb","ufc","nba"]);
  });
  it("uses frozen Home choice or a shared last-used fallback for All Sports", () => {
    expect(entrySport("football","nba")).toBe("football");
    expect(entrySport("ufc","nba")).toBe("ufc");
    expect(entrySport("all","nba")).toBe("nba");
  });
  it("keeps unavailable sports out of switchers without losing priority", () => {
    expect(sportsForDisplay(["nba","mlb","ufc","football"],false,true)).toEqual(["nba","ufc","football"]);
  });
});
