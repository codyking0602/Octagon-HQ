import { useEffect, useRef, useState, type ChangeEvent } from "react";
import type { PickControlRepository } from "./pickControlRepository";
import { uploadPickEventHeader } from "./pickEventHeaderUpload";

interface PickEventHeaderControlProps {
  eventId: string;
  repository: PickControlRepository | null;
  allowGallery?: boolean;
}

function readableError(error: unknown) {
  return error instanceof Error ? error.message : "Event header could not be uploaded.";
}

export default function PickEventHeaderControl({ eventId, repository, allowGallery }: PickEventHeaderControlProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const galleryEnabled = allowGallery ?? new URLSearchParams(window.location.search).get("sport") === "football";

  useEffect(() => () => {
    previewUrls.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
  }, [previewUrls]);

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    const files = galleryEnabled ? selectedFiles.slice(0, 4) : selectedFiles.slice(0, 1);
    event.target.value = "";
    if (!files.length || !repository || busy) return;

    setBusy(true);
    setError("");
    setNotice("");
    try {
      await uploadPickEventHeader({ eventId, file: files[0], files, repository });
      setPreviewUrls(files.map((file) => URL.createObjectURL(file)));
      setNotice(files.length > 1
        ? `${files.length} event headers saved. Football Picks will crossfade through them automatically.`
        : "Event header saved. Upload another image here any time to replace it.");
    } catch (nextError) {
      setError(readableError(nextError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="surface-card picks-event-header-control">
      <div className="picks-event-header-control__copy">
        <span>MANAGE EVENT</span>
        <strong>EVENT HEADER</strong>
        <small>{galleryEnabled
          ? "Upload up to four approved images. Football Picks crossfades through the set automatically."
          : "Upload the approved event artwork after publishing. Uploading again replaces the stored header for this event."}</small>
      </div>

      {previewUrls.length ? (
        <div className="picks-event-header-control__preview">
          {previewUrls.map((previewUrl, index) => <img key={previewUrl} src={previewUrl} alt={`New event header preview ${index + 1}`} />)}
        </div>
      ) : null}

      <div className="picks-event-header-control__actions">
        <button
          className="secondary-action"
          type="button"
          disabled={busy || !repository?.setEventHeader}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? "UPLOADING…" : previewUrls.length ? "REPLACE HEADER" : galleryEnabled ? "UPLOAD HEADERS" : "UPLOAD HEADER"}
        </button>
        <input
          ref={inputRef}
          className="picks-event-header-control__input"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple={galleryEnabled}
          onChange={onFileChange}
          disabled={busy || !repository?.setEventHeader}
        />
      </div>

      {notice ? <p className="picks-control-feedback picks-control-feedback--success" role="status">{notice}</p> : null}
      {error ? <p className="picks-error" role="status">{error}</p> : null}
    </div>
  );
}
