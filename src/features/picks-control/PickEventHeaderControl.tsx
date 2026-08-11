import { useEffect, useRef, useState, type ChangeEvent } from "react";
import type { PickControlRepository } from "./pickControlRepository";
import { uploadPickEventHeader } from "./pickEventHeaderUpload";

interface PickEventHeaderControlProps {
  eventId: string;
  repository: PickControlRepository | null;
}

function readableError(error: unknown) {
  return error instanceof Error ? error.message : "Event header could not be uploaded.";
}

export default function PickEventHeaderControl({ eventId, repository }: PickEventHeaderControlProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !repository || busy) return;

    setBusy(true);
    setError("");
    setNotice("");
    try {
      await uploadPickEventHeader({ eventId, file, repository });
      const nextPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(nextPreviewUrl);
      setNotice("Event header saved. Upload another image here any time to replace it.");
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
        <small>Upload the approved event artwork after publishing. Uploading again replaces the stored header for this event.</small>
      </div>

      {previewUrl ? (
        <div className="picks-event-header-control__preview">
          <img src={previewUrl} alt="New event header preview" />
        </div>
      ) : null}

      <div className="picks-event-header-control__actions">
        <button
          className="secondary-action"
          type="button"
          disabled={busy || !repository?.setEventHeader}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? "UPLOADING…" : previewUrl ? "REPLACE HEADER" : "UPLOAD HEADER"}
        </button>
        <input
          ref={inputRef}
          className="picks-event-header-control__input"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={onFileChange}
          disabled={busy || !repository?.setEventHeader}
        />
      </div>

      {notice ? <p className="picks-control-feedback picks-control-feedback--success" role="status">{notice}</p> : null}
      {error ? <p className="picks-error" role="status">{error}</p> : null}
    </div>
  );
}
