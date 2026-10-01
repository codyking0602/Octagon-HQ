import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";

const pageSource = readFileSync("src/features/play/AverageFanPrototypePage.tsx", "utf8");
const pageCss = readFileSync("src/features/play/AverageFanPrototypePage.css", "utf8");
const routerSource = readFileSync("src/app/router.tsx", "utf8");
const appShellSource = readFileSync("src/app/AppShell.tsx", "utf8");
const officialDailySource = readFileSync("src/features/play/OfficialAverageFanDailyView.tsx", "utf8");

const portraitPaths = [
  "public/assets/average-fan/average-fan-shane.png",
  "public/assets/average-fan/average-fan-cody.png",
  "public/assets/average-fan/average-fan-lib.png",
  "public/assets/average-fan/average-fan-tyler.png",
  "public/assets/average-fan/average-fan-troy.png",
] as const;

function paeth(a: number, b: number, c: number) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function pngAlphaStats(path: string) {
  const png = readFileSync(path);
  expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let interlace = 0;
  const idat: Buffer[] = [];

  while (offset < png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.subarray(offset + 4, offset + 8).toString("ascii");
    const start = offset + 8;
    const end = start + length;
    if (type === "IHDR") {
      width = png.readUInt32BE(start);
      height = png.readUInt32BE(start + 4);
      bitDepth = png[start + 8]!;
      colorType = png[start + 9]!;
      interlace = png[start + 12]!;
    } else if (type === "IDAT") {
      idat.push(png.subarray(start, end));
    }
    offset = end + 4;
    if (type === "IEND") break;
  }

  expect(bitDepth).toBe(8);
  expect(colorType).toBe(6);
  expect(interlace).toBe(0);

  const bytesPerPixel = 4;
  const stride = width * bytesPerPixel;
  const inflated = inflateSync(Buffer.concat(idat));
  expect(inflated.length).toBe((stride + 1) * height);

  let previous = Buffer.alloc(stride);
  let cursor = 0;
  let transparent = 0;
  let opaque = 0;

  for (let y = 0; y < height; y += 1) {
    const filter = inflated[cursor++]!;
    const row = Buffer.allocUnsafe(stride);
    for (let x = 0; x < stride; x += 1) {
      const raw = inflated[cursor++]!;
      const left = x >= bytesPerPixel ? row[x - bytesPerPixel]! : 0;
      const up = previous[x]!;
      const upperLeft = x >= bytesPerPixel ? previous[x - bytesPerPixel]! : 0;
      let value = raw;
      if (filter === 1) value = (raw + left) & 0xff;
      else if (filter === 2) value = (raw + up) & 0xff;
      else if (filter === 3) value = (raw + Math.floor((left + up) / 2)) & 0xff;
      else if (filter === 4) value = (raw + paeth(left, up, upperLeft)) & 0xff;
      else if (filter !== 0) throw new Error(`Unsupported PNG filter ${filter} in ${path}`);
      row[x] = value;
    }

    for (let x = 3; x < stride; x += bytesPerPixel) {
      const alpha = row[x]!;
      if (alpha <= 16) transparent += 1;
      if (alpha >= 239) opaque += 1;
    }
    previous = row;
  }

  return { width, height, transparent, opaque, pixels: width * height };
}

