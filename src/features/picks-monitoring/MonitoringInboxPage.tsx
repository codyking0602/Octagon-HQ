import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import {
  monitoringFindingTypeLabel,
  type MonitoringFinding,
} from "./monitoringInboxModel";
import {
  createMonitoringInboxRepository,
  type MonitoringInboxRepository,
} from "./monitoringInboxRepository";

function displayTime(value: string | null | undefined) {
  if (!value) return "NOT YET";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function readableError(error: unknown) {
  const message = error instanceof Error ? error.message : "Monitoring Inbox could not complete that request.";
  if (message.toLowerCase().includes("pick control owner required")) {
    return "Monitoring Inbox is available only to the designated Fight Night owner.";
  }
  return message;
}

function evidenceLabel(value: unknown) {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value, null, 2);
}

function FindingEvidence({ finding }: { finding: MonitoringFinding }) {
  const before = evidenceLabel(finding.beforeValue);
  const after = evidenceLabel(finding.afterValue);
  if (!before && !after) return null;

  return (
    <details className="monitoring-evidence">
      <summary>VIEW CHANGE</summary>
      <div>
        {before ? <section><span>BEFORE</span><pre>{before}</pre></section> : null}
        {after ? <section><span>AFTER</span><pre>{after}</pre></section> : null}
      </div>
    </details>
  );
}

interface MonitoringInboxPageProps {
  repository?: MonitoringInboxRepository | null;
}

