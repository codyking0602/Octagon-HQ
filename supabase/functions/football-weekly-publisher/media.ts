// Small dependency-free WebP proof used by the private Football weekly publisher.
// Rejects unrelated files, empty placeholders and files with the wrong template dimensions.
export function footballWebpDimensions(data: Uint8Array): { width: number; height: number } {
  const tag = (offset: number, value: string) =>
    [...value].every((letter, index) => data[offset + index] === letter.charCodeAt(0));
  if (data.length < 30 || !tag(0, "RIFF") || !tag(8, "WEBP")) {
    throw new Error("Football asset is not a valid WebP");
  }
  const chunk = String.fromCharCode(...data.slice(12, 16));
  const u16 = (offset: number) => data[offset]! | (data[offset + 1]! << 8);
  let width = 0;
  let height = 0;
  if (chunk === "VP8 ") {
    if (data.length < 30 || data[23] !== 0x9d || data[24] !== 0x01 || data[25] !== 0x2a) {
      throw new Error("Invalid WebP VP8 frame");
    }
    width = u16(26) & 0x3fff;
    height = u16(28) & 0x3fff;
  } else if (chunk === "VP8L") {
    if (data[20] !== 0x2f) throw new Error("Invalid WebP VP8L signature");
    width = 1 + (data[21]! | ((data[22]! & 0x3f) << 8));
    height = 1 + ((data[22]! >> 6) | (data[23]! << 2) | ((data[24]! & 0x0f) << 10));
  } else if (chunk === "VP8X") {
    width = 1 + data[24]! + (data[25]! << 8) + (data[26]! << 16);
    height = 1 + data[27]! + (data[28]! << 8) + (data[29]! << 16);
  } else {
    throw new Error("Unsupported WebP compression signature");
  }
  if (!width || !height || width > 6000 || height > 6000) {
    throw new Error("Invalid WebP frame size");
  }
  return { width, height };
}
