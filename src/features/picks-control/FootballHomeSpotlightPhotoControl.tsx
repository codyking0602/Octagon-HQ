import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { getSupabaseClient } from "../../lib/supabase";
import {
  FOOTBALL_BASE_SPOTLIGHT_PAIR_ID,
  FOOTBALL_DEFAULT_SPOTLIGHT_PHOTO_SOURCES,
  FOOTBALL_PLAYER_SPOTLIGHT_PAIRS,
  footballSpotlightNextPair,
  footballSpotlightPairAt,
  type FootballPlayerSpotlightPair,
  type FootballSpotlightKind,
} from "../home/footballPlayerSpotlightSchedule";
import {
  HOME_FEATURE_MEDIA_BUCKET,
  createHomeFeatureMediaRepository,
  footballHomeSpotlightStoragePath,
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

export async function uploadFootballHomeSpotlightPhoto(
  file: File,
  pairId: string = FOOTBALL_BASE_SPOTLIGHT_PAIR_ID,
  kind: FootballSpotlightKind = "cfb",
) {
  const client = getSupabaseClient();
  if (!client) throw new Error("Home Spotlight media storage is not connected on this build.");

  const prepared = await prepareFootballHomeSpotlightPhoto(file);
  const bucket = client.storage.from(HOME_FEATURE_MEDIA_BUCKET);
  const storagePath = footballHomeSpotlightStoragePath(pairId, kind);
  const { error } = await bucket.upload(storagePath, prepared, {
    cacheControl: "0",
    contentType: prepared.type || "image/webp",
    upsert: true,
  });
  if (error) throw new Error(error.message);

  const publicUrl = bucket.getPublicUrl(storagePath).data.publicUrl;
  if (!publicUrl) throw new Error("Home Spotlight photo URL could not be resolved.");

  return `${publicUrl}?v=${Date.now()}`;
}

function activationLabel(pair: FootballPlayerSpotlightPair) {
  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(pair.activatesAt));
  return `Activates ${formatted}.`;
}