export default function MonitoringInboxPage({ repository: suppliedRepository }: MonitoringInboxPageProps) {
  const identity = useIdentity();
  const [repository] = useState<MonitoringInboxRepository | null>(() => (
    suppliedRepository === undefined ? createMonitoringInboxRepository() : suppliedRepository
  ));
  const [inbox, setInbox] = useState<Awaited<ReturnType<MonitoringInboxRepository["loadInbox"]>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");

  const loadInbox = useCallback(async () => {
    if (!repository || !identity.profile) return;
    setLoading(true);
    try {
      setInbox(await repository.loadInbox());
      setError("");
    } catch (nextError) {
      setInbox(null);
      setError(readableError(nextError));
    } finally {
      setLoading(false);
    }
  }, [identity.profile, repository]);

  useEffect(() => {
    if (!identity.ready) return;
    if (!identity.profile) {
      setInbox(null);
      setLoading(false);
      setError("");
      return;
    }
    if (!repository) {
      setLoading(false);
      setError("Monitoring Inbox is not connected on this build.");
      return;
    }
    void loadInbox();
  }, [identity.profile, identity.ready, loadInbox, repository]);

  async function runAction(key: string, action: () => Promise<void>) {
    setBusyAction(key);
    setError("");
    try {
      await action();
      await loadInbox();
    } catch (nextError) {
      setError(readableError(nextError));
    } finally {
      setBusyAction("");
    }
  }

  function runManualCheck() {
    if (!repository) return;
    const remaining = inbox?.latestRun?.providerRequestsRemaining;
    const quotaNote = remaining === null || remaining === undefined
      ? "This will use the configured monitoring provider."
      : `The last provider response reported ${remaining} requests remaining.`;
    if (!window.confirm(`Run a live monitoring check now? ${quotaNote}`)) return;
    void runAction("manual", repository.runManualCheck);
  }

  function reviewFinding(finding: MonitoringFinding, status: "reviewed" | "dismissed") {
    if (!repository) return;
    void runAction(`finding:${finding.findingId}`, () => repository.reviewFinding(finding.findingId, status));
  }

  const schedulerReady = Boolean(inbox?.scheduler.active && inbox.scheduler.tokenConfigured);
  const latestRun = inbox?.latestRun ?? null;
  const decision = inbox?.latestScheduledDecision ?? null;
  const providerWorked = Boolean(decision?.providerCalled && latestRun);
  const automationNeedsAttention = !schedulerReady || decision?.outcome === "failed";
  const automationTitle = automationNeedsAttention
    ? "AUTO-SYNC NEEDS ATTENTION"
    : providerWorked
      ? "AUTO-SYNC CHECKED THE EVENT"
      : "AUTO-SYNC IS WAITING FOR ITS NEXT CHECK";
  const automationDetail = automationNeedsAttention
    ? "The scheduler or monitoring run failed. Run a check now and review the result."
    : providerWorked
      ? `Last real provider check ${displayTime(latestRun?.completedAt ?? latestRun?.startedAt)}.`
      : `Scheduler woke ${displayTime(inbox?.scheduler.lastWakeStartedAt)}, but no provider check was due.`;

  return (
    <div className="page monitoring-inbox-page">
      {!identity.ready || loading ? (
        <section className="surface-card monitoring-inbox-state" aria-live="polite">
          <strong>Loading owner monitoring…</strong>
        </section>
      ) : null}

      {identity.ready && !identity.profile ? (
        <section className="surface-card monitoring-inbox-state">
          <p className="eyebrow">OWNER SIGN-IN REQUIRED</p>
          <h2>Sign in to manage Picks monitoring.</h2>
          <button className="primary-action" type="button" onClick={identity.openDialog}>SIGN IN</button>
        </section>
      ) : null}

      {identity.profile && !loading && error && !inbox ? (
        <section className="surface-card monitoring-inbox-state">
          <p className="eyebrow">MONITORING UNAVAILABLE</p>
          <h2>{error}</h2>
          <Link className="secondary-action" to="/picks">BACK TO PICKS</Link>
        </section>
      ) : null}

      {inbox ? (
        <>
          <section className={`surface-card monitoring-status${automationNeedsAttention ? " is-paused" : " is-active"}`}>
            <div className="monitoring-status__topline">
              <div>
                <p className="eyebrow">AUTOMATION</p>
                <h2>{automationTitle}</h2>
              </div>
              <span>{automationNeedsAttention ? "CHECK" : "ACTIVE"}</span>
            </div>
            <p>{automationDetail}</p>
            <div className="monitoring-status__grid" aria-label="Automation status">
              <div><span>NEXT CHECK</span><strong>{displayTime(inbox.scheduleState?.nextEligibleAt)}</strong></div>
              <div><span>CHANGES TO REVIEW</span><strong>{inbox.unresolvedCount}</strong></div>
            </div>
            <button className="primary-action" type="button" disabled={Boolean(busyAction)} onClick={runManualCheck}>
              {busyAction === "manual" ? "CHECKING NOW…" : "CHECK NOW"}
            </button>
          </section>

          {inbox.monitoredEvent ? (
            <section className="surface-card monitoring-event">
              <div>
                <p className="eyebrow">CURRENT EVENT</p>
                <h2>{inbox.monitoredEvent.name}</h2>
                <strong>{inbox.monitoredEvent.subtitle}</strong>
              </div>
              <div className="monitoring-event__facts">
                <span>{inbox.monitoredEvent.boutCount} FIGHTS</span>
                <span>LOCK {displayTime(inbox.monitoredEvent.locksAt)}</span>
              </div>
            </section>
          ) : (
            <section className="surface-card monitoring-inbox-state">
              <p className="eyebrow">NO CURRENT EVENT</p>
              <h2>Stage or publish the next UFC card.</h2>
              <Link className="primary-action" to="/picks/setup">OPEN EVENT SETUP</Link>
            </section>
          )}

          <section className="monitoring-section" aria-labelledby="monitoring-findings-title">
            <div className="monitoring-section__heading">
              <div><p className="eyebrow">PENDING CHANGES</p><h2 id="monitoring-findings-title">Review only what changed</h2></div>
              <span>{inbox.newFindings.length}</span>
            </div>
            {inbox.newFindings.length ? inbox.newFindings.map((finding) => {
              const busy = busyAction === `finding:${finding.findingId}`;
              return (
                <article className={`surface-card monitoring-finding monitoring-finding--${finding.severity}`} key={finding.findingId}>
                  <div className="monitoring-finding__topline">
                    <span>{monitoringFindingTypeLabel(finding.findingType)}</span>
                    <small>{displayTime(finding.detectedAt)}</small>
                  </div>
                  <h3>{finding.summary}</h3>
                  {finding.matchupIdentity ? <p>{finding.matchupIdentity.replaceAll("|", " vs. ")}</p> : null}
                  <FindingEvidence finding={finding} />
                  <div className="monitoring-finding__actions">
                    <button type="button" disabled={Boolean(busyAction)} onClick={() => reviewFinding(finding, "reviewed")}>{busy ? "SAVING…" : "MARK REVIEWED"}</button>
                    <button type="button" disabled={Boolean(busyAction)} onClick={() => reviewFinding(finding, "dismissed")}>DISMISS</button>
                  </div>
                </article>
              );
            }) : (
              <section className="surface-card monitoring-empty">
                <p className="eyebrow">ALL CLEAR</p>
                <h3>No event changes need your attention.</h3>
              </section>
            )}
          </section>

          <button className="secondary-action" type="button" disabled={Boolean(busyAction)} onClick={() => void loadInbox()}>
            REFRESH STATUS
          </button>
          {error ? <p className="picks-error" role="status">{error}</p> : null}
        </>
      ) : null}
    </div>
  );
}
