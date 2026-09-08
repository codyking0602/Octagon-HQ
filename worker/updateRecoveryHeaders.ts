export const UPDATE_RECOVERY_CACHE_CONTROL = "no-store, no-cache, must-revalidate, max-age=0";

export function isDeploymentMarkerPath(pathname: string) {
  return pathname === "/deployment.json";
}

export function withUpdateRecoveryHeaders(response: Response, requestUrl: URL) {
  const contentType = response.headers.get("content-type") ?? "";
  const deploymentMarker = isDeploymentMarkerPath(requestUrl.pathname);
  const htmlShell = contentType.includes("text/html");
  if (!deploymentMarker && !htmlShell) return response;

  const headers = new Headers(response.headers);
  headers.set("Cache-Control", UPDATE_RECOVERY_CACHE_CONTROL);
  headers.set("Pragma", "no-cache");
  headers.set("Expires", "0");
  if (deploymentMarker) headers.set("Access-Control-Allow-Origin", "*");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
