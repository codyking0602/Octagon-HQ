import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseMmaManiaCard } from "../../../supabase/functions/sync-next-ufc-event/mmaManiaCardParser";
import { selectAndSequenceImportedBouts } from "../../../supabase/functions/sync-next-ufc-event/importPolicy";

const ufc330 = readFileSync("supabase/functions/sync-next-ufc-event/fixtures/ufc-330-replacement-card.html", "utf8");
const names = (html: string) => parseMmaManiaCard(html, "https://www.mmamania.com/test").bouts
  .map((bout) => `${bout.red_fighter_name} vs. ${bout.blue_fighter_name}`);

describe("canonical MMA Mania card parser", () => {
  it("parses the current UFC 330 MMA Mania heading and replacement-note shape through the production parser", () => {
    const card = parseMmaManiaCard(ufc330, "https://www.mmamania.com/ufc-fight-cards/451594/ufc-330-fight-card-start-time-date-location-islam-makhachev-ian-machado-garry");
    const supported = selectAndSequenceImportedBouts(card.bouts, "full");

    expect(card.usedSectionHeadings).toBe(true);
    expect(supported.map((bout) => `${bout.red_fighter_name} vs. ${bout.blue_fighter_name}`)).toEqual([
      "Islam Makhachev vs. Ian Machado Garry",
      "Mackenzie Dern vs. Gillian Robertson",
      "Charles Johnson vs. Eduardo Henrique",
      "Edson Barboza vs. Esteban Ribovics",
      "Mansur Abdul-Malik vs. Dustin Stoltzfus",
      "Chidi Njokuani vs. Joel Alvarez",
      "Jalin Turner vs. Kaue Fernandes",
      "Donte Johnson vs. Eric McConico",
      "Vicente Luque vs. Tresean Gore",
    ]);
    expect(supported).toHaveLength(9);
    expect(new Set(supported.map((bout) => `${bout.red_fighter_name}:${bout.blue_fighter_name}`))).toHaveLength(9);
    expect(JSON.stringify(supported)).not.toMatch(/Jose Ochoa|Geoff Neal|Rafael Tobias|Neil Magny|Jeremiah Wells|Mackahev.*over or under/i);
  });

  it("rejects poll and preview prose between real card sections", () => {
    const html = `<article><h2>Main Event</h2><p>155 lbs.: Alpha One vs. Beta Two</p>
      <p>Who will win Alpha One vs. Beta Two?</p><p>Alpha One vs. Beta Two Odds, Preview & Prediction</p>
      <h2>Late Prelims</h2><p>170 lbs.: Gamma Three vs. Delta Four</p><h2>Early Prelims</h2><p>125 lbs.: Early One vs. Early Two</p></article>`;
    expect(names(html)).toEqual(["Alpha One vs. Beta Two", "Gamma Three vs. Delta Four", "Early One vs. Early Two"]);
  });

  it("removes struck and deleted opponents without discarding the current row", () => {
    const html = `<article><h2>Main Card</h2><p>185 lbs.: Chidi Njokuani vs. <a>Joel <strong>Alvarez</strong></a> <s>Geoff Neal</s></p>
      <p>145 lbs.: Current One <del>Old Opponent vs.</del> vs. Current Two — <em>odds</em> | preview</p></article>`;
    expect(names(html)).toEqual(["Chidi Njokuani vs. Joel Alvarez", "Current One vs. Current Two"]);
  });

  it("handles nested editorial markup and br-separated list formatting", () => {
    const html = `<main><p><strong>Main Event</strong><br><strong>265 lbs.:</strong> <a>Heavy One</a> vs. <span>Heavy Two</span></p>
      <p><b>Main Card</b><br>155 lbs.: Link One vs. Link Two<br>135 lbs.: Markup One vs. Markup Two — <a>prediction</a></p>
      <p><strong>Prelims</strong><br>125 lbs.: Prelim One vs. Prelim Two</p></main>`;
    expect(names(html)).toEqual([
      "Heavy One vs. Heavy Two", "Link One vs. Link Two", "Markup One vs. Markup Two", "Prelim One vs. Prelim Two",
    ]);
  });

  it("never mistakes a weighted matchup for a section heading because of fighter-name words", () => {
    const html = `<article><h3>UFC Main Card on Paramount+ (9 p.m. ET)</h3>
      <p>155 lbs.: Main Eventer vs. Prelim One</p>
      <h3>UFC Late ‘Prelims’ Card on Paramount+ (7 p.m. ET)</h3>
      <p>170 lbs.: Main Carder vs. Early Prelim</p></article>`;
    expect(names(html)).toEqual(["Main Eventer vs. Prelim One", "Main Carder vs. Early Prelim"]);
  });

  it("supports table rows while preserving section ownership", () => {
    const html = `<article><h3>Main Card</h3><table><tr><td><span>170 lbs.: Table One vs. Table Two</span></td></tr></table>
      <h3>Late Prelims</h3><ul><li><strong>145 lbs.:</strong> List One vs. List Two</li></ul>
      <h3>Early Prelims</h3><table><tr><td>115 lbs.: Early One vs. Early Two</td></tr></table></article>`;
    const card = parseMmaManiaCard(html, "https://www.mmamania.com/table");
    expect(names(html)).toEqual(["Table One vs. Table Two", "List One vs. List Two", "Early One vs. Early Two"]);
    expect(selectAndSequenceImportedBouts(card.bouts, "full").map((bout) => bout.red_fighter_name)).toEqual(["Table One", "List One"]);
  });
});
