import { UPDATE_RECOVERY_CACHE_CONTROL, isDeploymentMarkerPath } from "./updateRecoveryHeaders";

const CANONICAL_HOSTNAME = "the.hq-app.workers.dev";

export const LEGACY_REDIRECT_STATUS = 308;

export function legacyOctagonRedirect(request: Request) {
  const source = new URL(request.url);
  const destination = new URL(request.url);
  destination.protocol = "https:";
  destination.hostname = CANONICAL_HOSTNAME;
  destination.port = "";

  const headers = new Headers({ Location: destination.toString() });
  if (isDeploymentMarkerPath(source.pathname)) {
    headers.set("Cache-Control", UPDATE_RECOVERY_CACHE_CONTROL);
    headers.set("Pragma", "no-cache");
    headers.set("Expires", "0");
    headers.set("Access-Control-Allow-Origin", "*");
  }

  return new Response(null, {
    status: LEGACY_REDIRECT_STATUS,
    headers,
  });
}

export default {
  fetch: legacyOctagonRedirect,
};
