import type { PickGroupResult, PickWatchMoment } from "./picksModel";

export interface PicksRecapStory {
  label: string;
  title: string;
  detail: string;
}

export interface PicksRecapShareImageInput {
  eventName: string;
  subtitle: string;
  eventMeta: string;
  championLabel: string;
  champions: string;
  winningPoints: number;
  players: number;
  groupAccuracy: number;
  totalPicks: number;
  groupRecord: string;
  stories: PicksRecapStory[];
  standings: PickGroupResult[];
  watchMoments: PickWatchMoment[];
}

const WIDTH = 1080;
const HEIGHT = 1600;
const PAD = 44;

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function panel(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  border = "rgba(255,255,255,.18)",
  fill = "#111111",
) {
  roundedRect(context, x, y, width, height, 18);
  context.fillStyle = fill;
  context.fill();
  context.strokeStyle = border;
  context.lineWidth = 2;
  context.stroke();
}

function fitText(context: CanvasRenderingContext2D, value: string, maxWidth: number, startSize: number, minSize = 22) {
  let size = startSize;
  while (size > minSize) {
    context.font = `900 ${size}px system-ui, -apple-system, sans-serif`;
    if (context.measureText(value).width <= maxWidth) break;
    size -= 2;
  }
  return size;
}

function wrapLines(context: CanvasRenderingContext2D, value: string, maxWidth: number, maxLines: number) {
  const words = value.trim().split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (context.measureText(next).width <= maxWidth || !line) {
      line = next;
      continue;
    }
    lines.push(line);
    line = word;
    if (lines.length === maxLines - 1) break;
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (lines.join(" ").length < value.trim().length && lines.length) {
    let last = lines.at(-1) ?? "";
    while (last.length > 1 && context.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
    lines[lines.length - 1] = `${last}…`;
  }
  return lines;
}

function text(
  context: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  size: number,
  color = "#ffffff",
  weight = 800,
  align: CanvasTextAlign = "left",
) {
  context.font = `${weight} ${size}px system-ui, -apple-system, sans-serif`;
  context.fillStyle = color;
  context.textAlign = align;
  context.textBaseline = "top";
  context.fillText(value, x, y);
}

function drawStat(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  label: string,
  value: string,
) {
  panel(context, x, y, width, 112);
  text(context, label, x + 20, y + 18, 18, "#a8a8ad", 900);
  text(context, value, x + 20, y + 48, 40, "#ffffff", 950);
}

function drawStory(
  context: CanvasRenderingContext2D,
  story: PicksRecapStory,
  x: number,
  y: number,
  width: number,
) {
  panel(context, x, y, width, 156);
  text(context, story.label, x + 20, y + 18, 17, "#ff8a1f", 950);
  const titleSize = fitText(context, story.title, width - 40, 27, 20);
  text(context, story.title, x + 20, y + 50, titleSize, "#ffffff", 900);
  context.font = "700 18px system-ui, -apple-system, sans-serif";
  const detailLines = wrapLines(context, story.detail, width - 40, 2);
  detailLines.forEach((line, index) => text(context, line, x + 20, y + 98 + index * 24, 18, "#9f9fa5", 700));
}

function fileSlug(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "octagon-hq";
}

function canvasBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("The recap image could not be rendered."));
    }, "image/png");
  });
}

