import { writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { allTime } from "./rankingModel";
import { profileSignatureFightUrls } from "./profileSignatureFightUrls";

const describeAudit = process.env.SIGNATURE_FIGHT_AUDIT === "1" ? describe : describe.skip;

const specialTitleTokens: Readonly<Record<string, readonly string[]>> = {
  "jon-jones": ["jonjones", "jones", "джонджонс"],
  "demetrious-johnson": ["demetriousjohnson", "mightymouse"],
  "islam-makhachev": ["islammakhachev", "makhachev", "исламмахачев"],
  "alexander-volkanovski": ["alexandervolkanovski", "volkanovski", "александрволкановски"],
  "daniel-cormier": ["danielcormier", "cormier", "dc"],
  "francis-ngannou": ["francisngannou", "ngannou", "фрэнсиснганну"],
  "cain-velasquez": ["cainvelasquez", "velasquez", "кейневеласкес"],
  "aljamain-sterling": ["aljamainsterling", "sterling", "алджэмейнстерлинг"],
  "junior-dos-santos": ["juniordossantos", "dossantos", "джуниордоссантос"],
  "bj-penn": ["bjpenn", "penn", "ufc1007"],
  "fabricio-werdum": ["fabriciowerdum", "werdum", "вердум"],
  "henry-cejudo": ["henrycejudo", "cejudo", "генрисехудо"],
  "petr-yan": ["petryan", "yan", "петрян"],
  "sean-strickland": ["seanstrickland", "strickland", "шонстрикланд"],
  "quinton-jackson": ["quintonjackson", "rampage"],
  "shogun-rua": ["shogun", "rua"],
};

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("en-US")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

function expectedTokens(slug: string): readonly string[] {
  return specialTitleTokens[slug] ?? [normalize(slug.split("-").at(-1) ?? slug)];
}

interface AuditResult {
  slug: string;
  url: string;
  status: number;
  title: string | null;
  author: string | null;
  matchesFighter: boolean;
  error: string | null;
}

async function auditOne(slug: string, url: string): Promise<AuditResult> {
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  try {
    const response = await fetch(endpoint, { signal: AbortSignal.timeout(15_000) });
    if (!response.ok) {
      return {
        slug,
        url,
        status: response.status,
        title: null,
        author: null,
        matchesFighter: false,
        error: `HTTP ${response.status}`,
      };
    }

    const metadata = (await response.json()) as { title?: string; author_name?: string };
    const title = metadata.title ?? null;
    const normalizedTitle = normalize(title ?? "");
    return {
      slug,
      url,
      status: response.status,
      title,
      author: metadata.author_name ?? null,
      matchesFighter: expectedTokens(slug).some((token) => normalizedTitle.includes(normalize(token))),
      error: null,
    };
  } catch (error) {
    return {
      slug,
      url,
      status: 0,
      title: null,
      author: null,
      matchesFighter: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;
  async function run() {
    while (index < items.length) {
      const current = index++;
      results[current] = await worker(items[current]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

describeAudit("live Signature Fight URL audit", () => {
  it("audits availability, fighter/title match, and duplicate assignments", async () => {
    const rows = allTime.map((fighter) => ({
      slug: fighter.slug,
      url: profileSignatureFightUrls[fighter.slug as keyof typeof profileSignatureFightUrls],
    }));
    const results = await mapWithConcurrency(rows, 8, ({ slug, url }) => auditOne(slug, url));
    const duplicateAssignments = Object.entries(
      rows.reduce<Record<string, string[]>>((byUrl, row) => {
        (byUrl[row.url] ??= []).push(row.slug);
        return byUrl;
      }, {}),
    ).filter(([, slugs]) => slugs.length > 1);
    const failures = results.filter((result) => result.status !== 200 || !result.matchesFighter);
    const report = {
      generatedAt: new Date().toISOString(),
      total: results.length,
      available: results.filter((result) => result.status === 200).length,
      matched: results.filter((result) => result.matchesFighter).length,
      failures,
      duplicateAssignments,
      results,
    };

    writeFileSync("signature-fight-audit.json", `${JSON.stringify(report, null, 2)}\n`, "utf8");
    expect({ failures, duplicateAssignments }).toEqual({ failures: [], duplicateAssignments: [] });
  }, 180_000);
});
