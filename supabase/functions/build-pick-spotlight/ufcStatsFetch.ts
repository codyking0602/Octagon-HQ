const UFCSTATS_FETCH_MAX_ATTEMPTS = 3;
const UFCSTATS_RETRY_DELAYS_MS = [200, 500] as const;

const requestHeaders = {
  "User-Agent": "OctagonHQ/2.0 (+https://octagon.hq-app.workers.dev)",
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "en-US,en;q=0.9",
};

type FetchLike = (url: string, init: RequestInit) => Promise<Response>;
type DelayLike = (milliseconds: number) => Promise<void>;

export class UfcStatsFetchError extends Error {
  constructor(readonly label: string) {
    super(`${label} could not be loaded from UFCStats.`);
  }
}

export function isRetryableUfcStatsStatus(status: number) {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

function defaultDelay(milliseconds: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
}

export async function fetchUfcStatsHtml(
  url: string,
  label: string,
  fetchImpl: FetchLike = fetch,
  delay: DelayLike = defaultDelay,
) {
  for (let attempt = 1; attempt <= UFCSTATS_FETCH_MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetchImpl(url, { headers: requestHeaders, redirect: "follow" });
      if (response.ok) return await response.text();
      if (!isRetryableUfcStatsStatus(response.status)) throw new UfcStatsFetchError(label);
    } catch (error) {
      if (error instanceof UfcStatsFetchError) throw error;
      if (attempt === UFCSTATS_FETCH_MAX_ATTEMPTS) throw new UfcStatsFetchError(label);
    }

    if (attempt === UFCSTATS_FETCH_MAX_ATTEMPTS) throw new UfcStatsFetchError(label);
    await delay(UFCSTATS_RETRY_DELAYS_MS[attempt - 1] ?? UFCSTATS_RETRY_DELAYS_MS.at(-1)!);
  }

  throw new UfcStatsFetchError(label);
}
