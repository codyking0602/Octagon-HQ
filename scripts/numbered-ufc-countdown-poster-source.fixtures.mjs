import assert from "node:assert/strict";
import test from "node:test";
import {
  centralEventDate,
  nextNumberedFromEspn,
  numberedPosterLinks,
  verifiedNumberedPosterArticle,
} from "./numbered-ufc-countdown-poster-source.mjs";

const now = new Date("2026-11-15T13:00:00Z");
const calendar = { leagues: [{ calendar: [
  { label: "UFC 334: Gane vs. Hokit", startDate: "2026-11-15T01:00:00Z" },
  { label: "UFC Fight Night: Oliveira vs Lopes", startDate: "2026-11-21T02:00:00Z" },
  { label: "UFC 335: Charles Oliveira vs. Diego Lopes", startDate: "2026-12-13T01:00:00Z" },
  { label: "UFC 336: Alex Example vs. Miguel Opponent", startDate: "2027-01-31T02:00:00Z" },
] }] };

test("discovers future confirmed numbered card independent of a staged Picks event", () => {
  const event = nextNumberedFromEspn(calendar, now);
  assert.deepEqual(event, {
    name: "UFC 335", number: "335", firstName: "oliveira", secondName: "lopes",
    date: "2026-12-12", startsAt: "2026-12-13T01:00:00.000Z",
  });
  assert.equal(centralEventDate("2027-01-31T02:00:00Z"), "2027-01-30");
  assert.equal(nextNumberedFromEspn({ leagues: [{ calendar: [{ label: "UFC 337", startDate: "2027-02-20T01:00Z" }] }] }, now), null);
});

const source = "https://www.mmamania.com/ufc-strikeforce-posters/483686/ufc-335-poster-oliveira-lopes";
const src = "https://platform.mmamania.com/wp-content/uploads/sites/110/2026/11/ufc-335-wide.jpeg";
const html = [
  '<meta property="og:title" content="UFC 335 poster: Oliveira vs. Lopes">',
  '<meta property="og:image" content="' + src + '">',
  '<meta property="og:image:width" content="1200">',
  '<meta property="og:image:height" content="628">',
  "<h1>UFC 335 poster</h1><p>Charles Oliveira vs Diego Lopes, official poster released.</p>",
].join("");
const event = nextNumberedFromEspn(calendar, now);

test("discovers only the target UFC poster article on the vetted publisher archive", () => {
  const index = [
    '<a href="' + source + '">UFC 335</a>',
    '<a href="https://www.mmamania.com/ufc-strikeforce-posters/444111/ufc-336-poster">UFC 336</a>',
    '<a href="https://evil.example/ufc-strikeforce-posters/555/ufc-335">spoof</a>',
  ].join("");
  assert.deepEqual(numberedPosterLinks(index, "335"), [source]);
});

test("accepts exact publisher source and verifies event number, fighters, and horizontal image dimensions", () => {
  assert.deepEqual(verifiedNumberedPosterArticle(html, source, event), {
    name: "UFC 335", firstName: "oliveira", secondName: "lopes",
    date: "2026-12-12", source, src,
  });
  assert.equal(verifiedNumberedPosterArticle(html, source.replace("ufc-335", "ufc-336"), event), null);
  assert.equal(verifiedNumberedPosterArticle(html.replace("Diego Lopes", "Someone Else"), source, event), null);
  assert.equal(verifiedNumberedPosterArticle(html.replace("1200", "500"), source, event), null);
  assert.equal(verifiedNumberedPosterArticle(html.replace("628", "1700"), source, event), null);
  assert.equal(verifiedNumberedPosterArticle(html.replace("platform.mmamania.com", "fake.example"), source, event), null);
  assert.equal(verifiedNumberedPosterArticle(html.replace("UFC 335 poster", "UFC 336 poster"), source, { ...event, number: "336" }), null);
});
