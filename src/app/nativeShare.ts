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

export interface NativeShareRuntime {
  appOrigin?: string;
  navigator?: ShareNavigator;
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

/**
 * The one owner for native app sharing. It opens the platform share sheet when
 * available and otherwise copies the exact canonical URL.
 */
export async function shareCanonicalDestination(
  request: CanonicalShareRequest,
  runtime: NativeShareRuntime = {},
): Promise<NativeShareOutcome> {
  const activeNavigator = runtime.navigator
    ?? (typeof navigator === "undefined" ? undefined : navigator);
  const appOrigin = runtime.appOrigin
    ?? (typeof window === "undefined" ? "" : window.location.origin);

  if (!appOrigin) return "unavailable";

  const url = canonicalDestinationUrl(request.destination, appOrigin);
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
