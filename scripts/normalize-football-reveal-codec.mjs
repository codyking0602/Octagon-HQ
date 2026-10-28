import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const AVC_CONFIG_BOX = Buffer.from("avcC", "ascii");
const MOBILE_H264_LEVEL_IDC = 31;
const BROKEN_ZEKE_LEVEL_IDC = 62;

function asBuffer(source) {
  return Buffer.isBuffer(source) ? source : Buffer.from(source);
}

export function readH264AvcLevelIdc(source) {
  const buffer = asBuffer(source);
  const boxOffset = buffer.indexOf(AVC_CONFIG_BOX);
  if (boxOffset < 0 || boxOffset + 16 > buffer.length) {
    throw new Error("MP4 is missing a readable avcC configuration box.");
  }

  const configurationVersion = buffer[boxOffset + 4];
  const profileIdc = buffer[boxOffset + 5];
  const configLevelOffset = boxOffset + 7;
  const spsLength = buffer.readUInt16BE(boxOffset + 10);
  const spsOffset = boxOffset + 12;
  const spsLevelOffset = spsOffset + 3;

  if (configurationVersion !== 1 || spsLength < 4 || spsOffset + spsLength > buffer.length) {
    throw new Error("MP4 has an invalid AVC sequence-parameter configuration.");
  }
  if ((buffer[spsOffset] & 0x1f) !== 7 || buffer[spsOffset + 1] !== profileIdc) {
    throw new Error("MP4 AVC configuration does not contain the expected SPS profile.");
  }

  return {
    configLevelIdc: buffer[configLevelOffset],
    configLevelOffset,
    spsLevelIdc: buffer[spsLevelOffset],
    spsLevelOffset,
  };
}

export function normalizeFootballRevealH264Level(source) {
  const output = Buffer.from(asBuffer(source));
  const metadata = readH264AvcLevelIdc(output);
  const alreadyMobileSafe = metadata.configLevelIdc === MOBILE_H264_LEVEL_IDC
    && metadata.spsLevelIdc === MOBILE_H264_LEVEL_IDC;
  if (alreadyMobileSafe) return output;

  const isKnownBrokenZekeEncoding = metadata.configLevelIdc === BROKEN_ZEKE_LEVEL_IDC
    && metadata.spsLevelIdc === BROKEN_ZEKE_LEVEL_IDC;
  if (!isKnownBrokenZekeEncoding) {
    throw new Error(
      `Unexpected Football reveal H.264 levels ${metadata.configLevelIdc}/${metadata.spsLevelIdc}.`,
    );
  }

  output[metadata.configLevelOffset] = MOBILE_H264_LEVEL_IDC;
  output[metadata.spsLevelOffset] = MOBILE_H264_LEVEL_IDC;
  return output;
}

export async function normalizeBuiltFootballReveal({ dist = "dist" } = {}) {
  const revealPath = join(dist, "assets", "football", "football-picks-reveal.mp4");
  const source = await readFile(revealPath);
  const normalized = normalizeFootballRevealH264Level(source);
  if (!source.equals(normalized)) await writeFile(revealPath, normalized);
  return readH264AvcLevelIdc(normalized);
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const levels = await normalizeBuiltFootballReveal();
  console.log(
    `Football Picks reveal normalized to H.264 levels ${levels.configLevelIdc}/${levels.spsLevelIdc}.`,
  );
}
