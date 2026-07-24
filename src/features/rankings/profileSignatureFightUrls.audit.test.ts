import { describe, expect, it } from "vitest";
import { allTime } from "./rankingModel";
import { profileSignatureFightUrls } from "./profileSignatureFightUrls";

const requiredTitleTokens: Readonly<Record<string, readonly string[]>> = {
  "jon-jones": ["jones"],
  "georges-st-pierre": ["st-pierre", "st pierre", "gsp"],
  "anderson-silva": ["silva"],
  "demetrious-johnson": ["demetrious", "mighty mouse"],
  "islam-makhachev": ["makhachev"],
  "alexander-volkanovski": ["volkanovski"],
  "khabib-nurmagomedov": ["khabib", "nurmagomedov"],
  "matt-hughes": ["matt hughes", "hughes"],
  "kamaru-usman": ["usman"],
  "max-holloway": ["holloway"],
  "stipe-miocic": ["miocic"],
  "jose-aldo": ["aldo"],
  "randy-couture": ["couture"],
  "israel-adesanya": ["adesanya"],
  "daniel-cormier": ["cormier", "dc"],
  "alex-pereira": ["pereira"],
  "chuck-liddell": ["liddell"],
  "charles-oliveira": ["oliveira"],
  "tj-dillashaw": ["dillashaw"],
  "merab-dvalishvili": ["dvalishvili", "merab"],
  "frankie-edgar": ["edgar"],
  "francis-ngannou": ["ngannou"],
  "cain-velasquez": ["velasquez"],
  "benson-henderson": ["henderson"],
  "aljamain-sterling": ["sterling"],
  "junior-dos-santos": ["dos santos", "jds"],
  "bj-penn": ["penn"],
  "justin-gaethje": ["gaethje"],
  "tyron-woodley": ["woodley"],
  "glover-teixeira": ["teixeira"],
  "dustin-poirier": ["poirier"],
  "alex-pantoja": ["pantoja"],
  "leon-edwards": ["edwards"],
  "tito-ortiz": ["ortiz"],
  "ilia-topuria": ["topuria"],
  "fabricio-werdum": ["werdum"],
  "robbie-lawler": ["lawler"],
  "robert-whittaker": ["whittaker"],
  "tony-ferguson": ["ferguson"],
  "henry-cejudo": ["cejudo"],
  "chris-weidman": ["weidman"],
  "frank-shamrock": ["shamrock"],
  "petr-yan": ["petr yan", "yan"],
  "sean-strickland": ["strickland"],
  "deiveson-figueiredo": ["figueiredo"],
  "conor-mcgregor": ["mcgregor"],
  "brandon-moreno": ["moreno"],
  "vitor-belfort": ["belfort"],
  "lyoto-machida": ["machida"],
  "rashad-evans": ["evans"],
  "tom-aspinall": ["aspinall"],
  "dricus-du-plessis": ["du plessis", "dricus"],
  "dominick-cruz": ["cruz"],
  "royce-gracie": ["royce", "gracie"],
  "khamzat-chimaev": ["chimaev", "khamzat"],
  "michael-bisping": ["bisping"],
  "anthony-pettis": ["pettis"],
  "sean-omalley": ["o'malley", "omalley"],
  "quinton-jackson": ["rampage", "quinton jackson"],
  "shogun-rua": ["shogun", "rua"],
  "forrest-griffin": ["griffin"],
  "brock-lesnar": ["lesnar"],
  "dan-henderson": ["dan henderson", "hendo"],
  "chael-sonnen": ["sonnen"],
  "paddy-pimblett": ["pimblett"],
  "amanda-nunes": ["nunes"],
  "valentina-shevchenko": ["shevchenko"],
  "zhang-weili": ["zhang", "weili"],
  "joanna-jedrzejczyk": ["jedrzejczyk", "jędrzejczyk"],
  "rose-namajunas": ["namajunas"],
  "ronda-rousey": ["rousey"],
  "jessica-andrade": ["andrade"],
  "cris-cyborg": ["cyborg"],
  "carla-esparza": ["esparza"],
  "alexa-grasso": ["grasso"],
  "kayla-harrison": ["harrison"],
  "mackenzie-dern": ["dern"],
  "julianna-pena": ["pena", "peña"],
  "miesha-tate": ["tate"],
  "holly-holm": ["holm"],
};

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
      return { slug, url, status: response.status, title: null, author: null, matchesFighter: false, error: `HTTP ${response.status}` };
    }
    const metadata = (await response.json()) as { title?: string; author_name?: string };
    const title = metadata.title ?? null;
    const normalizedTitle = title?.toLocaleLowerCase("en-US") ?? "";
    const tokens = requiredTitleTokens[slug] ?? [];
    return {
      slug,
      url,
      status: response.status,
      title,
      author: metadata.author_name ?? null,
      matchesFighter: tokens.some((token) => normalizedTitle.includes(token)),
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

async function mapWithConcurrency<T, R>(items: readonly T[], limit: number, worker: (item: T) => Promise<R>): Promise<R[]> {
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

describe("live Signature Fight URL audit", () => {
  it("points every ranked fighter to an available video whose title names that fighter", async () => {
    const rows = allTime.map((fighter) => ({
      slug: fighter.slug,
      url: profileSignatureFightUrls[fighter.slug as keyof typeof profileSignatureFightUrls],
    }));
    const results = await mapWithConcurrency(rows, 8, ({ slug, url }) => auditOne(slug, url));

    for (const result of results) {
      console.log(`[signature-audit] ${result.slug} | ${result.status} | ${result.title ?? result.error ?? "NO TITLE"} | ${result.url}`);
    }

    const duplicateAssignments = Object.entries(
      rows.reduce<Record<string, string[]>>((byUrl, row) => {
        (byUrl[row.url] ??= []).push(row.slug);
        return byUrl;
      }, {}),
    ).filter(([, slugs]) => slugs.length > 1);
    const failures = results.filter((result) => result.status !== 200 || !result.matchesFighter);

    console.log(`[signature-audit-summary] failures=${failures.length} duplicates=${duplicateAssignments.length}`);
    duplicateAssignments.forEach(([url, slugs]) => console.log(`[signature-audit-duplicate] ${slugs.join(", ")} | ${url}`));

    expect({
      failures: failures.map(({ slug, status, title, error, url }) => ({ slug, status, title, error, url })),
      duplicateAssignments,
    }).toEqual({ failures: [], duplicateAssignments: [] });
  }, 180_000);
});
