import { getSupabaseClient } from "../../lib/supabase";

export type CardStatus = "planned" | "designing" | "finished" | "printed";
export interface CrownsSubject {
  id: number; name: string; subject_kind: string; sport: string | null; notes: string | null;
}
export interface CrownsSeries {
  slug: string; name: string; family: string; series_kind: string;
  rarity: string; orientation: "portrait" | "landscape"; description: string; sort_order: number; accent: string | null; active: boolean;
}
export interface CrownsTemplate {
  id: number; name: string; series_slug: string | null; canva_reference: string | null; notes: string | null;
}
export interface CrownsCard {
  id: number; subject_id: number; series_slug: string | null; template_id: number | null;
  source_sheet: string | null; source_row: number | null; classification: string | null; requested_by: string | null;
  legacy_design_code: string | null; title: string | null; status: CardStatus;
  front_path: string | null; back_path: string | null; is_published: boolean;
  legacy: boolean; legacy_reason: string | null; intended_print_qty: number;
  notes: string | null; updated_at: string;
  orientation_override: "portrait" | "landscape" | null;
}
export interface CrownsVariant {
  id: number; card_id: number; name: string; variant_kind: string;
  border_treatment: string | null; pattern_treatment: string | null;
  team_color_match: boolean; jersey_number_match: boolean; serial_limit: number | null;
  signature_one_of_one: boolean; legacy: boolean; front_path: string | null; back_path: string | null;
  status: CardStatus; notes: string | null;
}
export interface CrownsCopy {
  id: number; card_id: number; variant_id: number | null;
  serial_number: number | null; status: string; notes: string | null;
}
export interface CrownsData {
  subjects: CrownsSubject[]; series: CrownsSeries[]; templates: CrownsTemplate[];
  cards: CrownsCard[]; variants: CrownsVariant[]; copies: CrownsCopy[];
}

export function crownsClient() {
  const client = getSupabaseClient();
  if (!client) throw new Error("The CROWNS database isn't connected.");
  return client;
}

export async function loadCrowns(): Promise<CrownsData> {
  const client = crownsClient();
  const [subjects, series, templates, cards, variants, copies] = await Promise.all([
    client.from("crowns_subjects").select("*").order("name"),
    client.from("crowns_series").select("*").order("sort_order"),
    client.from("crowns_templates").select("*").order("id"),
    client.from("crowns_cards").select("*").order("id"),
    client.from("crowns_variants").select("*").order("id"),
    client.from("crowns_copies").select("*").order("id"),
  ]);
  for (const response of [subjects, series, templates, cards, variants, copies]) {
    if (response.error) throw new Error(response.error.message);
  }
  return {
    subjects: (subjects.data ?? []) as CrownsSubject[],
    series: (series.data ?? []) as CrownsSeries[],
    templates: (templates.data ?? []) as CrownsTemplate[],
    cards: (cards.data ?? []) as CrownsCard[],
    variants: (variants.data ?? []) as CrownsVariant[],
    copies: (copies.data ?? []) as CrownsCopy[],
  };
}

export async function createCrownsRow(table: string, payload: Record<string, unknown>) {
  const { error } = await crownsClient().from(table).insert(payload);
  if (error) throw new Error(error.message);
}
export async function updateCrownsRow(table: string, idColumn: string, id: number | string, payload: Record<string, unknown>) {
  const { error } = await crownsClient().from(table).update(payload).eq(idColumn, id);
  if (error) throw new Error(error.message);
}

export const CROWNS_ASSETS_BUCKET = "crowns-card-assets";
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export async function uploadCardFace(
  kind: "cards" | "variants", id: number, side: "front" | "back", file: File,
): Promise<string> {
  if (!allowedTypes.has(file.type)) throw new Error("Use a PNG, JPEG, WebP, or AVIF image.");
  if (file.size > 20 * 1024 * 1024) throw new Error("Card images must be 20 MB or less.");
  const ext = file.type === "image/png" ? "png" : file.type === "image/jpeg" ? "jpg" : file.type === "image/avif" ? "avif" : "webp";
  const path = `${kind}/${id}/${side}-${crypto.randomUUID()}.${ext}`;
  const { error } = await crownsClient().storage.from(CROWNS_ASSETS_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  await updateCrownsRow(kind === "cards" ? "crowns_cards" : "crowns_variants", "id", id, {
    [`${side}_path`]: path,
    ...(kind === "cards" ? { updated_at: new Date().toISOString() } : {}),
  });
  return path;
}

export async function signedCrownsImages(data: CrownsData): Promise<Record<string, string>> {
  const paths = [...new Set([...data.cards, ...data.variants]
    .flatMap(item => [item.front_path, item.back_path]).filter((path): path is string => Boolean(path)))];
  if (paths.length === 0) return {};
  const { data: signed, error } = await crownsClient().storage.from(CROWNS_ASSETS_BUCKET)
    .createSignedUrls(paths, 3600);
  if (error) throw new Error(error.message);
  const urls: Record<string, string> = {};
  (signed ?? []).forEach((item, index) => {
    if (item.signedUrl) urls[paths[index]!] = item.signedUrl;
  });
  return urls;
}

export function cardLabel(card: CrownsCard, subjects: CrownsSubject[]) {
  const subject = subjects.find(s => s.id === card.subject_id);
  return card.title?.trim() || subject?.name || "Untitled card";
}
export function cardOrientation(card: CrownsCard, series: CrownsSeries[]): "portrait" | "landscape" {
  return card.orientation_override || series.find(s => s.slug === card.series_slug)?.orientation || "portrait";
}
export function humanize(label: string) {
  return label.replace(/-/g, " ").replace(/\b\w/g, match => match.toUpperCase());
}
