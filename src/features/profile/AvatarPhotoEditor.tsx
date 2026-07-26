import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { encodeAvatarPhoto, validateAvatarFile, type AvatarCrop } from "./avatarImage";

const DEFAULT_CROP: AvatarCrop = { zoom: 1, x: 50, y: 50 };

export function AvatarPhotoEditor({
  currentPhoto,
  initials,
  disabled,
  onSave,
}: {
  currentPhoto: string | null;
  initials: string;
  disabled?: boolean;
  onSave: (photoData: string | null) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [crop, setCrop] = useState<AvatarCrop>(DEFAULT_CROP);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return undefined;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!nextFile) return;
    const error = validateAvatarFile(nextFile);
    if (error) {
      setStatus(error);
      return;
    }
    setFile(nextFile);
    setCrop(DEFAULT_CROP);
    setStatus("Position the photo, then save it to your profile.");
  }

  async function savePhoto() {
    if (!file || busy) return;
    setBusy(true);
    setStatus("Preparing your profile photo…");
    try {
      const photoData = await encodeAvatarPhoto(file, crop);
      await onSave(photoData);
      setFile(null);
      setStatus("Profile photo saved across Octagon HQ.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "That photo could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  async function removePhoto() {
    if (busy) return;
    setBusy(true);
    setStatus("Removing your profile photo…");
    try {
      await onSave(null);
      setFile(null);
      setStatus("Profile photo removed. Your initials will be used instead.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "That photo could not be removed.");
    } finally {
      setBusy(false);
    }
  }

  const previewSource = previewUrl || currentPhoto;

  return (
    <section className="member-avatar-editor" aria-labelledby="member-avatar-editor-title">
      <div className="member-avatar-editor__preview" aria-label="Profile photo preview">
        {previewSource ? (
          <img
            alt="Profile preview"
            src={previewSource}
            style={previewUrl ? {
              objectPosition: `${crop.x}% ${crop.y}%`,
              transform: `scale(${crop.zoom})`,
            } : undefined}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      <div className="member-avatar-editor__body">
        <div>
          <p className="eyebrow">YOUR AVATAR</p>
          <h3 id="member-avatar-editor-title">Use any photo you want</h3>
          <p>Choose a photo from your phone. It stays separate from your favorite fighter.</p>
        </div>

        <div className="member-avatar-editor__actions">
          <button
            className="secondary-action"
            type="button"
            disabled={disabled || busy}
            onClick={() => inputRef.current?.click()}
          >
            {currentPhoto ? "REPLACE PHOTO" : "UPLOAD PHOTO"}
          </button>
          {currentPhoto ? (
            <button type="button" disabled={disabled || busy} onClick={() => void removePhoto()}>
              REMOVE
            </button>
          ) : null}
        </div>

        <input
          ref={inputRef}
          type="file"
          hidden
          accept="image/jpeg,image/png,image/webp"
          onChange={chooseFile}
        />

        {file ? (
          <div className="member-avatar-crop" aria-label="Profile photo crop controls">
            <label>
              <span>ZOOM</span>
              <input
                type="range"
                min="1"
                max="3"
                step="0.01"
                value={crop.zoom}
                onChange={(event) => setCrop((current) => ({
                  ...current,
                  zoom: Number(event.target.value),
                }))}
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
                onChange={(event) => setCrop((current) => ({
                  ...current,
                  x: Number(event.target.value),
                }))}
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
                onChange={(event) => setCrop((current) => ({
                  ...current,
                  y: Number(event.target.value),
                }))}
              />
            </label>
            <div className="member-avatar-crop__actions">
              <button type="button" disabled={busy} onClick={() => setFile(null)}>CANCEL</button>
              <button className="primary-action" type="button" disabled={busy} onClick={() => void savePhoto()}>
                {busy ? "SAVING…" : "USE THIS PHOTO"}
              </button>
            </div>
          </div>
        ) : null}

        <p className="member-avatar-editor__status" role="status">{status}</p>
      </div>
    </section>
  );
}
