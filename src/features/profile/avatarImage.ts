export interface AvatarCrop {
  zoom: number;
  x: number;
  y: number;
}

export interface AvatarGeometry {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
}

const MAX_FILE_BYTES = 12 * 1024 * 1024;
const MAX_DATA_URL_LENGTH = 240_000;
const OUTPUT_SIZES = [320, 280, 240];
const QUALITY_STEPS = [0.84, 0.76, 0.68, 0.6, 0.52];

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function validateAvatarFile(file: File) {
  if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) {
    return "Choose a JPG, PNG, or WebP photo.";
  }
  if (file.size > MAX_FILE_BYTES) {
    return "Choose a photo smaller than 12 MB.";
  }
  return "";
}

export function avatarGeometry(
  sourceWidth: number,
  sourceHeight: number,
  crop: AvatarCrop,
  outputSize: number,
): AvatarGeometry {
  const safeWidth = Math.max(1, sourceWidth);
  const safeHeight = Math.max(1, sourceHeight);
  const zoom = clamp(crop.zoom, 1, 3);
  const positionX = clamp(crop.x, 0, 100) / 100;
  const positionY = clamp(crop.y, 0, 100) / 100;
  const scale = Math.max(outputSize / safeWidth, outputSize / safeHeight) * zoom;
  const width = safeWidth * scale;
  const height = safeHeight * scale;
  return {
    width,
    height,
    offsetX: Math.max(0, width - outputSize) * positionX,
    offsetY: Math.max(0, height - outputSize) * positionY,
  };
}

function loadImage(file: File) {
  return new Promise<{ image: HTMLImageElement; objectUrl: string }>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => resolve({ image, objectUrl });
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("That image could not be opened."));
    };
    image.src = objectUrl;
  });
}

function canvasDataUrl(canvas: HTMLCanvasElement, quality: number) {
  const webp = canvas.toDataURL("image/webp", quality);
  if (webp.startsWith("data:image/webp")) return webp;
  return canvas.toDataURL("image/jpeg", quality);
}

export async function encodeAvatarPhoto(file: File, crop: AvatarCrop) {
  const validationError = validateAvatarFile(file);
  if (validationError) throw new Error(validationError);

  const { image, objectUrl } = await loadImage(file);
  try {
    for (const outputSize of OUTPUT_SIZES) {
      const canvas = document.createElement("canvas");
      canvas.width = outputSize;
      canvas.height = outputSize;
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) throw new Error("This device could not prepare that photo.");

      const geometry = avatarGeometry(
        image.naturalWidth,
        image.naturalHeight,
        crop,
        outputSize,
      );
      context.fillStyle = "#111111";
      context.fillRect(0, 0, outputSize, outputSize);
      context.drawImage(
        image,
        -geometry.offsetX,
        -geometry.offsetY,
        geometry.width,
        geometry.height,
      );

      for (const quality of QUALITY_STEPS) {
        const dataUrl = canvasDataUrl(canvas, quality);
        if (dataUrl.length <= MAX_DATA_URL_LENGTH) return dataUrl;
      }
    }
  } finally {
    URL.revokeObjectURL(objectUrl);
  }

  throw new Error("That photo is still too large after compression. Choose a simpler image and try again.");
}
