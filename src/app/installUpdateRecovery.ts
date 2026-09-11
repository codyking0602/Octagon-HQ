declare const __OCTAGON_DEPLOYMENT_SHA__: string;
declare const __OCTAGON_PRODUCTION_ORIGIN__: string;

const UPDATE_RELOAD_KEY = "octagon-hq:update-reload-at";
const UPDATE_TARGET_SHA_KEY = "octagon-hq:update-target-sha";
const ROUTE_LOAD_RECOVERY_KEY = "octagon-hq:route-load-recovery-at";
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
  productionOrigin?: string;
  fetchDeploymentSha?: () => Promise<string | null>;
}

interface ForceRefreshLatestBuildOptions {
  href?: string;
  storage?: Storage;
  navigate?: (url: string) => void;
  now?: () => number;
  productionOrigin?: string;
}

interface RecoverRouteLoadErrorOptions extends ForceRefreshLatestBuildOptions {
  error: unknown;
}

function normalizedSha(value: unknown) {
  const sha = typeof value === "string" ? value.trim().toLowerCase() : "";
  return SHA_PATTERN.test(sha) ? sha : "";
}

function runtimeProductionOrigin() {
  return typeof __OCTAGON_PRODUCTION_ORIGIN__ === "string" ? __OCTAGON_PRODUCTION_ORIGIN__ : "";
}

function normalizedProductionOrigin(value: unknown) {
  const candidate = typeof value === "string" ? value.trim() : "";
  if (!candidate) return "";
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" || url.protocol === "http:" ? url.origin : "";
  } catch {
    return "";
  }
}

function latestBuildUrl(href: string, token: string, productionOrigin = runtimeProductionOrigin()) {
  const current = new URL(href);
  const canonicalOrigin = normalizedProductionOrigin(productionOrigin);
  const url = canonicalOrigin && current.origin !== canonicalOrigin
    ? new URL(`${current.pathname}${current.search}${current.hash}`, `${canonicalOrigin}/`)
    : current;
  url.searchParams.set(UPDATE_CACHE_BUST_PARAM, token);
  return url.toString();
}

function routeLoadErrorMessage(error: unknown) {
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: unknown }).message ?? "");
  }
  return "";
}

export function isRecoverableRouteLoadError(error: unknown) {
  return /failed to fetch dynamically imported module|importing a module script failed|error loading dynamically imported module|unable to preload css|chunkloaderror|loading chunk .* failed/i
    .test(routeLoadErrorMessage(error));
}

export function recoverRouteLoadError({
  error,
  href = window.location.href,
  storage = window.sessionStorage,
  navigate = (url) => window.location.replace(url),
  now = () => Date.now(),
  productionOrigin = runtimeProductionOrigin(),
}: RecoverRouteLoadErrorOptions) {
  if (!isRecoverableRouteLoadError(error)) return false;

  const current = now();
  const previous = Number(storage.getItem(ROUTE_LOAD_RECOVERY_KEY) ?? "0");
  if (previous > 0 && current - previous < UPDATE_RELOAD_COOLDOWN_MS) return false;

  storage.setItem(ROUTE_LOAD_RECOVERY_KEY, String(current));
  forceRefreshLatestBuild({ href, storage, navigate, now: () => current, productionOrigin });
  return true;
}

export function forceRefreshLatestBuild({
  href = window.location.href,
  storage = window.sessionStorage,
  navigate = (url) => window.location.replace(url),
  now = () => Date.now(),
  productionOrigin = runtimeProductionOrigin(),
}: ForceRefreshLatestBuildOptions = {}) {
  storage.removeItem(UPDATE_RELOAD_KEY);
  storage.removeItem(UPDATE_TARGET_SHA_KEY);
  navigate(latestBuildUrl(href, String(now()), productionOrigin));
}

export function installUpdateRecovery({
  target = window,
  documentTarget = window.document,
  storage = window.sessionStorage,
  reload,
  now = () => Date.now(),
  runningSha = __OCTAGON_DEPLOYMENT_SHA__,
  productionOrigin = runtimeProductionOrigin(),
  fetchDeploymentSha,
}: UpdateRecoveryOptions = {}) {
  const activeSha = normalizedSha(runningSha);
  const canonicalOrigin = normalizedProductionOrigin(productionOrigin);
  let disposed = false;
  let checkingDeployment = false;

  const reloadPage = (targetSha = "") => {
    if (reload) {
      reload();
      return;
    }
    target.location.replace(latestBuildUrl(
      target.location.href,
      targetSha || String(now()),
      canonicalOrigin,
    ));
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
    const markerUrl = new URL("/deployment.json", canonicalOrigin || target.location.origin);
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
