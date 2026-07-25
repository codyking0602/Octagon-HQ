import fs from "node:fs";
import path from "node:path";

const configuredUrl = process.env.VITE_SUPABASE_URL;
if (!configuredUrl) {
  throw new Error("VITE_SUPABASE_URL is required to build the Octagon HQ Worker proxy.");
}

const upstream = new URL(configuredUrl);
const projectMatch = /^([a-z0-9-]+)\.supabase\.co$/i.exec(upstream.hostname);
if (upstream.protocol !== "https:" || !projectMatch) {
  throw new Error("VITE_SUPABASE_URL must be the canonical https://<project-ref>.supabase.co URL.");
}

const projectRef = projectMatch[1];
const workerSource = `const PROJECT_REF = ${JSON.stringify(projectRef)};
const PROXY_PREFIX = \`/api/supabase/\${PROJECT_REF}\`;
const UPSTREAM_ORIGIN = \`https://\${PROJECT_REF}.supabase.co\`;
const ALLOWED_SERVICE_PREFIXES = [
  "/auth/v1",
  "/functions/v1",
  "/realtime/v1",
  "/rest/v1",
  "/storage/v1",
];
const ALLOWED_METHODS = new Set(["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]);

function serviceAllowed(pathname) {
  return ALLOWED_SERVICE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(\`\${prefix}/\`),
  );
}

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8",
      "x-octagon-supabase-proxy": "1",
    },
  });
}

export default {
  async fetch(request, env) {
    const requestUrl = new URL(request.url);
    const usesProxy = requestUrl.pathname === PROXY_PREFIX
      || requestUrl.pathname.startsWith(\`\${PROXY_PREFIX}/\`);

    if (!usesProxy) return env.ASSETS.fetch(request);
    if (!ALLOWED_METHODS.has(request.method)) {
      return jsonResponse({ message: "Method not allowed." }, 405);
    }

    const upstreamPath = requestUrl.pathname.slice(PROXY_PREFIX.length) || "/";
    if (!serviceAllowed(upstreamPath)) {
      return jsonResponse({ message: "Supabase service not available through this route." }, 404);
    }

    const upstreamUrl = new URL(\`\${upstreamPath}\${requestUrl.search}\`, UPSTREAM_ORIGIN);
    const headers = new Headers(request.headers);
    headers.delete("cf-connecting-ip");
    headers.delete("cf-ipcountry");
    headers.delete("cf-ray");
    headers.delete("cf-visitor");
    headers.delete("host");

    const init = {
      method: request.method,
      headers,
      redirect: "manual",
    };
    if (request.method !== "GET" && request.method !== "HEAD") {
      init.body = request.body;
    }

    try {
      const upstreamResponse = await fetch(upstreamUrl, init);
      const responseHeaders = new Headers(upstreamResponse.headers);
      responseHeaders.delete("access-control-allow-credentials");
      responseHeaders.delete("access-control-allow-origin");
      responseHeaders.set("cache-control", "no-store");
      responseHeaders.set("x-octagon-supabase-proxy", "1");

      return new Response(upstreamResponse.body, {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers: responseHeaders,
      });
    } catch {
      return jsonResponse({ message: "Octagon HQ could not reach its profile service." }, 502);
    }
  },
};
`;

const outputPath = path.join("dist", "worker.js");
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, workerSource);
console.log(`Built locked Supabase proxy for project ${projectRef}.`);
