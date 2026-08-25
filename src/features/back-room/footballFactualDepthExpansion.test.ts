import { describe, expect, it } from "vitest";
import { footballFactualRecords, getFootballFact } from "./footballFactualStats";

describe("Football canonical factual depth expansion", () => {
  it("materially expands reusable factual depth without a second game-owned dataset", () => {
    expect(footballFactualRecords.length).toBeGreaterThanOrEqual(160);

    expect(getFootballFact("travis-kelce", "nfl-career-receptions")?.fact.value).toBe(1080);
    expect(getFootballFact("jason-witten", "nfl-career-receiving-yards")?.fact.value).toBe(13046);
    expect(getFootballFact("george-kittle", "nfl-career-receiving-touchdowns")?.fact.value).toBe(52);

    expect(getFootballFact("myles-garrett", "nfl-career-sacks")?.fact.value).toBe(125.5);
    expect(getFootballFact("tj-watt", "nfl-career-sacks")?.fact.value).toBe(115);
    expect(getFootballFact("deion-sanders", "nfl-career-interceptions")?.fact.value).toBe(53);
    expect(getFootballFact("ronnie-lott", "nfl-career-interceptions")?.fact.value).toBe(63);

    expect(getFootballFact("peyton-manning-2004", "nfl-season-passer-rating")?.fact.value).toBe(121.1);
    expect(getFootballFact("patrick-mahomes-2018", "nfl-season-passing-touchdowns")?.fact.value).toBe(50);
    expect(getFootballFact("aaron-rodgers-2020", "nfl-season-interceptions")?.fact.value).toBe(5);

    expect(getFootballFact("cfb-ricky-williams", "cfb-best-season-rushing-yards")?.fact.value).toBe(2124);
    expect(getFootballFact("cfb-reggie-bush", "cfb-best-season-rushing-yards")?.fact.value).toBe(1740);
    expect(getFootballFact("cfb-michael-crabtree", "cfb-best-season-receiving-yards")?.fact.value).toBe(1962);
    expect(getFootballFact("cfb-calvin-johnson", "cfb-best-season-receiving-touchdowns")?.fact.value).toBe(15);
  });
});