function SpotlightPhotoSlot({
  role,
  pair,
  kind,
  photoSource,
  repository,
  uploadPhoto,
  onSaved,
}: {
  role: "CURRENT" | "NEXT";
  pair: FootballPlayerSpotlightPair;
  kind: FootballSpotlightKind;
  photoSource: string;
  repository: HomeFeatureMediaRepository | null;
  uploadPhoto: (file: File, pairId: string, kind: FootballSpotlightKind) => Promise<string>;
  onSaved: (pairId: string, kind: FootballSpotlightKind, photoSource: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const sportLabel = kind.toUpperCase();
  const spotlight = pair.spotlights[kind];

  async function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !repository || busy) return;

    setBusy(true);
    setStatus(`Preparing ${role.toLowerCase()} ${sportLabel} Home Spotlight photo…`);
    try {
      const uploadedPhotoSource = await uploadPhoto(file, pair.id, kind);
      const saved = await repository.saveFootballSpotlightPhoto(pair.id, kind, uploadedPhotoSource);
      onSaved(pair.id, kind, saved.photoSource);
      setStatus(`${role} ${sportLabel} Football Home Spotlight photo updated.`);
    } catch (error) {
      setStatus(readableError(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="surface-card picks-event-header-control">
      <div className="picks-event-header-control__copy">
        <span>{role} · {sportLabel} HOME CONTENT</span>
        <strong>{spotlight.name.toUpperCase()}</strong>
        <small>{spotlight.team} · {spotlight.position}{role === "NEXT" ? ` · ${activationLabel(pair)}` : ""}</small>
      </div>

      {photoSource ? (
        <div className="picks-event-header-control__preview">
          <img src={photoSource} alt={`${role} ${sportLabel} Football Home Player Spotlight`} />
        </div>
      ) : (
        <p className="picks-control-feedback" role="status">
          {role === "NEXT" ? "Photo not preloaded yet." : "Current photo is not available."}
        </p>
      )}

      <div className="picks-event-header-control__actions">
        <button
          className="secondary-action"
          type="button"
          disabled={busy || !repository}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? "SAVING…" : `UPLOAD / REPLACE ${role} ${sportLabel} PHOTO`}
        </button>
        <input
          ref={inputRef}
          className="picks-event-header-control__input"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={choosePhoto}
          disabled={busy || !repository}
          aria-label={`Upload ${role} ${sportLabel} Player Spotlight photo`}
        />
      </div>

      {status ? <p className="picks-control-feedback" role="status">{status}</p> : null}
    </div>
  );
}

function emptyPhotoSources() {
  return Object.fromEntries(
    FOOTBALL_PLAYER_SPOTLIGHT_PAIRS.map((pair) => [pair.id, {
      cfb: FOOTBALL_DEFAULT_SPOTLIGHT_PHOTO_SOURCES[pair.id]?.cfb ?? "",
      nfl: FOOTBALL_DEFAULT_SPOTLIGHT_PHOTO_SOURCES[pair.id]?.nfl ?? "",
    }]),
  ) as Record<string, Record<FootballSpotlightKind, string>>;
}

export default function FootballHomeSpotlightPhotoControl({
  repository: suppliedRepository,
  uploadPhoto = uploadFootballHomeSpotlightPhoto,
}: {
  repository?: HomeFeatureMediaRepository | null;
  uploadPhoto?: (file: File, pairId: string, kind: FootballSpotlightKind) => Promise<string>;
}) {
  const [repository] = useState<HomeFeatureMediaRepository | null>(() => (
    suppliedRepository === undefined ? createHomeFeatureMediaRepository() : suppliedRepository
  ));
  const [now, setNow] = useState(() => new Date());
  const [photoSources, setPhotoSources] = useState(emptyPhotoSources);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!repository) return undefined;
    let active = true;
    const requests = FOOTBALL_PLAYER_SPOTLIGHT_PAIRS.flatMap((pair) => ([
      repository.loadFootballSpotlight(pair.id, "cfb").then((media) => [pair.id, "cfb", media?.photoSource ?? ""] as const),
      repository.loadFootballSpotlight(pair.id, "nfl").then((media) => [pair.id, "nfl", media?.photoSource ?? ""] as const),
    ]));
    void Promise.all(requests).then((entries) => {
      if (!active) return;
      const next = emptyPhotoSources();
      for (const [pairId, kind, source] of entries) {
        if (source) next[pairId]![kind] = source;
      }
      setPhotoSources(next);
    }).catch((error) => {
      if (active) {
        const message = readableError(error);
        setPhotoSources((current) => ({ ...current, __error: { cfb: message, nfl: message } }));
      }
    });
    return () => {
      active = false;
    };
  }, [repository]);

  const currentPair = footballSpotlightPairAt(now, photoSources);
  const nextPair = footballSpotlightNextPair(now, photoSources);
  const visiblePairs = [
    { role: "CURRENT" as const, pair: currentPair },
    ...(nextPair ? [{ role: "NEXT" as const, pair: nextPair }] : []),
  ];

  function updatePhoto(pairId: string, kind: FootballSpotlightKind, photoSource: string) {
    setPhotoSources((current) => ({
      ...current,
      [pairId]: {
        ...current[pairId],
        [kind]: photoSource,
      },
    }));
  }

  return (
    <>
      {visiblePairs.flatMap(({ role, pair }) => (["cfb", "nfl"] as const).map((kind) => (
        <SpotlightPhotoSlot
          key={`${pair.id}-${kind}`}
          role={role}
          pair={pair}
          kind={kind}
          photoSource={photoSources[pair.id]?.[kind] ?? ""}
          repository={repository}
          uploadPhoto={uploadPhoto}
          onSaved={updatePhoto}
        />
      )))}
    </>
  );
}