describe("Average Fan locked gameplay stage", () => {
  it("uses the approved 1536x864 production plate on one fixed landscape stage", () => {
    expect(pageSource).toContain("const AVERAGE_FAN_GAMEPLAY_STAGE_WIDTH = 1536;");
    expect(pageSource).toContain("const AVERAGE_FAN_GAMEPLAY_STAGE_HEIGHT = 864;");
    expect(pageSource).toContain('src={AVERAGE_FAN_GAMEPLAY_STAGE_SRC}');
    expect(pageSource).toContain('"/assets/average-fan/average-fan-gameplay-stage.png"');
    expect(pageSource).toContain("viewport.width / AVERAGE_FAN_GAMEPLAY_STAGE_WIDTH");
    expect(pageSource).toContain("viewport.height / AVERAGE_FAN_GAMEPLAY_STAGE_HEIGHT");
    expect(pageSource).toContain('translate(-50%, -50%) scale(${stageScale})');
    expect(pageCss).toMatch(/\.average-fan-game-stage \{[\s\S]*?width: 1536px;[\s\S]*?height: 864px;/);
    expect(pageCss).toMatch(/\.average-fan-game-stage__plate \{[\s\S]*?width: 1536px;[\s\S]*?height: 864px;[\s\S]*?object-fit: contain;/);
  });

  it("keeps the fixed gameplay canvas centered after clearing old inset rules", () => {
    expect(pageCss).toMatch(
      /\/\* Average Fan gameplay stage plate[\s\S]*?\.average-fan-game-stage \{[\s\S]*?inset: auto;[\s\S]*?left: 50%;[\s\S]*?top: 50%;[\s\S]*?width: 1536px;[\s\S]*?height: 864px;[\s\S]*?padding: 0;/,
    );
  });

  it("pins the game to the large iPhone viewport without moving the whole stage for keyboard occlusion", () => {
    expect(pageCss).toMatch(/\/\* Average Fan gameplay stage plate[\s\S]*?\.average-fan-game \{[\s\S]*?width: 100lvw;[\s\S]*?height: 100lvh;[\s\S]*?overscroll-behavior: none;/);
    expect(pageSource).toContain('useAverageFanScreenLock();');
    expect(pageSource).toContain('root.style.overflow = "hidden"');
    expect(pageSource).toContain('body.style.overflow = "hidden"');
    expect(pageSource).toContain('root.style.overscrollBehavior = "none"');
    expect(pageSource).toContain('body.style.overscrollBehavior = "none"');
    expect(pageSource).toContain("answerShift");
    expect(pageSource).not.toContain("keyboardShift");
    expect(pageSource).toContain('width: "100lvw"');
    expect(pageSource).toContain('height: "100lvh"');
  });

  it("keeps live gameplay over the baked stage instead of rebuilding the host or desk", () => {
    const gameplayStart = pageSource.indexOf("function AverageFanGame");
    const gameplayEnd = pageSource.indexOf("export default function AverageFanPrototypePage", gameplayStart);
    const gameplaySource = pageSource.slice(gameplayStart, gameplayEnd);
    expect(gameplaySource).not.toContain("<StudioBackdrop");
    expect(gameplaySource).not.toContain("<HostArt");
    expect(gameplaySource).toContain("<GameplayFanDesk fan={fan} />");
    expect(gameplaySource).toContain("<MoneyRail");
    expect(gameplaySource).toContain("<HelpRail");
    expect(pageCss).toContain('background-image: url("/assets/average-fan/average-fan-gameplay-stage.png");');
  });

  it("wires every semantic fan portrait and verifies the repo PNGs contain substantial transparency", () => {
    for (const path of portraitPaths) {
      const assetPath = "/" + path.replace(/^public\//, "");
      expect(pageSource).toContain(assetPath);
      const stats = pngAlphaStats(path);
      expect(stats.width).toBeGreaterThan(500);
      expect(stats.height).toBeGreaterThan(500);
      expect(stats.transparent / stats.pixels).toBeGreaterThan(0.05);
      expect(stats.opaque / stats.pixels).toBeGreaterThan(0.05);
    }
  });

  it("keeps the corrected Tyler and Lib pictured identities in gameplay", () => {
    expect(pageSource).toContain('lib: "/assets/average-fan/average-fan-tyler.png"');
    expect(pageSource).toContain('tyler: "/assets/average-fan/average-fan-lib.png"');
  });

  it("lets the live subject board cover the baked question template cleanly", () => {
    expect(pageSource).toContain('phase === "board" ? " is-board" : ""');
    expect(pageSource).toContain("<b>{averageFanGradeLabel(grade)}</b>");
    expect(pageSource).not.toContain('.replace(" Grade", "")');
    expect(pageSource).toContain("data-subject-tone={averageFanSubjectTone(question.subject)}");
    expect(pageCss).toMatch(/\.average-fan-game-chalkboard\.is-board::before \{[\s\S]*?background:/);
    expect(pageCss).toContain('button[data-subject-tone="red"]');
    expect(pageCss).toContain('button[data-subject-tone="blue"]');
    expect(pageCss).toContain('button[data-subject-tone="gold"]');
    expect(pageCss).toContain('button[data-subject-tone="purple"]');
    expect(pageCss).toMatch(/\/\* Average Fan gameplay stage plate[\s\S]*?\.average-fan-game-fan \{[\s\S]*?z-index: 12;/);
    expect(pageCss).toMatch(/\.average-fan-answer-stage \{[\s\S]*?z-index: 10;/);
  });

  it("fills the baked yellow grade frame with the live blue grade pill", () => {
    expect(pageCss).toMatch(/\/\* Average Fan gameplay stage plate[\s\S]*?\.average-fan-question-card header b \{[\s\S]*?left: 14px;[\s\S]*?top: 9px;[\s\S]*?width: 254px;[\s\S]*?height: 76px;[\s\S]*?font-size: 22px;/);
  });

  it("keeps all answer formats below the chalkboard and keyboard-safe", () => {
    expect(pageSource).toContain('className="average-fan-answer-stage"');
    expect(pageSource).toContain('question.format === "four-choice"');
    expect(pageSource).toContain('data-choice-count={question.choices!.length}');
    expect(pageCss).not.toContain('data-choice-count="3"');
    expect(pageSource).toContain('average-fan-choice-grid--tf');
    expect(pageSource).toContain('className="average-fan-short-answer"');
    expect(pageSource).toContain('inputMode="text"');
    expect(pageSource).not.toContain("autoFocus");
    expect(pageSource).toContain("keyboardOcclusion");
    expect(pageSource).toContain('width: "100lvw"');
    expect(pageSource).toContain('height: "100lvh"');
    expect(pageSource).toContain("const keyboardOpen = keyboardOcclusion > 80");
    expect(pageSource).toContain("measureAverageFanLargeViewport()");
    expect(pageSource).not.toContain('top: `calc(50% - ${keyboardShift}px)`');
    expect(pageSource).toContain('transform: `translateY(-${answerShift}px)`');
    expect(pageCss).toMatch(/\.average-fan-answer-stage \{[\s\S]*?top: 566px;[\s\S]*?width: 846px;[\s\S]*?height: 164px;/);
    expect(pageCss).toMatch(/\.average-fan-game-fan__portrait \{[\s\S]*?left: 34%;[\s\S]*?width: 224px;[\s\S]*?height: 342px;/);
    expect(pageSource).not.toContain("Q{displayedQuestionNumber}");
  });

  it("keeps the approved implementation covered while closing Casual app access", () => {
    expect(pageSource).toContain('searchParams.get("screen") === "gameplay"');
    expect(pageSource).toContain('searchParams.get("fan")');
    expect(pageSource).toContain('buildAverageFanCasualBoard(casualSport');
    expect(pageSource).toContain('searchParams.get("sport")');
    expect(pageSource).toContain('requestedSport === "nfl" || requestedSport === "cfb" || requestedSport === "ufc"');
    expect(routerSource).toContain('path: "play/average-fan", element: <TodayChallengeGameRoute gameType="average_fan" casual={<Navigate to="/play" replace />} />');
    expect(routerSource).toContain('path: "play/average-fan-preview", element: <Navigate to="/play" replace />');
    expect(routerSource).not.toContain('<AverageFanPrototypePage />');
    expect(appShellSource).toContain('location.pathname === "/play/average-fan"');
    expect(appShellSource).toMatch(/\{isAverageFanGame \? \(\s*<main[\s\S]*?<Outlet \/>[\s\S]*?\) : \(\s*<BrandedPullToRefresh>/);
  });

  it("portals official Daily into document.body so app chrome cannot block the game", () => {
    expect(officialDailySource).toContain('import { createPortal } from "react-dom";');
    expect(officialDailySource).toContain("createPortal(content, document.body)");
    expect(officialDailySource).toContain("return averageFanTakeover(");
  });

  it("stops the money story on the first unsaved miss while keeping HQ play alive", () => {
    expect(pageSource).toContain('type GamePhase = "board" | "question" | "reveal" | "verdict"');
    expect(pageSource).toContain("YOU ARE NOT SMARTER THAN AN AVERAGE FAN");
    expect(pageSource).toContain("YOUR HQ SCORE IS STILL ALIVE");
    expect(pageSource).toContain(">KEEP PLAYING</button>");
    expect(pageSource).toContain("const firstUnsavedMiss = unsavedMisses[0] ?? null;");
    expect(pageSource).toContain("moneyAlive={moneyAlive}");
    expect(pageSource).toContain("lostAt={firstUnsavedMiss}");
    expect(pageSource).toContain('moneyAlive ? "GO FOR $1M" : "PLAY FINAL"');
    expect(pageCss).toContain(".average-fan-money-rail.is-frozen");
    expect(pageCss).toContain(".average-fan-money-row.is-lost");
    expect(pageCss).toContain(".average-fan-verdict");
  });

  it("keeps the gameplay screen landscape-only and chalk-first", () => {
    expect(pageCss).toContain("@media (orientation: portrait)");
    expect(pageCss).toContain('content: "↻\\A ROTATE TO PLAY\\A Average Fan is landscape only.";');
    expect(pageCss).toContain('"Chalkboard SE"');
    expect(pageCss).toMatch(/\.average-fan-game-chalkboard \{[\s\S]*?background: transparent;[\s\S]*?font-family:/);
  });
});
