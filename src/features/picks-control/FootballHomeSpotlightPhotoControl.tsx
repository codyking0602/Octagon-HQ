import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  createHomeFeatureMediaRepository,
  type HomeFeatureMediaRepository,
} from "../home/homeFeatureMedia";

const MAX_INPUT_BYTES = 30 * 1024 * 1024;
const MAX_PREPARED_BYTES = 4 * 1024 * 1024;
const ACCEPTED_TYPES = /^image\/(jpeg|png|webp|heic|heif)$/i;
const ACCEPTED_EXTENSIONS = /\.(jpe?g|png|webp|heic|heif)$/i;

function readableError(error: unknown) {
  return error instanceof Error ? error.message : "The Home Spotlight photo could not be saved.";
}

async function loadImage(file: File) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const next = new Image();
      next.onload = () => resolve(next);
      next.onerror = () => reject(new Error("That photo could not be opened on this device."));
      next.src = objectUrl;
    });
    return image;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function renderPhoto(
  image: HTMLImageElement,
  width: number,
  height: number,
  quality: number,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("Photo editing is not available on this device.");

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

  context.fillStyle = "#0b0b0d";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, sx, sy, sw, sh, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("That photo could not be prepared on this device."));
        return;
      }
      resolve(blob);
    }, "image/jpeg", quality);
  });
}

export async function prepareFootballHomeSpotlightPhoto(file: File) {
  if (!ACCEPTED_TYPES.test(file.type) && !ACCEPTED_EXTENSIONS.test(file.name)) {
    throw new Error("Choose a JPG, PNG, WebP, HEIC, or HEIF photo.");
  }
  if (file.size > MAX_INPUT_BYTES) throw new Error("Choose a photo smaller than 30 MB.");

  const image = await loadImage(file);
  if (!image.naturalWidth || !image.naturalHeight) throw new Error("That photo has invalid dimensions.");

  for (const [width, height] of [[900, 1125], [720, 900], [600, 750], [480, 600]] as const) {
    for (const quality of [0.88, 0.8, 0.72, 0.64]) {
      const photo = await renderPhoto(image, width, height, quality);
      if (photo.size <= MAX_PREPARED_BYTES) return photo;
    }
  }

  throw new Error("That photo could not be compressed enough to upload.");
}

export default function FootballHomeSpotlightPhotoControl({
  repository: suppliedRepository,
}: {
  repository?: HomeFeatureMediaRepository | null;
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
      const prepared = await prepareFootballHomeSpotlightPhoto(file);
      const saved = await repository.saveFootballSpotlightPhoto(prepared);
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
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          onChange={choosePhoto}
          disabled={busy || !repository}
        />
      </div>

      {status ? <p className="picks-control-feedback" role="status">{status}</p> : null}
    </div>
  );
}
