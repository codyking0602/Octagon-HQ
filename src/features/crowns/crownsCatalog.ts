import type { CrownsCard, CrownsSeries, CrownsSubject } from "./crownsData";

export type CrownsPageKey = "home" | "collections" | "family" | "series" | "gallery" | "guide" | "studio";

export function crownsRoute(pathname: string): { page: CrownsPageKey; slug: string | null } {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] !== "crowns") return { page: "home", slug: null };
  const key = segments[1];
  if ((key === "family" || key === "series") && segments.length === 3) {
    return { page: key, slug: segments[2] ?? null };
  }
  if (key === "collections" || key === "gallery" || key === "guide" || key === "studio") {
    return { page: key, slug: null };
  }
  return { page: "home", slug: null };
}

export interface CrownsGalleryFilters {
  search: string;
  family: string;
  series: string;
  status: string;
}
export function filterCrownsCatalog(
  cards: CrownsCard[],
  subjects: CrownsSubject[],
  series: CrownsSeries[],
  filters: CrownsGalleryFilters,
): CrownsCard[] {
  const term = filters.search.trim().toLocaleLowerCase();
  const subjectsById = new Map(subjects.map(subject => [subject.id, subject]));
  const seriesBySlug = new Map(series.map(item => [item.slug, item]));
  return cards.filter(card => {
    const subject = subjectsById.get(card.subject_id);
    const design = card.series_slug ? seriesBySlug.get(card.series_slug) : null;
    const matchesTerm = !term || [
      subject?.name, card.title, card.classification, design?.name, card.requested_by,
    ].some(value => value?.toLocaleLowerCase().includes(term));
    const matchesFamily = filters.family === "all" || design?.family === filters.family;
    const matchesSeries = filters.series === "all"
      || (filters.series === "unassigned" ? card.series_slug === null : card.series_slug === filters.series);
    return matchesTerm && matchesFamily && matchesSeries
      && (filters.status === "all" || card.status === filters.status);
  });
}

export function crownsGalleryUrl(seriesSlug?: string | null) {
  return seriesSlug && seriesSlug !== "all"
    ? `/crowns/gallery?series=${encodeURIComponent(seriesSlug)}`
    : "/crowns/gallery";
}

export function crownsSeriesPreview(cards: CrownsCard[], slug: string): CrownsCard | null {
  return cards.find(card => card.series_slug === slug && Boolean(card.front_path)) ?? null;
}
