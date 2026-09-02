const CANONICAL_HOSTNAME = "the.hq-app.workers.dev";

export const LEGACY_REDIRECT_STATUS = 308;

export function legacyOctagonRedirect(request: Request) {
  const destination = new URL(request.url);
  destination.protocol = "https:";
  destination.hostname = CANONICAL_HOSTNAME;
  destination.port = "";
  return Response.redirect(destination.toString(), LEGACY_REDIRECT_STATUS);
}

export default {
  fetch: legacyOctagonRedirect,
};
