import { getSupabaseClient } from "../../lib/supabase";
import { PICK_EVENT_HEADER_BUCKET, PICK_EVENT_HEADER_MAX_IMAGES } from "../picks/picksEventAssets";
import type { PickControlRepository } from "./pickControlRepository";

const EVENT_HEADER_MAX_BYTES = 20 * 1024 * 1024;
const MIN_OPTIMIZE_BYTES = 600_000;
const MAX_OPTIMIZED_DIMENSION = 1920;
const EVENT_HEADER_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export interface PickEventHeaderDimensions {
  width: number;
  height: number;
}

interface UploadPickEventHeaderOptions {
  eventId: string;
  file: File;
  files?: File[];
  repository: PickControlRepository;
  measureImage?: (file: File) => Promise<PickEventHeaderDimensions>;
  optimizeImage?: (file: File) => Promise<OptimizedEventHeader | null>;
}

export interface OptimizedEventHeader extends PickEventHeaderDimensions {
  blob: Blob;
}

// Uploaded event art can be several megabytes. Keep the exact aspect ratio,
// preserving approved composition, but serve a right-sized WebP whenever it
// is actually smaller. Fall back to the original on unsupported devices.
export async function optimizePickEventHeader(file: File): Promise<OptimizedEventHeader | null> {
  if (file.size <= MIN_OPTIMIZE_BYTES) return null;
  let objectUrl: string | null = null;
  try {
    objectUrl = URL.createObjectURL(file);
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const next = new Image();
      next.onload = () => resolve(next);
      next.onerror = () => reject(new Error("Event artwork cannot be decoded."));
      next.src = objectUrl!;
    });
    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;
    if (!naturalWidth || !naturalHeight) return null;
    const scale = Math.min(1, MAX_OPTIMIZED_DIMENSION / Math.max(naturalWidth, naturalHeight));
    const width = Math.max(1, Math.round(naturalWidth * scale));
    const height = Math.max(1, Math.round(naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.drawImage(image, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
    if (!blob || blob.type !== "image/webp" || blob.size >= file.size) return null;
    return { blob, width, height };
  } catch {
    return null;
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}

export async function measurePickEventHeader(file: File): Promise<PickEventHeaderDimensions> {
  const objectUrl = URL.createObjectURL(file);
  try {
    return await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        if (image.naturalWidth < 1 || image.naturalHeight < 1) {
          reject(new Error("Event header image dimensions are invalid."));
          return;
        }
        resolve({ width: image.naturalWidth, height: image.naturalHeight });
      };
      image.onerror = () => reject(new Error("Event header image could not be read."));
      image.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function validateHeaderFile(file: File) {
  if (!EVENT_HEADER_TYPES.has(file.type)) {
    throw new Error("Event header must be a JPEG, PNG, WebP, or AVIF image.");
  }
  if (file.size > EVENT_HEADER_MAX_BYTES) {
    throw new Error("Event header must be 20 MB or smaller.");
  }
}

function headerStoragePaths(eventId: string, count: number) {
  if (count === 1) return [`${eventId}/event-header`];
  return Array.from({ length: count }, (_, index) => `${eventId}/event-header-gallery-${count}-${index + 1}`);
}

export async function uploadPickEventHeader({
  eventId,
  file,
  files,
  repository,
  measureImage = measurePickEventHeader,
  optimizeImage = optimizePickEventHeader,
}: UploadPickEventHeaderOptions) {
  const headerFiles = files?.length ? files : [file];
  if (headerFiles.length > PICK_EVENT_HEADER_MAX_IMAGES) {
    throw new Error(`Event header supports up to ${PICK_EVENT_HEADER_MAX_IMAGES} images.`);
  }
  headerFiles.forEach(validateHeaderFile);

  if (!repository.setEventHeader) {
    throw new Error("Event header persistence is not available on this build.");
  }

  const client = getSupabaseClient();
  if (!client) {
    throw new Error("Event header storage is not connected on this build.");
  }

  const { width, height } = await measureImage(headerFiles[0]);
  if (width < 1 || height < 1 || width > 30000 || height > 30000) {
    throw new Error("Event header image dimensions are invalid.");
  }

  const storagePaths = headerStoragePaths(eventId, headerFiles.length);
  const bucket = client.storage.from(PICK_EVENT_HEADER_BUCKET);
  let savedWidth = width;
  let savedHeight = height;

  for (let index = 0; index < headerFiles.length; index += 1) {
    const currentFile = headerFiles[index];
    const optimized = await optimizeImage(currentFile);
    if (index === 0 && optimized) {
      savedWidth = optimized.width;
      savedHeight = optimized.height;
    }
    const payload = optimized?.blob ?? currentFile;
    const { error } = await bucket.upload(storagePaths[index], payload, {
      cacheControl: "0",
      contentType: payload.type,
      upsert: true,
    });
    if (error) throw new Error(error.message);
  }

  const storagePath = storagePaths[0];
  await repository.setEventHeader(eventId, storagePath, savedWidth, savedHeight);
  return { storagePath, width: savedWidth, height: savedHeight };
}
