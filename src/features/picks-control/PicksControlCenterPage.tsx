import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import MonitoringInboxPage from "../picks-monitoring/MonitoringInboxPage";
import {
  createMonitoringInboxRepository,
  type MonitoringInboxRepository,
} from "../picks-monitoring/monitoringInboxRepository";
import PicksSetupPage from "../picks-setup/PicksSetupPage";
import type { PickSetupDraft } from "../picks-setup/pickSetupModel";
import {
  createPickSetupRepository,
  type PickSetupRepository,
} from "../picks-setup/pickSetupRepository";
import type { PickControlEvent } from "./pickControlModel";
import PicksControlPage from "./PicksControlPage";
import {
  createPickControlRepository,
  type PickControlRepository,
} from "./pickControlRepository";

type ResourceState<T> =
  | { status: "idle" | "loading" | "error" }
  | { status: "ready"; value: T };

function displayTime(value: string | null | undefined) {
  if (!value) return "NOT SET";
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function unresolvedFightCount(event: PickControlEvent) {
  return event.bouts.filter((bout) => bout.includedInPicks && bout.resultStatus === "pending").length;
}

function primaryStatus(
  eventState: ResourceState<PickControlEvent | null>,
  draftState: ResourceState<PickSetupDraft | null>,
) {
  if (eventState.status === "error") return "CONTROL UNAVAILABLE";
  if (eventState.status !== "ready") return "LOADING CONTROL CENTER";
  if (!eventState.value) {
    if (draftState.status === "error") return "SETUP UNAVAILABLE";
    if (draftState.status !== "ready") return "CHECKING NEXT EVENT";
    return draftState.value ? "REVIEW CARD" : "SET UP NEXT EVENT";
  }
  if (eventState.value.status === "upcoming") return "PICKS OPEN";
  if (eventState.value.status === "locked") {
    const unresolved = unresolvedFightCount(eventState.value);
    return unresolved
      ? `${unresolved} FIGHT${unresolved === 1 ? "" : "S"} NEED RESULTS`
      : "PICKS CLOSED · RESULTS OPEN";
  }
  return "EVENT COMPLETE";
}

interface PicksControlCenterPageProps {
  controlRepository?: PickControlRepository | null;
  setupRepository?: PickSetupRepository | null;
  monitoringRepository?: MonitoringInboxRepository | null;
}

export default function PicksControlCenterPage({
  controlRepository: suppliedControlRepository,
  setupRepository: suppliedSetupRepository,
  monitoringRepository: suppliedMonitoringRepository,
}: PicksControlCenterPageProps) {
  const identity = useIdentity();
  const location = useLocation();
  const [controlRepository] = useState<PickControlRepository | null>(() => (
    suppliedControlRepository === undefined ? createPickControlRepository() : suppliedControlRepository
  ));
  const [setupRepository] = useState<PickSetupRepository | null>(() => (
    suppliedSetupRepository === undefined ? createPickSetupRepository() : suppliedSetupRepository
  ));
  const [monitoringRepository] = useState<MonitoringInboxRepository | null>(() => (
    suppliedMonitoringRepository === undefined ? createMonitoringInboxRepository() : suppliedMonitoringRepository
  ));
  const [eventState, setEventState] = useState<ResourceState<PickControlEvent | null>>({ status: "idle" });
  const [draftState, setDraftState] = useState<ResourceState<PickSetupDraft | null>>({ status: "idle" });
  const [controlRevision, setControlRevision] = useState(0);

  const ownedControlRepository = useMemo<PickControlRepository | null>(() => {
    if (!controlRepository) return null;
    return {
      ...controlRepository,
      async loadControlEvent(eventId) {
        setEventState({ status: "loading" });
        try {
          const event = await controlRepository.loadControlEvent(eventId);
          setEventState({ status: "ready", value: event });
          return event;
        } catch (error) {
          setEventState({ status: "error" });
          throw error;
        }
      },
    };
  }, [controlRepository]);

  const ownedSetupRepository = useMemo<PickSetupRepository | null>(() => {
    if (!setupRepository) return null;
    return {
      ...setupRepository,
      async loadDraft() {
        setDraftState({ status: "loading" });
        try {
          const draft = await setupRepository.loadDraft();
          setDraftState({ status: "ready", value: draft });
          return draft;
        } catch (error) {
          setDraftState({ status: "error" });
          throw error;
        }
      },
      async publishDraft(draftId) {
        await setupRepository.publishDraft(draftId);
        setDraftState({ status: "loading" });
        setEventState({ status: "loading" });
        setControlRevision((revision) => revision + 1);
      },
    };
  }, [setupRepository]);

  const event = eventState.status === "ready" ? eventState.value : undefined;
  const draft = draftState.status === "ready" ? draftState.value : undefined;
  const staged = event === null ? draft ?? null : null;
  const unresolved = event ? unresolvedFightCount(event) : 0;
  const eventName = event?.name ?? staged?.name ?? "NEXT UFC EVENT";
  const eventDate = event?.startsAt ?? staged?.startsAt ?? null;
  const lockTime = event?.locksAt ?? staged?.locksAt ?? null;
  const fightCount = event?.bouts.length ?? staged?.bouts.filter((bout) => bout.included).length ?? 0;
  const lifecycle = event
    ? event.status === "upcoming" ? "PUBLISHED" : event.status === "locked" ? "LOCKED / LIVE" : "COMPLETE"
    : staged ? "STAGED" : "NO ACTIVE EVENT";
  const lockStatus = event
    ? event.status === "upcoming"
      ? Date.now() < Date.parse(event.locksAt) ? `OPEN · ${displayTime(event.locksAt)}` : "LOCK DEADLINE PASSED"
      : event.status === "locked" ? "LOCKED" : "CLOSED"
    : staged ? `STAGED · ${displayTime(lockTime)}` : "NOT SET";
  const status = identity.ready && !identity.profile
    ? "OWNER SIGN-IN REQUIRED"
    : primaryStatus(eventState, draftState);
  const primaryAction = event
    ? event.status === "upcoming"
      ? { href: "#fight-night", label: "MANAGE OPEN PICKS" }
      : event.status === "locked"
        ? { href: "#fight-night", label: unresolved ? "ENTER RESULTS" : "COMPLETE EVENT" }
        : { href: "#fight-night", label: "REVIEW EVENT" }
    : { href: "#setup", label: staged ? "REVIEW & PUBLISH" : "STAGE NEXT EVENT" };

  useEffect(() => {
    const sectionId = location.hash.replace(/^#/, "");
    if (!sectionId) return;
    document.getElementById(sectionId)?.scrollIntoView?.({ block: "start" });
  }, [draftState.status, eventState.status, location.hash]);

  return (
    <div className="picks-control-center">
      <header className="page picks-control-center__header">
        <div className="picks-control-center__eyebrow-row">
          <p className="eyebrow">PRIVATE PICKS OWNER</p>
          <span>{lifecycle}</span>
        </div>
        <h1>{eventName}</h1>
        <strong className="picks-control-center__status">{status}</strong>
        {event?.subtitle || staged?.subtitle ? <p>{event?.subtitle ?? staged?.subtitle}</p> : null}

        <div className="picks-control-center__facts" aria-label="Picks event status">
          <div className="is-wide"><span>EVENT</span><strong>{eventName}</strong></div>
          <div><span>DATE & LOCAL TIME</span><strong>{displayTime(eventDate)}</strong></div>
          <div><span>PICKS LOCK</span><strong>{lockStatus}</strong></div>
          <div><span>FIGHTS</span><strong>{fightCount}</strong></div>
        </div>

        <div className="picks-control-center__actions">
          {identity.ready && !identity.profile ? (
            <button className="primary-action" type="button" onClick={identity.openDialog}>SIGN IN</button>
          ) : (
            <a className="primary-action" href={primaryAction.href}>{primaryAction.label}</a>
          )}
          <Link className="secondary-action" to="/picks">OPEN PLAYER PICKS</Link>
        </div>
      </header>

      {event === null ? (
        <section id="setup" className="picks-control-center__section" aria-label="Event setup">
          <PicksSetupPage repository={ownedSetupRepository} />
        </section>
      ) : null}

      <section
        id="fight-night"
        className="picks-control-center__section"
        aria-label="Event and fight-night control"
        hidden={!identity.profile || event === null}
      >
        <PicksControlPage key={controlRevision} repository={ownedControlRepository} />
      </section>

      {event?.status === "upcoming" ? (
        <section id="monitoring" className="picks-control-center__section" aria-label="Automatic monitoring and card review">
          <MonitoringInboxPage repository={monitoringRepository} />
        </section>
      ) : null}
    </div>
  );
}
