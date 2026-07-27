const [ufcUrl, articleUrl] = process.argv.slice(2);
if (!ufcUrl || !articleUrl) {
  console.error("Usage: node scripts/live-event-source-contract.mjs <ufc-event-url> <mma-mania-article-url>");
  process.exit(2);
}
if (!/^https:\/\/(?:www\.)?ufc\.com\/event\//.test(ufcUrl) || !/^https:\/\/(?:www\.)?mmamania\.com\//.test(articleUrl)) {
  console.error("Both exact allow-listed source URLs are required."); process.exit(2);
}
const fetchBounded=async(url)=>{const response=await fetch(url,{signal:AbortSignal.timeout(8000),headers:{"user-agent":"OctagonHQ-contract/1.0"}});if(!response.ok)throw new Error(`HTTP ${response.status} from ${new URL(url).hostname}`);const body=await response.text();if(Buffer.byteLength(body)>2_000_000)throw new Error("response exceeds 2 MB");return {url,status:response.status,bytes:Buffer.byteLength(body),structuredData:(body.match(/application\/ld\+json/g)||[]).length,semanticArticles:(body.match(/<article\b/gi)||[]).length};};
// This deliberately performs no authentication and has no database client. It is
// a source availability/evidence probe; deployed preview verification uses the
// separate authenticated verifier.
console.log(JSON.stringify({ufc:await fetchBounded(ufcUrl),mmaMania:await fetchBounded(articleUrl),writes:false},null,2));
