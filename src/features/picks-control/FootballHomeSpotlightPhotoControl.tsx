import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { getSupabaseClient } from "../../lib/supabase";
import {
  FOOTBALL_HOME_SPOTLIGHT_STORAGE_PATH,
  HOME_FEATURE_MEDIA_BUCKET,
  createHomeFeatureMediaRepository,
  type HomeFeatureMediaRepository,
} from "../home/homeFeatureMedia";

const MAX_INPUT_BYTES = 20 * 1024 * 1024;
const ACCEPTED_TYPES = /^image\/(jpeg|png|webp|avif)$/i;

function readableError(error: unknown) {
  return error instanceof Error ? error.message : "The Home Spotlight photo could not be saved.";
}

async function loadImage(file: File) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const next = new Image();
      next.onload = () => resolve(next);
      next.onerror = () => reject(new Error("That photo could not be opened."));
      next.src = objectUrl;
    });
    return image;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function cropGeometry(image: HTMLImageElement, width: number, height: number) {
  const sourceRatio = image.naturalWidth / image.naturalHeight;
  const targetRatio = width / height;
  let sx = 0;
  let sy = 0;
  let sw = image.naturalWidth;
  let sh = image.naturalHeight;

  if (sourceRatio > targetRatio) {
    sw = image.naturalHeight * targetRatio;
    sx = (image.naturalWidth - sw) / 2;
  } else {
    sh = image.naturalWidth / targetRatio;
    sy = (image.naturalHeight - sh) / 2;
  }

  return { sx, sy, sw, sh };
}

function canvasBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("That photo could not be prepared."));
    }, type, quality);
  });
}

export async function prepareFootballHomeSpotlightPhoto(file: File) {
  if (!ACCEPTED_TYPES.test(file.type)) {
    throw new Error("Choose a JPG, PNG, WebP, or AVIF photo.");
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error("Choose a photo smaller than 20 MB.");
  }

  const image = await loadImage(file);
  if (!image.naturalWidth || !image.naturalHeight) {
    throw new Error("That photo has invalid dimensions.");
  }

  const width = 720;
  const height = 900;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("Photo editing is not available on this device.");

  const { sx, sy, sw, sh } = cropGeometry(image, width, height);
  context.fillStyle = "#0b0b0d";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, sx, sy, sw, sh, 0, 0, width, height);

  try {
    return await canvasBlob(canvas, "image/webp", 0.84);
  } catch {
    return canvasBlob(canvas, "image/jpeg", 0.82);
  }
}

export async function uploadFootballHomeSpotlightPhoto(file: File) {
  const client = getSupabaseClient();
  if (!client) throw new Error("Home Spotlight media storage is not connected on this build.");

  const prepared = await prepareFootballHomeSpotlightPhoto(file);
  const bucket = client.storage.from(HOME_FEATURE_MEDIA_BUCKET);
  const { error } = await bucket.upload(FOOTBALL_HOME_SPOTLIGHT_STORAGE_PATH, prepared, {
    cacheControl: "0",
    contentType: prepared.type || "image/webp",
    upsert: true,
  });
  if (error) throw new Error(error.message);

  const publicUrl = bucket.getPublicUrl(FOOTBALL_HOME_SPOTLIGHT_STORAGE_PATH).data.publicUrl;
  if (!publicUrl) throw new Error("Home Spotlight photo URL could not be resolved.");

  return `${publicUrl}?v=${Date.now()}`;
}

export default function FootballHomeSpotlightPhotoControl({
  repository: suppliedRepository,
  uploadPhoto = uploadFootballHomeSpotlightPhoto,
}: {
  repository?: HomeFeatureMediaRepository | null;
  uploadPhoto?: (file: File) => Promise<string>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [repository] = useState<HomeFeatureMediaRepository | null>(() => (
    suppliedRepository === undefined ? createHomeFeatureMediaRepository() : suppliedRepository
  ));
  const [photoSource, setPhotoSource] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!repository) {
      setStatus("Home Spotlight media is not connected on this build.");
      return;
    }
    let active = true;
    void repository.loadFootballSpotlight()
      .then((media) => {
        if (active) setPhotoSource(media?.photoSource ?? "");
      })
      .catch((error) => {
        if (active) setStatus(readableError(error));
      });
    return () => {
      active = false;
    };
  }, [repository]);

  async function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !repository || busy) return;

    setBusy(true);
    setStatus("Preparing Home Spotlight photo…");
    try {
      const uploadedPhotoSource = await uploadPhoto(file);
      const saved = await repository.saveFootballSpotlightPhoto(uploadedPhotoSource);
      setPhotoSource(saved.photoSource);
      setStatus("Football Home Spotlight photo updated.");
    } catch (error) {
      setStatus(readableError(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="surface-card picks-event-header-control">
      <div className="picks-event-header-control__copy">
        <span>HOME CONTENT</span>
        <strong>PLAYER SPOTLIGHT PHOTO</strong>
        <small>Replace the Kamario Taylor photo shown in Football HQ. The saved image is server-owned and updates Home across devices.</small>
      </div>

      {photoSource ? (
        <div className="picks-event-header-control__preview">
          <img src={photoSource} alt="Current Football Home Player Spotlight" />
        </div>
      ) : null}

      <div className="picks-event-header-control__actions">
        <button
          className="secondary-action"
          type="button"
          disabled={busy || !repository}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? "SAVING…" : "UPLOAD / REPLACE PHOTO"}
        </button>
        <input
          ref={inputRef}
          className="picks-event-header-control__input"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={choosePhoto}
          disabled={busy || !repository}
        />
      </div>

      {status ? <p className="picks-control-feedback" role="status">{status}</p> : null}
    </div>
  );
}
