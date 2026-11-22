import { describe, expect, it } from "vitest";
import {
  crownsGalleryUrl, crownsRoute, crownsSeriesPreview, filterCrownsCatalog,
} from "./crownsCatalog";
import type { CrownsCard, CrownsSeries, CrownsSubject } from "./crownsData";

const subjects = [
  { id: 1, name: "Vince Young" },
  { id: 2, name: "Jon Jones" },
] as CrownsSubject[];
const series = [
  { slug: "classic-base", family: "classic", name: "Classic Base" },
  { slug: "crown-jewel", family: "eclipse", name: "CROWN JEWEL" },
] as CrownsSeries[];
const cards = [
  { id: 1, subject_id: 1, series_slug: null, status: "planned", classification: "Longhorn", front_path: null },
  { id: 2, subject_id: 1, series_slug: null, status: "planned", classification: "Longhorn", front_path: null },
  { id: 3, subject_id: 2, series_slug: "crown-jewel", status: "finished", classification: "UFC", front_path: "cards/3/front.png" },
] as CrownsCard[];
const all = { search: "", family: "all", series: "all", status: "all" };

describe("CROWNS catalog navigation", () => {
  it("opens the complete, unassigned checklist by default", () => {
    expect(crownsRoute("/crowns/gallery")).toEqual({ page: "gallery", slug: null });
    expect(filterCrownsCatalog(cards, subjects, series, all)).toHaveLength(3);
    expect(crownsGalleryUrl()).toBe("/crowns/gallery");
  });

  it("preserves intentionally duplicated planning slots", () => {
    expect(filterCrownsCatalog(cards, subjects, series, { ...all, search: "vince" })
      .map(card => card.id)).toEqual([1, 2]);
  });

  it("filters assigned and unassigned slots deliberately", () => {
    expect(filterCrownsCatalog(cards, subjects, series, { ...all, series: "unassigned" })).toHaveLength(2);
    expect(filterCrownsCatalog(cards, subjects, series, { ...all, series: "crown-jewel" })).toHaveLength(1);
    expect(filterCrownsCatalog(cards, subjects, series, { ...all, series: "classic-base" })).toHaveLength(0);
  });

  it("keeps individual families, inserts, and edition types distinct", () => {
    expect(crownsRoute("/crowns/family/classic")).toEqual({ page: "family", slug: "classic" });
    expect(crownsRoute("/crowns/series/immortalized")).toEqual({ page: "series", slug: "immortalized" });
    expect(filterCrownsCatalog(cards, subjects, series, { ...all, family: "eclipse", status: "finished" })).toHaveLength(1);
    expect(crownsGalleryUrl("crown-jewel")).toBe("/crowns/gallery?series=crown-jewel");
    expect(crownsSeriesPreview(cards, "crown-jewel")?.id).toBe(3);
    expect(crownsSeriesPreview(cards, "classic-base")).toBeNull();
  });
});
