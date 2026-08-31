import { getSupabaseClient } from "../../lib/supabase";
import { PICK_EVENT_HEADER_BUCKET, PICK_EVENT_HEADER_MAX_IMAGES } from "../picks/picksEventAssets";
import type { PickControlRepository } from "./pickControlRepository";

const EVENT_HEADER_MAX_BYTES = 20 * 1024 * 1024;
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

  for (let index = 0; index < headerFiles.length; index += 1) {
    const currentFile = headerFiles[index];
    const { error } = await bucket.upload(storagePaths[index], currentFile, {
      cacheControl: "0",
      contentType: currentFile.type,
      upsert: true,
    });
    if (error) throw new Error(error.message);
  }

  const storagePath = storagePaths[0];
  await repository.setEventHeader(eventId, storagePath, width, height);
  return { storagePath, width, height };
}
