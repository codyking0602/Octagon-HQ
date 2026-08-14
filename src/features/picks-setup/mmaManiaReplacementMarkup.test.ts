import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  isMmaManiaFightListRow,
  selectAndSequenceImportedBouts,
} from "../../../supabase/functions/sync-next-ufc-event/importPolicy";

type Section = "main-event" | "main" | "prelim" | "early-prelim";

const fixture = readFileSync(
  "supabase/functions/sync-next-ufc-event/fixtures/ufc-330-replacement-card.html",
  "utf8",
);
const syncSource = readFileSync("supabase/functions/sync-next-ufc-event/index.ts", "utf8");

function fixtureRows() {
  const fixtureDocument = document.implementation.createHTMLDocument();
  fixtureDocument.body.innerHTML = fixture;
  let section: Section | null = null;
  const rows: Array<{ section: Section; line: string }> = [];

  for (const element of fixtureDocument.querySelectorAll("h1,h2,h3,h4,h5,h6,p,li,td")) {
    const heading = element.textContent?.trim().toLowerCase() ?? "";
    if (element.matches("h1,h2,h3,h4,h5,h6")) {
      if (/early\s+prelim/.test(heading)) section = "early-prelim";
      else if (/prelim/.test(heading)) section = "prelim";
      else if (/main\s+event/.test(heading)) section = "main-event";
      else if (/main\s+card/.test(heading)) section = "main";
      continue;
    }
    if (!section || element.parentElement?.closest("p,li")) continue;
    const clone = element.cloneNode(true) as Element;
    clone.querySelectorAll("s,del").forEach((node) => node.remove());
    const line = clone.textContent?.replace(/\s+/g, " ").trim() ?? "";
    if (isMmaManiaFightListRow(line)) rows.push({ section, line });
  }
  return rows;
}

describe("canonical MMA Mania replacement markup regression", () => {
  it("removes only retracted descendants before parsing the current fight row", () => {
    expect(syncSource).toContain('clone.find("s,del").remove()');
    expect(syncSource).not.toContain('$(element).find("s,del").length');

    const replacement = fixtureRows().find(({ line }) => line.includes("Chidi Njokuani"));
    expect(replacement).toEqual({
      section: "prelim",
      line: "185 lbs.: Chidi Njokuani vs. Joel Alvarez",
    });
    expect(replacement?.line).not.toContain("Geoff Neal");
  });

  it("retains weighted suffix rows and rejects editorial poll prose containing vs.", () => {
    const rows = fixtureRows();
    expect(rows.some(({ line }) => line.includes("Sean O'Malley vs. Song Yadong"))).toBe(true);
    expect(rows.some(({ line }) => line.includes("Will Holloway vs. Oliveira"))).toBe(false);
  });

  it("selects nine UFC-330-shaped fights without duplicates or Early Prelims", () => {
    const rows = fixtureRows();
    const selected = selectAndSequenceImportedBouts(
      rows.map(({ section, line }) => ({ section, line })),
      "full",
    );

    expect(rows).toHaveLength(11);
    expect(selected).toHaveLength(9);
    expect(new Set(selected.map(({ line }) => line))).toHaveLength(9);
    expect(selected.every(({ section }) => section !== "early-prelim")).toBe(true);
    expect(selected.some(({ line }) => line.includes("Geoff Neal"))).toBe(false);
  });
});
