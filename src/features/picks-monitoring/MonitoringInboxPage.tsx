import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import {
  monitoringFindingTypeLabel,
  monitoringRunStatusLabel,
  type MonitoringFinding,
  type MonitoringInbox,
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
      <summary>VIEW EVIDENCE</summary>
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
  const [inbox, setInbox] = useState<MonitoringInbox | null>(null);
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

  const schedulerReady = inbox?.scheduler.active && inbox.scheduler.tokenConfigured;
  const latestRun = inbox?.latestRun ?? null;
  const decision = inbox?.latestScheduledDecision ?? null;
  const decisionLabel = decision?.outcome === "skipped"
    ? `SKIPPED — ${(decision.reason ?? "unknown").replaceAll("_", " ").toUpperCase()}`
    : decision?.outcome === "failed" ? "FAILED — ACTION NEEDED"
      : decision?.outcome === "partial" ? "CHECKED — PARTIAL COVERAGE"
        : decision?.outcome === "completed" ? "CHECKED SUCCESSFULLY" : "NOT YET";

  return (
    <div className="page monitoring-inbox-page">
      <section className="page-heading monitoring-inbox-heading">
        <p className="eyebrow">PRIVATE OWNER TOOL</p>
        <h1>Monitoring Inbox</h1>
        <p>Automatic checks watch the UFC card and odds. Valid pre-lock odds can update Picks automatically; card-change findings stay here for owner review and are never published automatically.</p>
        <div className="monitoring-inbox-heading__links">
          <Link to="/picks/setup">EVENT SETUP</Link>
          <Link to="/picks/control">FIGHT NIGHT RESULTS</Link>
          <Link to="/picks">PLAYER PICKS</Link>
        </div>
      </section>

      {!identity.ready || loading ? (
        <section className="surface-card monitoring-inbox-state" aria-live="polite">
          <strong>Loading Monitoring Inbox…</strong>
        </section>
      ) : null}

      {identity.ready && !identity.profile ? (
        <section className="surface-card monitoring-inbox-state">
          <p className="eyebrow">OWNER SIGN-IN REQUIRED</p>
          <h2>Sign in to open Monitoring Inbox.</h2>
          <button className="primary-action" type="button" onClick={identity.openDialog}>SIGN IN</button>
        </section>
      ) : null}

      {identity.profile && !loading && error && !inbox ? (
        <section className="surface-card monitoring-inbox-state">
          <p className="eyebrow">INBOX UNAVAILABLE</p>
          <h2>{error}</h2>
          <Link className="secondary-action" to="/picks">BACK TO PICKS</Link>
        </section>
      ) : null}

      {inbox ? (
        <>
          <section className={`surface-card monitoring-status${schedulerReady ? " is-active" : " is-paused"}`}>
            <div className="monitoring-status__topline">
              <div>
                <p className="eyebrow">AUTOMATIC MONITORING</p>
                <h2>{schedulerReady ? "AUTOMATION READY" : "AUTOMATION NEEDS ATTENTION"}</h2>
              </div>
              <span>{schedulerReady ? "ACTIVE" : "PAUSED"}</span>
            </div>
            <div className="monitoring-status__grid">
              <div><span>SCHEDULE</span><strong>{inbox.scheduler.schedule ?? "NOT INSTALLED"}</strong></div>
              <div><span>LAST WAKE</span><strong>{displayTime(inbox.scheduler.lastWakeStartedAt)}</strong></div>
              <div><span>WAKE STATUS</span><strong>{inbox.scheduler.lastWakeStatus?.toUpperCase() ?? "NOT YET"}</strong></div>
              <div><span>LAST OUTCOME</span><strong>{decisionLabel}</strong></div>
              <div><span>NEXT CHECK</span><strong>{displayTime(inbox.scheduleState?.nextEligibleAt)}</strong></div>
            </div>
            <small>A scheduler wake proves infrastructure only. LAST OUTCOME reports whether providers were actually checked or why work was skipped.</small>
          </section>

          {inbox.monitoredEvent ? (
            <section className="surface-card monitoring-event">
              <div>
                <p className="eyebrow">{inbox.monitoredEvent.kind === "staged" ? "STAGED EVENT" : "LIVE PICKS EVENT"}</p>
                <h2>{inbox.monitoredEvent.name}</h2>
                <strong>{inbox.monitoredEvent.subtitle}</strong>
              </div>
              <div className="monitoring-event__facts">
                <span>{displayTime(inbox.monitoredEvent.startsAt)}</span>
                <span>{inbox.monitoredEvent.boutCount} FIGHTS</span>
                <span>LOCK {displayTime(inbox.monitoredEvent.locksAt)}</span>
              </div>
            </section>
          ) : (
            <section className="surface-card monitoring-inbox-state">
              <p className="eyebrow">NO MONITORED EVENT</p>
              <h2>Stage or publish the next UFC card.</h2>
              <Link className="primary-action" to="/picks/setup">OPEN EVENT SETUP</Link>
            </section>
          )}

          <section className="monitoring-summary" aria-label="Monitoring status summary">
            <div><span>UNRESOLVED</span><strong>{inbox.unresolvedCount}</strong></div>
            <div><span>LAST CARD CHECK</span><strong>{displayTime(latestRun?.cardSource ? latestRun.completedAt ?? latestRun.startedAt : null)}</strong></div>
            <div><span>LAST ODDS CHECK</span><strong>{displayTime(latestRun?.oddsProvider ? latestRun.completedAt ?? latestRun.startedAt : null)}</strong></div>
            <div><span>RESULT</span><strong>{latestRun ? monitoringRunStatusLabel(latestRun.status) : "NO RUN"}</strong></div>
            <div><span>QUOTA LEFT</span><strong>{latestRun?.providerRequestsRemaining ?? "—"}</strong></div>
          </section>

          <section className="surface-card monitoring-actions">
            <div>
              <p className="eyebrow">OWNER ACTIONS</p>
              <h2>Check now or refresh the ledger</h2>
            </div>
            <button className="primary-action" type="button" disabled={Boolean(busyAction)} onClick={runManualCheck}>
              {busyAction === "manual" ? "RUNNING CHECK…" : "RUN CHECK NOW"}
            </button>
            <button className="secondary-action" type="button" disabled={Boolean(busyAction)} onClick={() => void loadInbox()}>
              REFRESH INBOX
            </button>
          </section>

          <section className="monitoring-section" aria-labelledby="monitoring-findings-title">
            <div className="monitoring-section__heading">
              <div><p className="eyebrow">NEEDS REVIEW</p><h2 id="monitoring-findings-title">Open findings</h2></div>
              <span>{inbox.newFindings.length}</span>
            </div>
            {inbox.newFindings.length ? inbox.newFindings.map((finding) => {
              const busy = busyAction === `finding:${finding.findingId}`;
              return (
                <article className={`surface-card monitoring-finding monitoring-finding--${finding.severity}`} key={finding.findingId}>
                  <div className="monitoring-finding__topline">
                    <span>{monitoringFindingTypeLabel(finding.findingType)}</span>
                    <small>{displayTime(finding.detectedAt)} · {finding.triggerKind.toUpperCase()}</small>
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
                <p className="eyebrow">NO ACTION NEEDED</p>
                <h3>No unresolved monitoring findings.</h3>
              </section>
            )}
          </section>

          <details className="surface-card monitoring-history">
            <summary><span>RECENT CHECKS</span><small>{inbox.recentRuns.length} RUNS</small></summary>
            <div>
              {inbox.recentRuns.map((run) => (
                <article key={run.runId}>
                  <div><strong>{monitoringRunStatusLabel(run.status)}</strong><span>{run.triggerKind.toUpperCase()}</span></div>
                  <p>{displayTime(run.completedAt ?? run.startedAt)} · {run.findingCount} findings · {run.completeSnapshotCount} odds snapshots</p>
                  <small>Quota remaining: {run.providerRequestsRemaining ?? "unknown"}</small>
                </article>
              ))}
              {!inbox.recentRuns.length ? <p>No monitoring runs have been recorded yet.</p> : null}
            </div>
          </details>

          <details className="surface-card monitoring-history">
            <summary><span>REVIEWED FINDINGS</span><small>{inbox.reviewedFindings.length} SHOWN</small></summary>
            <div>
              {inbox.reviewedFindings.map((finding) => (
                <article key={finding.findingId}>
                  <div><strong>{monitoringFindingTypeLabel(finding.findingType)}</strong><span>{finding.reviewStatus.toUpperCase()}</span></div>
                  <p>{finding.summary}</p>
                  <small>{displayTime(finding.reviewedAt ?? finding.detectedAt)}</small>
                </article>
              ))}
              {!inbox.reviewedFindings.length ? <p>No findings have been reviewed yet.</p> : null}
            </div>
          </details>

          {error ? <p className="picks-error" role="status">{error}</p> : null}
        </>
      ) : null}
    </div>
  );
}
