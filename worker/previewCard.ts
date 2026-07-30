import type { RichPreviewKind, RichPreviewMetadata } from "./previewModel";

const CARD_LABELS: Record<RichPreviewKind, string> = {
  default: "OCTAGON HQ",
  fighter: "FIGHTER PROFILE",
  ranking: "UFC ALL-TIME RANKINGS",
  comparison: "FIGHTER COMPARISON",
  challenge: "GAME CHALLENGE",
  "game-result": "GAME RESULT",
  "picks-recap": "UFC PICKS RECAP",
  "major-ranking-update": "RANKING UPDATE",
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function absoluteUrl(path: string, origin: string) {
  return new URL(path, `${origin}/`).toString();
}

function visibleTitle(title: string) {
  return title.replace(/\s*\|\s*Octagon HQ\s*$/i, "").trim();
}

function hashText(value: string) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function previewCardFingerprint(preview: RichPreviewMetadata) {
  return hashText(JSON.stringify({
    kind: preview.kind,
    title: preview.title,
    description: preview.description,
    canonicalPath: preview.canonicalPath,
    images: preview.images.map((image) => image.path),
  }));
}

export function previewCardImagePath(preview: RichPreviewMetadata) {
  const fingerprint = previewCardFingerprint(preview);
  const path = encodeURIComponent(preview.canonicalPath);
  return `/share-preview/${preview.kind}-${fingerprint}.png?path=${path}`;
}

function imageMarkup(preview: RichPreviewMetadata, origin: string) {
  const images = preview.images.slice(0, 2);
  if (!images.length) return "";

  return images.map((image, index) => {
    const source = escapeHtml(absoluteUrl(image.path, origin));
    const alt = escapeHtml(image.alt);
    const artwork = image.path.includes("/assets/share/") || image.path.includes("app-icon");
    return `<div class="visual visual-${index + 1}${artwork ? " is-artwork" : ""}"><img src="${source}" alt="${alt}" /></div>`;
  }).join("");
}

function titleSize(title: string) {
  if (title.length > 70) return 55;
  if (title.length > 48) return 64;
  if (title.length > 30) return 72;
  return 82;
}

export function renderPreviewCardHtml(preview: RichPreviewMetadata, origin: string) {
  const label = escapeHtml(CARD_LABELS[preview.kind]);
  const title = visibleTitle(preview.title);
  const safeTitle = escapeHtml(title);
  const description = escapeHtml(preview.description);
  const visuals = imageMarkup(preview, origin);
  const hasTwoImages = preview.images.length > 1;
  const hasVisuals = preview.images.length > 0;
  const fontSize = titleSize(title);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=1200, initial-scale=1" />
<style>
*{box-sizing:border-box}html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#050505;font-family:Arial,Helvetica,sans-serif}body{color:#fff}.card{position:relative;width:1200px;height:630px;overflow:hidden;background:radial-gradient(circle at 82% 18%,rgba(197,14,14,.28),transparent 35%),linear-gradient(135deg,#050505 0%,#111 52%,#050505 100%)}.octagon{position:absolute;right:-105px;top:-112px;width:520px;height:520px;border:18px solid rgba(214,18,18,.28);transform:rotate(30deg);clip-path:polygon(30% 0,70% 0,100% 30%,100% 70%,70% 100%,30% 100%,0 70%,0 30%)}.rule{position:absolute;left:64px;top:58px;width:16px;height:514px;border-radius:8px;background:#d20a0a;box-shadow:0 0 36px rgba(210,10,10,.35)}.copy{position:absolute;z-index:4;left:112px;top:70px;width:${hasVisuals ? "610px" : "980px"};height:490px;display:flex;flex-direction:column}.brand{font-size:27px;font-weight:900;letter-spacing:4px;color:#ef2b2b}.label{margin-top:44px;font-size:21px;font-weight:900;letter-spacing:3px;color:#aaa}.title{margin:18px 0 0;font-size:${fontSize}px;line-height:1.02;letter-spacing:-2.2px;font-weight:950;text-transform:uppercase;text-wrap:balance}.description{margin:25px 0 0;max-width:600px;font-size:29px;line-height:1.28;font-weight:650;color:#d3d3d3;text-wrap:balance}.footer{margin-top:auto;display:flex;align-items:center;gap:14px;font-size:21px;font-weight:800;letter-spacing:2px;color:#888}.footer span{display:inline-block;width:9px;height:9px;border-radius:50%;background:#d20a0a}.media{position:absolute;z-index:2;right:0;top:0;width:520px;height:630px;display:grid;grid-template-columns:${hasTwoImages ? "1fr 1fr" : "1fr"};overflow:hidden}.visual{position:relative;min-width:0;height:630px;overflow:hidden;background:#0b0b0b}.visual img{width:100%;height:100%;object-fit:cover;object-position:50% 12%;filter:saturate(.95) contrast(1.03)}.visual.is-artwork img{object-fit:cover;object-position:center}.visual:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,5,5,.72) 0%,rgba(5,5,5,.08) 45%,rgba(5,5,5,.08) 100%)}.visual-2:after{background:linear-gradient(90deg,rgba(5,5,5,.08),rgba(5,5,5,.12))}.media:before{content:"";position:absolute;z-index:3;left:0;top:0;width:160px;height:100%;background:linear-gradient(90deg,#080808 0%,rgba(8,8,8,.82) 32%,transparent 100%)}.media:after{content:"";position:absolute;z-index:3;inset:auto 0 0 0;height:150px;background:linear-gradient(0deg,rgba(5,5,5,.75),transparent)}
</style>
</head>
<body>
<main class="card" data-kind="${escapeHtml(preview.kind)}">
  <div class="octagon"></div>
  <div class="rule"></div>
  <section class="copy">
    <div class="brand">OCTAGON HQ</div>
    <div class="label">${label}</div>
    <h1 class="title">${safeTitle}</h1>
    <p class="description">${description}</p>
    <div class="footer"><span></span>OPEN THE EXACT DESTINATION</div>
  </section>
  ${hasVisuals ? `<section class="media">${visuals}</section>` : ""}
</main>
</body>
</html>`;
}
