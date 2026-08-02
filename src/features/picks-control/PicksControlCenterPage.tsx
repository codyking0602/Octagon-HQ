import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import MonitoringInboxPage from "../picks-monitoring/MonitoringInboxPage";
import {
  monitoringRunStatusLabel,
  type MonitoringInbox,
} from "../picks-monitoring/monitoringInboxModel";
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

function decisionLabel(inbox: MonitoringInbox) {
  const decision = inbox.latestScheduledDecision;
  if (!decision) return "NOT YET";
  if (decision.outcome === "skipped") {
    return `SKIPPED · ${(decision.reason ?? "unknown").replaceAll("_", " ").toUpperCase()}`;
  }
  if (decision.outcome === "failed") return "FAILED · ACTION NEEDED";
  if (decision.outcome === "partial") return "CHECKED · PARTIAL COVERAGE";
  return "CHECKED SUCCESSFULLY";
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
  const [monitoringState, setMonitoringState] = useState<ResourceState<MonitoringInbox>>({ status: "idle" });
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

  const ownedMonitoringRepository = useMemo<MonitoringInboxRepository | null>(() => {
    if (!monitoringRepository) return null;
    return {
      ...monitoringRepository,
      async loadInbox() {
        setMonitoringState({ status: "loading" });
        try {
          const inbox = await monitoringRepository.loadInbox();
          setMonitoringState({ status: "ready", value: inbox });
          return inbox;
        } catch (error) {
          setMonitoringState({ status: "error" });
          throw error;
        }
      },
    };
  }, [monitoringRepository]);

  const event = eventState.status === "ready" ? eventState.value : undefined;
  const draft = draftState.status === "ready" ? draftState.value : undefined;
  const inbox = monitoringState.status === "ready" ? monitoringState.value : undefined;
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
  const schedulerReady = Boolean(inbox?.scheduler.active && inbox.scheduler.tokenConfigured);
  const monitoringNeedsAttention = Boolean(
    inbox && (
      !schedulerReady
      || inbox.newFindings.length
      || inbox.latestScheduledDecision?.outcome === "failed"
      || inbox.latestRun?.status === "failed"
    )
  );

  useEffect(() => {
    const sectionId = location.hash.replace(/^#/, "");
    if (!sectionId) return;
    document.getElementById(sectionId)?.scrollIntoView?.({ block: "start" });
  }, [draftState.status, eventState.status, location.hash, monitoringState.status]);

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

        {monitoringNeedsAttention ? (
          <p className="picks-control-center__attention" role="status">
            {inbox?.newFindings.length
              ? `${inbox.newFindings.length} MONITORING FINDING${inbox.newFindings.length === 1 ? "" : "S"} NEED REVIEW`
              : "AUTOMATIC MONITORING NEEDS ATTENTION"}
          </p>
        ) : null}

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
          {inbox ? (
            <section className={`surface-card picks-control-center__monitoring${schedulerReady ? " is-ready" : " needs-attention"}`}>
              <div className="picks-control-center__monitoring-heading">
                <div>
                  <p className="eyebrow">AUTOMATIC MONITORING</p>
                  <h2>{schedulerReady ? "AUTOMATION READY" : "AUTOMATION NEEDS ATTENTION"}</h2>
                </div>
                <span>{inbox.newFindings.length ? `${inbox.newFindings.length} TO REVIEW` : "NO OPEN FINDINGS"}</span>
              </div>
              <div className="picks-control-center__monitoring-grid" aria-label="Operational monitoring status">
                <div><span>LAST OUTCOME</span><strong>{decisionLabel(inbox)}</strong></div>
                <div><span>LAST CARD CHECK</span><strong>{displayTime(inbox.latestRun?.cardSource ? inbox.latestRun.completedAt ?? inbox.latestRun.startedAt : null)}</strong></div>
                <div><span>LAST ODDS CHECK</span><strong>{displayTime(inbox.latestRun?.oddsProvider ? inbox.latestRun.completedAt ?? inbox.latestRun.startedAt : null)}</strong></div>
                <div><span>NEXT ELIGIBLE CHECK</span><strong>{displayTime(inbox.scheduleState?.nextEligibleAt)}</strong></div>
                <div><span>FINDINGS NEEDING REVIEW</span><strong>{inbox.unresolvedCount}</strong></div>
              </div>
              <details className="picks-control-center__system-details">
                <summary>SYSTEM DETAILS</summary>
                <div>
                  <span>SCHEDULE</span><strong>{inbox.scheduler.schedule ?? "NOT INSTALLED"}</strong>
                  <span>LAST SCHEDULER WAKE</span><strong>{displayTime(inbox.scheduler.lastWakeStartedAt)}</strong>
                  <span>WAKE STATUS</span><strong>{inbox.scheduler.lastWakeStatus?.toUpperCase() ?? "NOT YET"}</strong>
                  <span>TOKEN CONFIGURED</span><strong>{inbox.scheduler.tokenConfigured ? "YES" : "NO"}</strong>
                  <span>JOB</span><strong>{inbox.scheduler.jobName ?? inbox.scheduler.jobId ?? "NOT INSTALLED"}</strong>
                  <span>LEASE UNTIL</span><strong>{displayTime(inbox.scheduleState?.leaseUntil)}</strong>
                  <span>LAST CLAIMED</span><strong>{displayTime(inbox.scheduleState?.lastClaimedAt)}</strong>
                  <span>PROVIDER</span><strong>{inbox.latestRun?.oddsProvider ?? "NOT YET"}</strong>
                  <span>QUOTA REMAINING</span><strong>{inbox.latestRun?.providerRequestsRemaining ?? "UNKNOWN"}</strong>
                  <span>PROVIDER CALLED</span><strong>{inbox.latestScheduledDecision?.providerCalled ? "YES" : "NO"}</strong>
                  <span>LATEST RUN</span><strong>{inbox.latestRun ? monitoringRunStatusLabel(inbox.latestRun.status) : "NO RUN"}</strong>
                </div>
                {inbox.latestRun?.diagnostics.length ? <pre>{JSON.stringify(inbox.latestRun.diagnostics, null, 2)}</pre> : null}
              </details>
            </section>
          ) : null}
          <MonitoringInboxPage repository={ownedMonitoringRepository} />
        </section>
      ) : null}
    </div>
  );
}
