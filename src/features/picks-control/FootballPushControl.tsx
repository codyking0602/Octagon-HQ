import { useEffect, useState } from "react";
import type { PickControlEvent } from "./pickControlModel";
import type { PickControlRepository } from "./pickControlRepository";

export default function FootballPushControl({
  eventId,
  repository,
}: {
  eventId: string;
  repository: PickControlRepository | null;
}) {
  const [event, setEvent] = useState<PickControlEvent | null>(null);
  const [state, setState] = useState<"loading" | "idle" | "sending" | "sent" | "error">("loading");

  useEffect(() => {
    let active = true;
    setState("loading");
    setEvent(null);
    if (!repository) {
      setState("error");
      return () => { active = false; };
    }

    void repository.loadControlEvent(eventId).then((nextEvent) => {
      if (!active) return;
      setEvent(nextEvent);
      setState(nextEvent ? "idle" : "error");
    }).catch(() => {
      if (!active) return;
      setState("error");
    });

    return () => { active = false; };
  }, [eventId, repository]);

  const sendPush = async () => {
    if (!event || !repository?.sendEventPush || state === "sending") return;
    if (!window.confirm(`Send push notification for ${event.name}?`)) return;
    setState("sending");
    try {
      await repository.sendEventPush(event.eventId, event.name);
      setState("sent");
    } catch {
      setState("error");
    }
  };

  return (
    <>
      <button
        className="secondary-action"
        type="button"
        disabled={!event || state === "loading" || state === "sending"}
        onClick={() => void sendPush()}
      >
        {state === "sending" ? "SENDING PUSH…" : "SEND PUSH"}
      </button>
      {state === "sent" ? <p role="status">Push notification sent for {event?.name}.</p> : null}
      {state === "error" ? <p role="alert">Push notification could not be sent. Try again.</p> : null}
    </>
  );
}
