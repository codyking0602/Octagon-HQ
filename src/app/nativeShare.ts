import {
  canonicalDestinationUrl,
  type CanonicalDestination,
} from "./canonicalDestinations";

export type NativeShareOutcome = "shared" | "copied" | "cancelled" | "unavailable";

interface ShareNavigator {
  share?: (data: ShareData) => Promise<void>;
  clipboard?: {
    writeText: (text: string) => Promise<void>;
  };
}

export interface CanonicalShareRequest {
  destination: CanonicalDestination;
  title: string;
  text?: string;
}

export interface AppLinkShareRequest {
  url: string;
  title: string;
  text?: string;
}

export interface NativeShareRuntime {
  appOrigin?: string;
  navigator?: ShareNavigator;
  shareToken?: string;
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

function activeRuntime(runtime: NativeShareRuntime) {
  return {
    activeNavigator: runtime.navigator
      ?? (typeof navigator === "undefined" ? undefined : navigator),
    appOrigin: runtime.appOrigin
      ?? (typeof window === "undefined" ? "" : window.location.origin),
    shareToken: runtime.shareToken ?? Date.now().toString(36),
  };
}

function exactSameOriginUrl(value: string, appOrigin: string) {
  try {
    const origin = new URL(appOrigin);
    if (origin.protocol !== "https:" && origin.protocol !== "http:") return "";
    const url = new URL(value, `${origin.origin}/`);
    if (url.origin !== origin.origin) return "";
    return url.toString();
  } catch {
    return "";
  }
}

function versionedShareUrl(value: string, shareToken: string) {
  const url = new URL(value);
  url.searchParams.set("share", shareToken);
  return url.toString();
}

async function shareExactUrl(
  request: AppLinkShareRequest,
  activeNavigator: ShareNavigator | undefined,
  shareToken: string,
): Promise<NativeShareOutcome> {
  const url = versionedShareUrl(request.url, shareToken);
  const shareData: ShareData = {
    title: request.title,
    text: request.text,
    url,
  };

  if (activeNavigator?.share) {
    try {
      await activeNavigator.share(shareData);
      return "shared";
    } catch (error) {
      if (isAbortError(error)) return "cancelled";
    }
  }

  if (!activeNavigator?.clipboard?.writeText) return "unavailable";

  try {
    await activeNavigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return "unavailable";
  }
}

/**
 * Shares an existing reproducible Octagon HQ URL through the same native-share
 * owner. Cross-origin and non-web URLs are rejected instead of leaking them
 * into the platform share sheet.
 */
export async function shareAppLink(
  request: AppLinkShareRequest,
  runtime: NativeShareRuntime = {},
): Promise<NativeShareOutcome> {
  const { activeNavigator, appOrigin, shareToken } = activeRuntime(runtime);
  if (!appOrigin) return "unavailable";

  const url = exactSameOriginUrl(request.url, appOrigin);
  if (!url) return "unavailable";

  return shareExactUrl({ ...request, url }, activeNavigator, shareToken);
}

/**
 * The one owner for canonical app sharing. It opens the platform share sheet
 * when available and otherwise copies the exact destination URL with a fresh
 * preview token that the server removes from the canonical metadata.
 */
export async function shareCanonicalDestination(
  request: CanonicalShareRequest,
  runtime: NativeShareRuntime = {},
): Promise<NativeShareOutcome> {
  const { activeNavigator, appOrigin, shareToken } = activeRuntime(runtime);
  if (!appOrigin) return "unavailable";

  try {
    const url = canonicalDestinationUrl(request.destination, appOrigin);
    return shareExactUrl({ title: request.title, text: request.text, url }, activeNavigator, shareToken);
  } catch {
    return "unavailable";
  }
}
