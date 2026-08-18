import { describe, expect, it } from "vitest";
import {
  parseCbsSportsCard,
  parseCbsSportsEventPage,
} from "../../../supabase/functions/sync-next-ufc-event/cbsSportsEventParser";

const sourceUrl = "https://www.cbssports.com/ufc/event/31001523/ufc-fight-night-hernandez-vs-rodrigues-august-22-2026/";

const fight = (heading: string, first: string, second: string, status = "Scheduled") => `
  <h3>${heading}</h3>
  <div>${status}</div>
  <a href="/ufc/fighter/1/${first.toLowerCase().replace(/ /g, "-")}/">${first}</a>
  <a href="/ufc/fighter/2/${second.toLowerCase().replace(/ /g, "-")}/">${second}</a>
`;

const fightNightHtml = `
<html><body>
  <a href="/ufc/fighter/999/video-only/">Video Fighter</a>
  <h1>UFC Fight Night: Hernandez vs. Rodrigues</h1>
  <div>Golden 1 Center</div><div>Sacramento, USA</div>
  <div>5:00pm ET</div><div>Prelims</div><div>8:00pm ET</div><div>Main Card</div>
  <h2>UFC Videos</h2>
  <a href="/ufc/fighter/998/preview-only/">Preview Fighter</a>
  <h2>Main Card</h2>
  ${fight("Middleweight Bout - Main Event", "Gregory Rodrigues", "Anthony Hernandez")}
  ${fight("Heavyweight Bout", "Serghei Spivac", "Vitor Petrino")}
  ${fight("Light Heavyweight Bout", "Reinier de Ridder", "Roman Dolidze")}
  ${fight("Lightweight Bout", "Mason Jones", "MarQuel Mederos")}
  <h2>Prelims</h2>
  ${fight("Featherweight Bout", "Jamall Emmers", "Lerryan Douglas")}
  ${fight("Heavyweight Bout", "Shamil Gaziev", "Kennedy Nzechukwu")}
  ${fight("Lightweight Bout", "Nasrat Haqparast", "Chris Padilla")}
  ${fight("Featherweight Bout", "Marcio Barbosa", "Ryan Kuse")}
</body></html>`;

describe("CBS Sports UFC event parser", () => {
  it("parses the exact sectioned card without unrelated fighter links", () => {
    const card = parseCbsSportsCard(fightNightHtml, sourceUrl);
    expect(card.usedSectionHeadings).toBe(true);
    expect(card.bouts).toHaveLength(8);
    expect(card.bouts.map((bout) => bout.section)).toEqual([
      "main-event", "main", "main", "main", "prelim", "prelim", "prelim", "prelim",
    ]);
    expect(card.bouts[0]).toMatchObject({
      weight_class: "Middleweight",
      red_fighter_name: "Gregory Rodrigues",
      blue_fighter_name: "Anthony Hernandez",
    });
    expect(card.bouts.some((bout) => bout.red_fighter_name === "Video Fighter")).toBe(false);
  });

  it("builds canonical Fight Night metadata and orders the subtitle from the CBS event title", () => {
    const event = parseCbsSportsEventPage(fightNightHtml, sourceUrl);
    expect(event.metadata).toMatchObject({
      source_event_key: "cbs:31001523",
      name: "UFC Fight Night",
      subtitle: "Anthony Hernandez vs. Gregory Rodrigues",
      venue: "Golden 1 Center",
      location: "Sacramento, USA",
      starts_at: "2026-08-23T00:00:00.000Z",
      prelims_starts_at: "",
      locks_at: "2026-08-23T00:00:00.000Z",
      season: 2026,
      eventType: "fight-night",
      localEventDate: "2026-08-22",
    });
  });

  it("preserves an already-published event key during a source cutover", () => {
    const event = parseCbsSportsEventPage(fightNightHtml, sourceUrl, "ufc-fight-cards/legacy-event");
    expect(event.metadata.source_event_key).toBe("ufc-fight-cards/legacy-event");
    expect(event.card.sourceUrl).toBe(sourceUrl);
  });

  it("uses the Prelims start as the Picks lock for numbered events", () => {
    const numberedUrl = "https://www.cbssports.com/ufc/event/31009999/ufc-330-test-vs-test-november-14-2026/";
    const numberedHtml = fightNightHtml
      .replace("UFC Fight Night: Hernandez vs. Rodrigues", "UFC 330: Hernandez vs. Rodrigues")
      .replace("5:00pm ET", "6:00pm ET")
      .replace("8:00pm ET", "10:00pm ET");
    const event = parseCbsSportsEventPage(numberedHtml, numberedUrl);
    expect(event.metadata.name).toBe("UFC 330");
    expect(event.metadata.eventType).toBe("numbered");
    expect(event.metadata.prelims_starts_at).toBe("2026-11-14T23:00:00.000Z");
    expect(event.metadata.starts_at).toBe("2026-11-14T23:00:00.000Z");
    expect(event.metadata.locks_at).toBe("2026-11-14T23:00:00.000Z");
  });

  it("drops explicitly canceled fight blocks", () => {
    const card = parseCbsSportsCard(
      fightNightHtml.replace("<div>Scheduled</div>", "<div>Canceled</div>"),
      sourceUrl,
    );
    expect(card.bouts).toHaveLength(7);
    expect(card.bouts.some((bout) => bout.red_fighter_name === "Gregory Rodrigues")).toBe(false);
  });
});
