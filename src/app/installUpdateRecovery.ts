declare const __OCTAGON_DEPLOYMENT_SHA__: string;

const UPDATE_RELOAD_KEY = "octagon-hq:update-reload-at";
const UPDATE_TARGET_SHA_KEY = "octagon-hq:update-target-sha";
const UPDATE_CACHE_BUST_PARAM = "hq-update";
const UPDATE_RELOAD_COOLDOWN_MS = 15_000;
const SHA_PATTERN = /^[0-9a-f]{40}$/i;

interface UpdateRecoveryOptions {
  target?: Window;
  documentTarget?: Document;
  storage?: Storage;
  reload?: () => void;
  now?: () => number;
  runningSha?: string;
  fetchDeploymentSha?: () => Promise<string | null>;
}

interface ForceRefreshLatestBuildOptions {
  href?: string;
  storage?: Storage;
  navigate?: (url: string) => void;
  now?: () => number;
}

function normalizedSha(value: unknown) {
  const sha = typeof value === "string" ? value.trim().toLowerCase() : "";
  return SHA_PATTERN.test(sha) ? sha : "";
}

function latestBuildUrl(href: string, token: string) {
  const url = new URL(href);
  url.searchParams.set(UPDATE_CACHE_BUST_PARAM, token);
  return url.toString();
}

export function forceRefreshLatestBuild({
  href = window.location.href,
  storage = window.sessionStorage,
  navigate = (url) => window.location.replace(url),
  now = () => Date.now(),
}: ForceRefreshLatestBuildOptions = {}) {
  storage.removeItem(UPDATE_RELOAD_KEY);
  storage.removeItem(UPDATE_TARGET_SHA_KEY);
  navigate(latestBuildUrl(href, String(now())));
}

export function installUpdateRecovery({
  target = window,
  documentTarget = window.document,
  storage = window.sessionStorage,
  reload,
  now = () => Date.now(),
  runningSha = __OCTAGON_DEPLOYMENT_SHA__,
  fetchDeploymentSha,
}: UpdateRecoveryOptions = {}) {
  const activeSha = normalizedSha(runningSha);
  let disposed = false;
  let checkingDeployment = false;

  const reloadPage = (targetSha = "") => {
    if (reload) {
      reload();
      return;
    }
    target.location.replace(latestBuildUrl(target.location.href, targetSha || String(now())));
  };

  const reloadOnce = (targetSha = "") => {
    const current = now();
    const previous = Number(storage.getItem(UPDATE_RELOAD_KEY) ?? "0");
    const previousTarget = storage.getItem(UPDATE_TARGET_SHA_KEY) ?? "";
    const sameRecentTarget = targetSha
      && previousTarget === targetSha
      && previous > 0
      && current - previous < UPDATE_RELOAD_COOLDOWN_MS;
    const recentGenericReload = !targetSha
      && previous > 0
      && current - previous < UPDATE_RELOAD_COOLDOWN_MS;
    if (sameRecentTarget || recentGenericReload) return;

    storage.setItem(UPDATE_RELOAD_KEY, String(current));
    if (targetSha) storage.setItem(UPDATE_TARGET_SHA_KEY, targetSha);
    reloadPage(targetSha);
  };

  const readLiveDeploymentSha = fetchDeploymentSha ?? (async () => {
    if (!activeSha) return null;
    const markerUrl = new URL("/deployment.json", target.location.origin);
    markerUrl.searchParams.set("running", activeSha);
    markerUrl.searchParams.set("check", String(now()));
    const response = await target.fetch(markerUrl, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, max-age=0",
        Pragma: "no-cache",
      },
    });
    if (!response.ok) return null;
    const marker = await response.json() as { sha?: unknown };
    return normalizedSha(marker.sha) || null;
  });

  const checkForDeploymentUpdate = async () => {
    if (!activeSha || disposed || checkingDeployment) return;
    checkingDeployment = true;
    try {
      const liveSha = normalizedSha(await readLiveDeploymentSha());
      if (!liveSha) return;
      if (liveSha === activeSha) {
        storage.removeItem(UPDATE_TARGET_SHA_KEY);
        return;
      }
      reloadOnce(liveSha);
    } catch {
      // A transient marker failure must never block the running app.
    } finally {
      checkingDeployment = false;
    }
  };

  const handlePreloadError = (event: Event) => {
    event.preventDefault();
    reloadOnce();
  };
  const handlePageShow = () => {
    void checkForDeploymentUpdate();
  };
  const handleVisibilityChange = () => {
    if (documentTarget.visibilityState === "visible") void checkForDeploymentUpdate();
  };

  target.addEventListener("vite:preloadError", handlePreloadError);
  target.addEventListener("pageshow", handlePageShow);
  documentTarget.addEventListener("visibilitychange", handleVisibilityChange);
  void checkForDeploymentUpdate();

  return () => {
    disposed = true;
    target.removeEventListener("vite:preloadError", handlePreloadError);
    target.removeEventListener("pageshow", handlePageShow);
    documentTarget.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}
