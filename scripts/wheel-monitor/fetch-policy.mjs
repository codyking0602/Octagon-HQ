// One shared conservative live-source retry policy for the read-only monitor.
// Rate limits and transient outages are retried; bad credentials/404s fail fast.
// No partial provider response may be promoted to a certified checkpoint.
const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

function retryDelay(response, attempt) {
  const header=response?.headers?.get?.("retry-after");
  const seconds=header != null && String(header).trim() !== "" ? Number(header) : NaN;
  if(Number.isFinite(seconds) && seconds >= 0)
    return Math.min(Math.round(seconds * 1000), 20000);
  return 500 * (attempt + 1);
}

export async function fetchWithRetry(url, options={}, attempts=3, deps={}) {
  if(!Number.isInteger(attempts) || attempts < 1) throw new Error("Invalid source retry count");
  const fetchImpl=deps.fetchImpl ?? fetch;
  const sleep=deps.sleep ?? (ms=>new Promise(ok=>setTimeout(ok,ms)));
  const timeoutMs=deps.timeoutMs ?? 15000;
  let last;
  for(let attempt=0;attempt<attempts;attempt++) {
    const ctl=new AbortController();
    const timer=setTimeout(()=>ctl.abort(),timeoutMs);
    let delay=500*(attempt+1);
    try {
      const response=await fetchImpl(url,{...options,signal:ctl.signal,
        headers:{"User-Agent":"OctagonHQ-WheelMonitor/3.1 (read-only)",
          Accept:"application/json,text/html",...options.headers}});
      if(response.ok) return response;
      const failure=new Error(url+" returned HTTP "+response.status);
      if(!RETRYABLE_STATUS.has(response.status)) throw failure;
      last=failure;
      delay=retryDelay(response,attempt);
    } catch(error) {
      // A real permanent HTTP response should not multiply bad requests.
      if(/ returned HTTP (?!408\b|425\b|429\b|500\b|502\b|503\b|504\b)\d{3}$/.test(String(error?.message??"")))
        throw error;
      last=error;
    } finally {
      clearTimeout(timer);
    }
    if(attempt+1<attempts) await sleep(delay);
  }
  throw last ?? new Error("Source not available: "+url);
}

/**
 * Retry a 200 OK HTML page only when its *structure* is invalid.
 * CDN challenge pages may answer HTTP 200 and must never be certified.
 * HTTP/network failures continue to follow fetchWithRetry's independent
 * bounded transport policy; permanent HTTP errors do not multiply requests.
 */
export async function readStructurallyValidatedHtml(readHtml,parseHtml,attempts=2,deps={}) {
  if(typeof readHtml!=="function" || typeof parseHtml!=="function" ||
    !Number.isInteger(attempts) || attempts<1 || attempts>3)
    throw new Error("Invalid structurally validated HTML source configuration");
  const sleep=deps.sleep??(ms=>new Promise(ok=>setTimeout(ok,ms)));
  let last;
  for(let n=0;n<attempts;n++){
    // Transport failures are independently classified by fetchWithRetry:
    // do not turn a permanent 401/403 into another request.
    const html=await readHtml();
    try {
      return parseHtml(html);
    } catch(error) {
      last=error;
      if(n+1<attempts) await sleep(500*(n+1));
    }
  }
  throw last ?? new Error("HTML source failed structural validation");
}
