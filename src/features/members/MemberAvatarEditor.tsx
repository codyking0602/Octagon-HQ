import { useEffect, useRef, useState, type ChangeEvent } from "react";

const OUTPUT_SIZE = 320;
const MAX_INPUT_BYTES = 12 * 1024 * 1024;
const MAX_SAVED_CHARACTERS = 240_000;

interface CropState {
  objectUrl: string;
  image: HTMLImageElement;
  zoom: number;
  x: number;
  y: number;
}

function cropGeometry(crop: CropState, outputSize = OUTPUT_SIZE) {
  const naturalWidth = crop.image.naturalWidth;
  const naturalHeight = crop.image.naturalHeight;
  if (!naturalWidth || !naturalHeight) return null;

  const baseScale = Math.max(outputSize / naturalWidth, outputSize / naturalHeight);
  const scale = baseScale * crop.zoom;
  const width = naturalWidth * scale;
  const height = naturalHeight * scale;
  return {
    width,
    height,
    left: -(width - outputSize) * (crop.x / 100),
    top: -(height - outputSize) * (crop.y / 100),
  };
}

function exportAvatar(crop: CropState) {
  const geometry = cropGeometry(crop);
  if (!geometry) throw new Error("That photo could not be cropped.");

  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("Photo editing is not available on this device.");

  context.fillStyle = "#0b0b0d";
  context.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  context.drawImage(
    crop.image,
    geometry.left,
    geometry.top,
    geometry.width,
    geometry.height,
  );

  for (const quality of [0.82, 0.72, 0.62, 0.52, 0.42]) {
    const webp = canvas.toDataURL("image/webp", quality);
    if (webp.startsWith("data:image/webp") && webp.length <= MAX_SAVED_CHARACTERS) return webp;
    const jpeg = canvas.toDataURL("image/jpeg", quality);
    if (jpeg.length <= MAX_SAVED_CHARACTERS) return jpeg;
  }

  throw new Error("That crop is still too large. Choose a simpler or smaller photo.");
}

export function MemberAvatarEditor({
  photoData,
  initials,
  disabled,
  saving,
  onSave,
}: {
  photoData: string | null;
  initials: string;
  disabled: boolean;
  saving: boolean;
  onSave: (photoData: string | null) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [crop, setCrop] = useState<CropState | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => () => {
    if (crop?.objectUrl) URL.revokeObjectURL(crop.objectUrl);
  }, [crop?.objectUrl]);

  function closeCrop() {
    setCrop(null);
  }

  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus("Choose a JPG, PNG, or WebP photo.");
      return;
    }
    if (file.size > MAX_INPUT_BYTES) {
      setStatus("Choose a photo smaller than 12 MB.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      setStatus("");
      setCrop({ objectUrl, image, zoom: 1, x: 50, y: 50 });
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setStatus("That photo could not be opened.");
    };
    image.src = objectUrl;
  }

  async function saveCrop() {
    if (!crop) return;
    try {
      const photo = exportAvatar(crop);
      setStatus("Saving profile photo…");
      await onSave(photo);
      setStatus("Profile photo saved across Octagon HQ.");
      closeCrop();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "That photo could not be saved.");
    }
  }

  async function removePhoto() {
    try {
      setStatus("Removing profile photo…");
      await onSave(null);
      setStatus("Profile photo removed. Your initials will be used.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "That photo could not be removed.");
    }
  }

  const geometry = crop ? cropGeometry(crop) : null;
  const previewRatio = 220 / OUTPUT_SIZE;

  return (
    <section className="member-avatar-editor" aria-labelledby="member-avatar-title">
      <div className="member-avatar-editor__preview">
        {photoData ? <img src={photoData} alt="Your current Octagon HQ avatar" /> : <span>{initials}</span>}
      </div>
      <div className="member-avatar-editor__copy">
        <span className="eyebrow">YOUR AVATAR</span>
        <h2 id="member-avatar-title">Use any photo you want</h2>
        <p>Your personal avatar is separate from your favorite fighter and appears across member profiles.</p>
        <div className="member-avatar-editor__actions">
          <button type="button" onClick={() => inputRef.current?.click()} disabled={disabled || saving}>
            {photoData ? "CHANGE PHOTO" : "UPLOAD PHOTO"}
          </button>
          {photoData ? (
            <button type="button" className="is-secondary" onClick={() => void removePhoto()} disabled={disabled || saving}>
              REMOVE
            </button>
          ) : null}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={choosePhoto}
        />
        {status ? <small role="status">{status}</small> : null}
      </div>

      {crop && geometry ? (
        <div className="member-avatar-crop-overlay" role="dialog" aria-modal="true" aria-labelledby="member-crop-title">
          <section className="member-avatar-crop-panel">
            <div>
              <p className="eyebrow">PROFILE PHOTO</p>
              <h2 id="member-crop-title">Fit your avatar</h2>
              <p>The circle shows exactly how the photo will appear across Octagon HQ.</p>
            </div>
            <div className="member-avatar-crop-viewport">
              <img
                src={crop.objectUrl}
                alt="Profile crop preview"
                style={{
                  width: geometry.width * previewRatio,
                  height: geometry.height * previewRatio,
                  left: geometry.left * previewRatio,
                  top: geometry.top * previewRatio,
                }}
              />
            </div>
            <div className="member-avatar-crop-controls">
              <label>
                <span>ZOOM</span>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.01"
                  value={crop.zoom}
                  onChange={(event) => setCrop({ ...crop, zoom: Number(event.target.value) })}
                />
              </label>
              <label>
                <span>LEFT / RIGHT</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={crop.x}
                  onChange={(event) => setCrop({ ...crop, x: Number(event.target.value) })}
                />
              </label>
              <label>
                <span>UP / DOWN</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={crop.y}
                  onChange={(event) => setCrop({ ...crop, y: Number(event.target.value) })}
                />
              </label>
            </div>
            <div className="member-avatar-crop-actions">
              <button type="button" onClick={closeCrop} disabled={saving}>CANCEL</button>
              <button type="button" className="primary-action" onClick={() => void saveCrop()} disabled={saving}>
                {saving ? "SAVING…" : "USE PHOTO"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
