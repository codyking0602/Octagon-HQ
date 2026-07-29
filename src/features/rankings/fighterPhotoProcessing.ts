export interface MutablePixelImage {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

function isDarkEdgeBackground(data: Uint8ClampedArray, pixelIndex: number) {
  const offset = pixelIndex * 4;
  const red = data[offset];
  const green = data[offset + 1];
  const blue = data[offset + 2];
  const alpha = data[offset + 3];

  if (alpha <= 16) return true;

  const maximum = Math.max(red, green, blue);
  const nearBlack = maximum <= 34;
  const luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722;
  const darkNavy =
    luminance <= 74 &&
    maximum <= 112 &&
    blue >= red + 4 &&
    blue >= green + 2;

  return nearBlack || darkNavy;
}

export function blackCompositeEdgeBackground(image: MutablePixelImage) {
  const { data, width, height } = image;
  if (width <= 0 || height <= 0 || data.length !== width * height * 4) return image;

  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;

  function enqueue(pixelIndex: number) {
    if (pixelIndex < 0 || pixelIndex >= visited.length || visited[pixelIndex]) return;
    visited[pixelIndex] = 1;
    if (!isDarkEdgeBackground(data, pixelIndex)) return;
    queue[tail] = pixelIndex;
    tail += 1;
  }

  for (let x = 0; x < width; x += 1) {
    enqueue(x);
    enqueue((height - 1) * width + x);
  }
  for (let y = 1; y < height - 1; y += 1) {
    enqueue(y * width);
    enqueue(y * width + width - 1);
  }

  while (head < tail) {
    const pixelIndex = queue[head];
    head += 1;
    const offset = pixelIndex * 4;
    data[offset] = 0;
    data[offset + 1] = 0;
    data[offset + 2] = 0;
    data[offset + 3] = 255;

    const x = pixelIndex % width;
    const y = Math.floor(pixelIndex / width);
    for (let yOffset = -1; yOffset <= 1; yOffset += 1) {
      for (let xOffset = -1; xOffset <= 1; xOffset += 1) {
        if (xOffset === 0 && yOffset === 0) continue;
        const nextX = x + xOffset;
        const nextY = y + yOffset;
        if (nextX < 0 || nextX >= width || nextY < 0 || nextY >= height) continue;
        enqueue(nextY * width + nextX);
      }
    }
  }

  return image;
}
