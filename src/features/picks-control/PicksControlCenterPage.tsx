import { useEffect, useMemo, useRef, useState } from "react";
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
import OpenPicksDashboard from "./OpenPicksDashboard";
import PickEventHeaderControl from "./PickEventHeaderControl";
import type { PickControlEvent } from "./pickControlModel";
import PicksControlPage from "./PicksControlPage";
import {
  createPickControlRepository,
  type PickControlRepository,
} from "./pickControlRepository";
import { nextProgressiveLockClockAt } from "./progressiveLockTiming";

type ResourceState<T> =
  | { status: "idle" | "loading" | "error" }
  | { status: "ready"; value: T };

type SeedState<T> =
  | { status: "empty" }
  | { status: "ready"; value: T }
  | { status: "error"; error: unknown };

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
  if (!eventState.value || eventState.value.status === "complete") {
    if (draftState.status === "error") return "SETUP UNAVAILABLE";
    if (draftState.status !== "ready") return "CHECKING NEXT EVENT";
    return draftState.value ? "REVIEW CARD" : "SET UP NEXT EVENT";
  }
  if (eventState.value.status === "upcoming") return "PICKS OPEN";
  const unresolved = unresolvedFightCount(eventState.value);
  return unresolved
    ? `${unresolved} FIGHT${unresolved === 1 ? "" : "S"} NEED RESULTS`
    : "PICKS CLOSED · RESULTS OPEN";
}

