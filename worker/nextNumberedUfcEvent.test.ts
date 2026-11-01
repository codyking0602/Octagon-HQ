import { describe, expect, it } from "vitest";
import {
  closestUpcomingNumberedEvent,
  numberedUfcEventLinks,
  numberedEventScheduleFallback,
  type NextNumberedUfcEvent,
} from "./nextNumberedUfcEvent";

function card(name: string, startsAt: string): NextNumberedUfcEvent {
  return { name, startsAt, matchup: "Red vs. Blue", venue: "", location: "", imageUrl: null };
}

describe("public numbered UFC Picks calendar", () => {
  it("discovers only numbered UFC event URLs and deduplicates index links", () => {
    const html = [
      '<a href="/event/ufc-fight-night-november-7-2026">Fight Night</a>',
      '<a href="/event/ufc-334-gane-vs-hokit">UFC 334</a>',
      '<a href="https://www.ufc.com/event/ufc-334-gane-vs-hokit">UFC 334 duplicate</a>',
      '<a href="/event/ufc-335-oliveira-vs-lopes">UFC 335</a>',
      '<a href="https://evil.example/event/ufc-336">Not official</a>',
      '<a href="/event/road-to-ufc-334">Not a numbered event</a>',
    ].join("");
    expect(numberedUfcEventLinks(html)).toEqual([
      "https://www.ufc.com/event/ufc-334-gane-vs-hokit",
      "https://www.ufc.com/event/ufc-335-oliveira-vs-lopes",
    ]);
  });

  it("does not spend candidate slots on past numbered UFC events", () => {
    const html = [
      '<div id="events-list-past"><a href="/event/ufc-333">UFC 333</a></div>',
      '<div id="events-list-upcoming"><a href="/event/ufc-334">UFC 334</a>',
      '<a href="/event/ufc-335">UFC 335</a></div>',
      '<div id="events-list-results"><a href="/event/ufc-331">UFC 331</a></div>',
    ].join("");
    expect(numberedUfcEventLinks(html)).toEqual([
      "https://www.ufc.com/event/ufc-334",
      "https://www.ufc.com/event/ufc-335",
    ]);
  });

  it("chooses nearest future numbered card regardless of source order", () => {
    const now = new Date("2026-10-31T22:00:00Z");
    expect(closestUpcomingNumberedEvent([
      card("UFC 335", "2026-12-13T02:00:00Z"),
      card("UFC Fight Night", "2026-11-08T01:00:00Z"),
      card("UFC 333", "2026-10-25T02:00:00Z"),
      card("UFC 334", "2026-11-15T02:00:00Z"),
    ], now)?.name).toBe("UFC 334");
  });

  it("rolls to the next numbered card automatically after fight night begins", () => {
    expect(closestUpcomingNumberedEvent([
      card("UFC 334", "2026-11-15T02:00:00Z"),
      card("UFC 335", "2026-12-13T02:00:00Z"),
    ], new Date("2026-11-15T02:01:00Z"))?.name).toBe("UFC 335");
  });

  it("supports next-year numbered events before fights are booked, but only with official timing", () => {
    const html = [
      "<title>UFC 336 | UFC</title>",
      '<h1>UFC 336</h1>',
      '<div data-timestamp="2027-01-31T02:00:00Z">Sat, Jan 30 / 9:00 PM EST / Main Card</div>',
      "<p>Main Card 9:00 PM EST</p>",
    ].join("");
    const event = numberedEventScheduleFallback(html, "https://www.ufc.com/event/ufc-336");
    expect(event?.name).toBe("UFC 336");
    expect(event?.startsAt).toBe("2027-01-31T02:00:00.000Z");
    expect(event?.matchup).toBe("Main event to be announced");
    expect(numberedEventScheduleFallback(
      html.replace('data-timestamp="2027-01-31T02:00:00Z"', ""),
      "https://www.ufc.com/event/ufc-336",
    )).toBeNull();
  });

  it("does not invent a countdown for missing or invalid dates", () => {
    expect(closestUpcomingNumberedEvent([
      card("UFC 334", ""),
      card("UFC 335", "invalid"),
      card("UFC 333", "2026-10-25T02:00:00Z"),
    ], new Date("2026-11-01T00:00:00Z"))).toBeNull();
  });
});