export async function createPicksRecapShareImage(input: PicksRecapShareImageInput) {
  if (typeof document === "undefined") throw new Error("Recap image rendering requires a browser.");
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Recap image rendering is unavailable.");

  const gradient = context.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, "#080808");
  gradient.addColorStop(.55, "#0f0909");
  gradient.addColorStop(1, "#050505");
  context.fillStyle = gradient;
  context.fillRect(0, 0, WIDTH, HEIGHT);

  roundedRect(context, 18, 18, WIDTH - 36, HEIGHT - 36, 28);
  context.strokeStyle = "rgba(255,196,61,.55)";
  context.lineWidth = 3;
  context.stroke();

  text(context, "OCTAGON", PAD, 42, 28, "#ffffff", 950);
  text(context, "HQ", PAD + 162, 42, 28, "#ef2727", 950);
  text(context, "ARCHIVED EVENT RECAP", WIDTH - PAD, 48, 21, "#d9a83e", 950, "right");

  const eventSize = fitText(context, input.eventName.toUpperCase(), WIDTH - PAD * 2, 68, 38);
  text(context, input.eventName.toUpperCase(), WIDTH / 2, 104, eventSize, "#ffffff", 950, "center");
  const subtitleSize = fitText(context, input.subtitle, WIDTH - PAD * 2, 34, 24);
  text(context, input.subtitle, WIDTH / 2, 180, subtitleSize, "#ffffff", 850, "center");
  text(context, input.eventMeta.toUpperCase(), WIDTH / 2, 226, 19, "#a7a7ac", 750, "center");

  panel(context, PAD, 266, WIDTH - PAD * 2, 118, "rgba(255,196,61,.7)", "rgba(255,196,61,.07)");
  text(context, input.championLabel, PAD + 24, 286, 18, "#d9a83e", 950);
  const championSize = fitText(context, input.champions.toUpperCase(), 700, 38, 26);
  text(context, input.champions.toUpperCase(), PAD + 24, 322, championSize, "#ffffff", 950);
  text(context, `${input.winningPoints} PTS`, WIDTH - PAD - 24, 302, 46, "#ffd447", 950, "right");

  const statWidth = (WIDTH - PAD * 2 - 30) / 4;
  const stats = [
    ["PLAYERS", String(input.players)],
    ["GROUP ACCURACY", `${input.groupAccuracy}%`],
    ["TOTAL PICKS", String(input.totalPicks)],
    ["GROUP RECORD", input.groupRecord],
  ] as const;
  stats.forEach(([label, value], index) => drawStat(context, PAD + index * (statWidth + 10), 406, statWidth, label, value));

  const storyWidth = (WIDTH - PAD * 2 - 12) / 2;
  input.stories.slice(0, 4).forEach((story, index) => {
    drawStory(context, story, PAD + (index % 2) * (storyWidth + 12), 540 + Math.floor(index / 2) * 168, storyWidth);
  });

  panel(context, PAD, 888, WIDTH - PAD * 2, 360);
  text(context, "FINAL STANDINGS", WIDTH / 2, 908, 26, "#d9a83e", 950, "center");
  text(context, "RANK", PAD + 24, 952, 16, "#85858b", 900);
  text(context, "PLAYER", PAD + 142, 952, 16, "#85858b", 900);
  text(context, "POINTS", WIDTH - PAD - 24, 952, 16, "#85858b", 900, "right");

  const visible = input.standings.slice(0, 8);
  visible.forEach((standing, index) => {
    const rowY = 986 + index * 31;
    if (index === 0) {
      context.fillStyle = "rgba(255,196,61,.1)";
      context.fillRect(PAD + 2, rowY - 3, WIDTH - PAD * 2 - 4, 30);
    }
    text(context, String(standing.rank), PAD + 32, rowY, 20, index === 0 ? "#ffd447" : "#ffffff", 900);
    text(context, standing.displayName.toUpperCase(), PAD + 142, rowY, 20, index === 0 ? "#ffd447" : "#ffffff", 850);
    text(context, `${standing.totalPoints} PTS`, WIDTH - PAD - 24, rowY, 20, index === 0 ? "#ffd447" : "#ffffff", 900, "right");
  });
  if (input.standings.length > visible.length) {
    text(context, `+${input.standings.length - visible.length} MORE IN OCTAGON HQ`, PAD + 142, 1230, 16, "#9f9fa5", 800);
  }

  const firstMoment = input.watchMoments[0];
  if (firstMoment) {
    panel(context, PAD, 1270, WIDTH - PAD * 2, 150, "rgba(239,39,39,.7)", "rgba(239,39,39,.06)");
    context.beginPath();
    context.arc(PAD + 66, 1345, 38, 0, Math.PI * 2);
    context.strokeStyle = "#ffffff";
    context.lineWidth = 4;
    context.stroke();
    context.beginPath();
    context.moveTo(PAD + 56, 1324);
    context.lineTo(PAD + 56, 1366);
    context.lineTo(PAD + 84, 1345);
    context.closePath();
    context.fillStyle = "#ffffff";
    context.fill();
    text(context, input.watchMoments.length > 1 ? "MUST-WATCH MOMENTS" : "MUST-WATCH MOMENT", PAD + 130, 1294, 18, "#ef2727", 950);
    context.font = "900 28px system-ui, -apple-system, sans-serif";
    wrapLines(context, firstMoment.title.toUpperCase(), WIDTH - PAD * 2 - 170, 2)
      .forEach((line, index) => text(context, line, PAD + 130, 1330 + index * 34, 28, "#ffffff", 900));
  }

  panel(context, PAD, 1440, WIDTH - PAD * 2, 112, "rgba(255,255,255,.2)", "#0d0d0d");
  text(context, "VIEW YOUR EVENT RECAP", PAD + 24, 1462, 25, "#ffffff", 950);
  text(context, "Log in to Octagon HQ for your picks, points and full event recap.", PAD + 24, 1500, 18, "#a7a7ac", 700);
  text(context, "OCTAGON HQ · THE HOME OF UFC PICKS", WIDTH - PAD - 24, 1500, 16, "#ef2727", 900, "right");

  const blob = await canvasBlob(canvas);
  return new File([blob], `${fileSlug(input.eventName)}-recap.png`, { type: "image/png" });
}