function useProgressiveLockClock(event: PickControlEvent | null | undefined) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let timeoutId: number | undefined;
    const schedule = () => {
      const current = Date.now();
      setNow(current);
      const nextBoundary = nextProgressiveLockClockAt(event, current);
      if (nextBoundary === null) return;
      timeoutId = window.setTimeout(
        schedule,
        Math.max(25, nextBoundary - current + 25),
      );
    };

    schedule();
    return () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [event]);

  return now;
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
  const controlSeed = useRef<SeedState<PickControlEvent | null>>({ status: "empty" });
  const draftSeed = useRef<SeedState<PickSetupDraft | null>>({ status: "empty" });

  useEffect(() => {
    if (!identity.ready) return;
    let active = true;

    if (!identity.profile) {
      controlSeed.current = { status: "empty" };
      draftSeed.current = { status: "empty" };
      setEventState({ status: "ready", value: null });
      setDraftState({ status: "ready", value: null });
      return;
    }

    if (!controlRepository) {
      setEventState({ status: "error" });
    } else {
      controlSeed.current = { status: "empty" };
      setEventState({ status: "loading" });
      void controlRepository.loadControlEvent().then((event) => {
        if (!active) return;
        controlSeed.current = { status: "ready", value: event };
        setEventState({ status: "ready", value: event });
      }).catch((error) => {
        if (!active) return;
        controlSeed.current = { status: "error", error };
        setEventState({ status: "error" });
      });
    }

    if (!setupRepository) {
      setDraftState({ status: "error" });
    } else {
      draftSeed.current = { status: "empty" };
      setDraftState({ status: "loading" });
      void setupRepository.loadDraft().then((draft) => {
        if (!active) return;
        draftSeed.current = { status: "ready", value: draft };
        setDraftState({ status: "ready", value: draft });
      }).catch((error) => {
        if (!active) return;
        draftSeed.current = { status: "error", error };
        setDraftState({ status: "error" });
      });
    }

    return () => {
      active = false;
    };
  }, [controlRepository, identity.profile, identity.ready, setupRepository]);

  const ownedControlRepository = useMemo<PickControlRepository | null>(() => {
    if (!controlRepository) return null;
    return {
      ...controlRepository,
      async loadControlEvent(eventId) {
        const trackLifecycle = eventId === undefined;
        if (trackLifecycle) {
          const seed = controlSeed.current;
          if (seed.status === "ready") {
            controlSeed.current = { status: "empty" };
            return seed.value;
          }
          if (seed.status === "error") {
            controlSeed.current = { status: "empty" };
            throw seed.error;
          }
          setEventState({ status: "loading" });
        }
        try {
          const event = await controlRepository.loadControlEvent(eventId);
          setEventState({ status: "ready", value: event });
          return event;
        } catch (error) {
          if (trackLifecycle) setEventState({ status: "error" });
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
        const seed = draftSeed.current;
        if (seed.status === "ready") {
          draftSeed.current = { status: "empty" };
          return seed.value;
        }
        if (seed.status === "error") {
          draftSeed.current = { status: "empty" };
          throw seed.error;
        }
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
        draftSeed.current = { status: "empty" };
        controlSeed.current = { status: "empty" };
        setDraftState({ status: "loading" });
        setEventState({ status: "loading" });
        if (!controlRepository) {
          setEventState({ status: "error" });
        } else {
          try {
            const event = await controlRepository.loadControlEvent();
            controlSeed.current = { status: "ready", value: event };
            setEventState({ status: "ready", value: event });
          } catch (error) {
            controlSeed.current = { status: "error", error };
            setEventState({ status: "error" });
          }
        }
        setControlRevision((revision) => revision + 1);
      },
    };
  }, [controlRepository, setupRepository]);

  const event = eventState.status === "ready" ? eventState.value : undefined;
  const activeEvent = event?.status === "complete" ? null : event;
  const now = useProgressiveLockClock(activeEvent);
  const draft = draftState.status === "ready" ? draftState.value : undefined;
  const staged = activeEvent === null ? draft ?? null : null;
  const unresolved = activeEvent ? unresolvedFightCount(activeEvent) : 0;
  const eventName = activeEvent?.name ?? staged?.name ?? "NOT STAGED";
  const heading = activeEvent || staged ? eventName : "Event Setup";
  const eventDate = activeEvent?.startsAt ?? staged?.startsAt ?? null;
  const lockTime = activeEvent?.locksAt ?? staged?.locksAt ?? null;
  const fightCount = activeEvent?.bouts.filter((bout) => bout.includedInPicks).length
    ?? staged?.bouts.filter((bout) => bout.included).length
    ?? 0;
  const lifecycle = activeEvent
    ? activeEvent.status === "upcoming" ? "PUBLISHED" : "LOCKED / LIVE"
    : staged ? "STAGED" : "NO ACTIVE EVENT";
  const lockStatus = activeEvent
    ? activeEvent.status === "upcoming"
      ? now < Date.parse(activeEvent.locksAt) ? `OPEN · ${displayTime(activeEvent.locksAt)}` : "LOCK DEADLINE PASSED"
      : "LOCKED"
    : staged ? `STAGED · ${displayTime(lockTime)}` : "NOT SET";
  const status = identity.ready && !identity.profile
    ? "OWNER SIGN-IN REQUIRED"
    : primaryStatus(eventState, draftState);
  const primaryAction = eventState.status !== "ready"
    ? null
    : activeEvent
      ? activeEvent.status === "upcoming"
        ? null
        : { href: "#fight-night", label: unresolved ? "ENTER RESULTS" : "COMPLETE EVENT" }
      : draftState.status === "ready"
        ? { href: "#setup", label: staged ? "REVIEW & PUBLISH" : "OPEN EVENT SETUP" }
        : null;

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
        <strong className="picks-control-center__status">{status}</strong>
        <h1>{heading}</h1>
        {activeEvent?.subtitle || staged?.subtitle ? <p>{activeEvent?.subtitle ?? staged?.subtitle}</p> : null}

        <div className="picks-control-center__facts" aria-label="Picks event status">
          <div><span>EVENT TIME</span><strong>{displayTime(eventDate)}</strong></div>
          <div><span>MASTER LOCK</span><strong>{lockStatus}</strong></div>
          <div><span>FIGHTS</span><strong>{fightCount}</strong></div>
        </div>

        <div className="picks-control-center__actions">
          {identity.ready && !identity.profile ? (
            <button className="primary-action" type="button" onClick={identity.openDialog}>SIGN IN</button>
          ) : primaryAction ? (
            <a className={activeEvent ? "primary-action" : "secondary-action"} href={primaryAction.href}>{primaryAction.label}</a>
          ) : null}
          <Link className="secondary-action" to="/picks">OPEN PLAYER PICKS</Link>
        </div>
      </header>

      {eventState.status === "ready" && activeEvent === null && draftState.status === "ready" ? (
        <section id="setup" className="picks-control-center__section" aria-label="Event setup">
          <details className="surface-card picks-control-center__panel" open>
            <summary>
              <span>EVENT SETUP</span>
              <strong>{staged ? "REVIEW STAGED CARD" : "STAGE THE NEXT CARD"}</strong>
            </summary>
            <div className="picks-control-center__panel-body">
              <PicksSetupPage repository={ownedSetupRepository} />
            </div>
          </details>
        </section>
      ) : null}

      {activeEvent?.status === "upcoming" ? (
        <section className="picks-control-center__section" aria-label="Manage event header">
          <PickEventHeaderControl eventId={activeEvent.eventId} repository={ownedControlRepository} />
        </section>
      ) : null}

      {activeEvent?.status === "upcoming" ? (
        <section id="monitoring" className="picks-control-center__section" aria-label="Automatic monitoring and card review">
          <MonitoringInboxPage
            repository={monitoringRepository}
            embedded
            onAppliedChange={() => setControlRevision((revision) => revision + 1)}
          />
        </section>
      ) : null}

      {identity.profile && eventState.status === "ready" && event != null ? (
        <section
          id="fight-night"
          className="picks-control-center__section"
          aria-label="Event and fight-night control"
        >
          {activeEvent?.status === "locked" || event.status === "complete" ? (
            <PicksControlPage key={controlRevision} repository={ownedControlRepository} now={now} />
          ) : (
            <OpenPicksDashboard key={controlRevision} repository={ownedControlRepository} now={now} />
          )}
        </section>
      ) : null}
    </div>
  );
}
