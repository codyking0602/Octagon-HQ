import { getSupabaseClient } from "../../lib/supabase";
import { PICK_EVENT_HEADER_BUCKET } from "../picks/picksEventAssets";
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

export async function uploadPickEventHeader({
  eventId,
  file,
  repository,
  measureImage = measurePickEventHeader,
}: UploadPickEventHeaderOptions) {
  if (!EVENT_HEADER_TYPES.has(file.type)) {
    throw new Error("Event header must be a JPEG, PNG, WebP, or AVIF image.");
  }
  if (file.size > EVENT_HEADER_MAX_BYTES) {
    throw new Error("Event header must be 20 MB or smaller.");
  }
  if (!repository.setEventHeader) {
    throw new Error("Event header persistence is not available on this build.");
  }

  const client = getSupabaseClient();
  if (!client) {
    throw new Error("Event header storage is not connected on this build.");
  }

  const { width, height } = await measureImage(file);
  if (width < 1 || height < 1 || width > 30000 || height > 30000) {
    throw new Error("Event header image dimensions are invalid.");
  }

  const storagePath = `${eventId}/event-header`;
  const { error } = await client.storage
    .from(PICK_EVENT_HEADER_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "0",
      contentType: file.type,
      upsert: true,
    });

  if (error) throw new Error(error.message);

  await repository.setEventHeader(eventId, storagePath, width, height);
  return { storagePath, width, height };
}
