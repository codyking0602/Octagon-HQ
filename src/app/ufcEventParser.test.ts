import { describe, expect, it } from "vitest";
import {
  parseUfcEventPage,
  parseUfcFightCard,
} from "../../supabase/functions/sync-next-ufc-event/ufcEventParser";

const sourceUrl = "https://www.ufc.com/event/ufc-fight-night-august-22-2026";

function fight(red: string, blue: string, weight = "Middleweight", cancelled = false) {
  return `
    <li class="l-listing__item c-listing-fight">
      <div class="c-listing-fight__class-text">${weight} Bout</div>
      <div class="c-listing-fight__corner-name c-listing-fight__corner-name--red"><a href="/athlete/${red.toLowerCase().replace(/\s+/g, "-")}">${red}</a></div>
      <div class="c-listing-fight__corner-name c-listing-fight__corner-name--blue"><a href="/athlete/${blue.toLowerCase().replace(/\s+/g, "-")}">${blue}</a></div>
      ${cancelled ? "<span>Cancelled</span>" : ""}
    </li>`;
}

const html = `<!doctype html>
<html>
<head>
  <meta property="og:title" content="UFC Fight Night | UFC">
  <meta property="og:description" content="Don't Miss A Moment Of UFC Fight Night: Anthony Hernandez vs Gregory Rodrigues, Live From Golden 1 Center In Sacramento, California On August 22, 2026">
</head>
<body>
  <div class="c-hero__header">
    <div class="c-hero__headline-prefix">UFC Fight Night</div>
    <h1 class="c-hero__headline">Hernandez vs Rodrigues</h1>
  </div>
  <time datetime="2026-08-22T12:00:00-07:00"></time>
  <div class="c-hero__bottom-text">Sat, Aug 22 / 5:00 PM PDT / Main Card</div>
  <section id="main-card">
    <h2>Main Card</h2>
    <div class="c-event-fight-card-broadcaster__time" data-timestamp="1787443200"></div>
    <ul>
      ${fight("Anthony Hernandez", "Gregory Rodrigues")}
      ${fight("Roman Dolidze", "Reinier de Ridder")}
      ${fight("Serghei Spivac", "Vitor Petrino", "Heavyweight")}
      ${fight("Kennedy Nzechukwu", "Shamil Gaziev", "Heavyweight")}
      ${fight("Kody Steele", "Gauge Young", "Lightweight")}
      ${fight("Carli Judice", "Jeisla Chaves", "Flyweight")}
      ${fight("Removed Fighter", "Other Fighter", "Welterweight", true)}
    </ul>
  </section>
  <section id="prelims-card">
    <h2>Prelims</h2>
    <div class="c-event-fight-card-broadcaster__time" data-timestamp="1787432400"></div>
    <ul>
      ${fight("Wes Schultz", "Jackson McVey")}
      ${fight("Shanelle Dyer", "Elise Reed", "Strawweight")}
      ${fight("Mason Jones", "MarQuel Mederos", "Lightweight")}
      ${fight("Nasrat Haqparast", "Chris Padilla", "Lightweight")}
      ${fight("Jamall Emmers", "Lerryan Douglas", "Featherweight")}
    </ul>
  </section>
</body>
</html>`;

describe("official UFC event parser", () => {
  it("parses UFC-owned sections, fights, order, identity, place, and time", () => {
    const parsed = parseUfcEventPage(html, sourceUrl, "", new Date("2026-08-18T12:00:00.000Z"));
    expect(parsed.metadata.source_event_key).toBe("event/ufc-fight-night-august-22-2026");
    expect(parsed.metadata.name).toBe("UFC Fight Night");
    expect(parsed.metadata.subtitle).toBe("Anthony Hernandez vs. Gregory Rodrigues");
    expect(parsed.metadata.venue).toBe("Golden 1 Center");
    expect(parsed.metadata.location).toBe("Sacramento, California");
    expect(parsed.metadata.eventType).toBe("fight-night");
    expect(parsed.card.usedSectionHeadings).toBe(true);
    expect(parsed.card.bouts).toHaveLength(11);
    expect(parsed.card.bouts[0]).toMatchObject({
      section: "main-event",
      red_fighter_name: "Anthony Hernandez",
      blue_fighter_name: "Gregory Rodrigues",
      weight_class: "Middleweight",
    });
    expect(parsed.card.bouts[6]).toMatchObject({
      section: "prelim",
      red_fighter_name: "Wes Schultz",
      blue_fighter_name: "Jackson McVey",
    });
    expect(parsed.card.bouts.some((bout) => bout.red_fighter_name === "Removed Fighter")).toBe(false);
  });

  it("rejects a non-UFC source URL", () => {
    expect(() => parseUfcEventPage(html, "https://www.cbssports.com/ufc/event/1/test"))
      .toThrow("exact UFC.com event URL");
  });

  it("fails closed when UFC does not expose a plausible sectioned card", () => {
    const missing = html.replace(/<section id="main-card">[\s\S]*?<\/section>/, "");
    expect(() => parseUfcEventPage(missing, sourceUrl))
      .toThrow("plausible sectioned fight card");
  });

  it("parses the card independently for source-diff monitoring", () => {
    const card = parseUfcFightCard(html, sourceUrl);
    expect(card.sourceUrl).toBe(sourceUrl);
    expect(card.bouts.map((bout) => `${bout.red_fighter_name} vs ${bout.blue_fighter_name}`)).toContain(
      "Serghei Spivac vs Vitor Petrino",
    );
  });
});
