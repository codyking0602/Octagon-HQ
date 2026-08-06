import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useIdentity } from "../identity/IdentityProvider";
import {
  compactMonitoringValue,
  monitoringValuesEquivalent,
} from "./monitoringChangeValues";
import {
  monitoringFindingTypeLabel,
  type MonitoringFinding,
} from "./monitoringInboxModel";
import {
  createMonitoringInboxRepository,
  type MonitoringInboxRepository,
} from "./monitoringInboxRepository";

function displayTime(value: string | null | undefined) {
  if (!value || !Number.isFinite(Date.parse(value))) return "NOT YET";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function nextHourlyWake(value: string | null | undefined) {
  if (!value || !Number.isFinite(Date.parse(value))) return null;
  return new Date(Date.parse(value) + 60 * 60 * 1000).toISOString();
}

function nextQuotaReset() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
}

function readableError(error: unknown) {
  const message = error instanceof Error ? error.message : "Monitoring Inbox could not complete that request.";
  if (message.toLowerCase().includes("pick control owner required")) {
    return "Monitoring Inbox is available only to the designated Fight Night owner.";
  }
  return message;
}

function hasEvidenceValue(value: unknown) {
  if (value === null || value === undefined) return false;
  return typeof value !== "string" || value.trim().length > 0;
}

function isEquivalentFinding(finding: MonitoringFinding) {
  return hasEvidenceValue(finding.beforeValue)
    && hasEvidenceValue(finding.afterValue)
    && monitoringValuesEquivalent(finding.beforeValue, finding.afterValue);
}

function discoveryFieldLabel(finding: MonitoringFinding) {
  const field = finding.sourceDetails.change_field;
  if (field === "venue") return "venue";
  if (field === "location") return "location";
  if (field === "weight_class") return "weight class";
  if (field === "added_bout") return "fight";
  return "value";
}

function approvalLabel(finding: MonitoringFinding) {
  switch (finding.approvalProposal?.action) {
    case "add_bout": return "ADD FIGHT";
    case "remove_bout": return "REMOVE FIGHT";
    case "replace_fighter": return "APPLY REPLACEMENT";
    case "reorder_card": return "APPLY ORDER";
    default: return "APPROVE CHANGE";
  }
}

function FindingEvidence({ finding }: { finding: MonitoringFinding }) {
  const hasBefore = hasEvidenceValue(finding.beforeValue);
  const hasAfter = hasEvidenceValue(finding.afterValue);
  if (!hasBefore && !hasAfter) return null;

  const after = compactMonitoringValue(finding.afterValue);
  if (!hasBefore && hasAfter) {
    const field = discoveryFieldLabel(finding);
    return (
      <p className="monitoring-evidence" aria-label={`Set ${field} to ${after}`}>
        <span>Set {field} to</span>
        <b aria-hidden="true">·</b>
        <span title={after}>{after}</span>
      </p>
    );
  }

  const before = compactMonitoringValue(finding.beforeValue);
  return (
    <p className="monitoring-evidence" aria-label={`${before} changed to ${after}`}>
      <span title={before}>{before}</span>
      <b aria-hidden="true">→</b>
      <span title={after}>{after}</span>
    </p>
  );
}

interface MonitoringInboxPageProps {
  repository?: MonitoringInboxRepository | null;
  embedded?: boolean;
  onAppliedChange?: () => void | Promise<void>;
}

export default function MonitoringInboxPage({
  repository: suppliedRepository,
  embedded = false,
  onAppliedChange,
}: MonitoringInboxPageProps) {
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

  async function runAction(
    key: string,
    action: () => Promise<void>,
    afterSuccess?: () => void | Promise<void>,
  ) {
    setBusyAction(key);
    setError("");
    try {
      await action();
      await afterSuccess?.();
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
    if (!window.confirm(`Run a complete UFC card and odds check now? ${quotaNote}`)) return;
    void runAction("manual", repository.runManualCheck);
  }

  function approveFinding(finding: MonitoringFinding) {
    if (!repository?.approveFinding || !finding.approvalProposal) return;
    if (!window.confirm(
      `Are you sure you want to apply this detected change?\n\n${finding.summary}\n\nThe backend will reject it if the live card changed since this check.`,
    )) return;
    const auditDescription = `Owner confirmed detected change: ${finding.summary}`;
    void runAction(
      `finding:${finding.findingId}`,
      () => repository.approveFinding!(finding.findingId, auditDescription),
      onAppliedChange,
    );
  }

  function reviewFinding(finding: MonitoringFinding, status: "reviewed" | "dismissed") {
    if (!repository) return;
    void runAction(`finding:${finding.findingId}`, () => repository.reviewFinding(finding.findingId, status));
  }

  const schedulerReady = Boolean(inbox?.scheduler.active && inbox.scheduler.tokenConfigured);
  const decision = inbox?.latestScheduledDecision ?? null;
  const scheduledProviderWorked = Boolean(
    decision?.providerCalled && (decision.outcome === "completed" || decision.outcome === "partial"),
  );
  const partialCoverage = decision?.outcome === "partial";
  const scheduledFailure = decision?.outcome === "failed";
  const automationNeedsAttention = !schedulerReady || scheduledFailure || partialCoverage;
  const automationTitle = !schedulerReady || scheduledFailure
    ? "AUTO-SYNC NEEDS ATTENTION"
    : partialCoverage
      ? "AUTO-SYNC HAS PARTIAL COVERAGE"
      : scheduledProviderWorked
        ? "AUTO-SYNC CHECKED THE EVENT"
        : "AUTO-SYNC IS WAITING FOR ITS NEXT CHECK";
  const skippedReason = decision?.reason === "no_event"
    ? "there is no event to monitor"
    : decision?.reason === "already_claimed"
      ? "another authorized check was already in progress"
      : "no provider check was due";
  const automationDetail = !schedulerReady
    ? "Automatic monitoring is not fully configured. Run a check now and review the receipt below."
    : scheduledFailure
      ? `The scheduled event check failed ${displayTime(decision?.attemptedAt)}. Run a check now and review the receipt below.`
      : partialCoverage
        ? `The scheduled provider call at ${displayTime(decision?.attemptedAt)} completed with missing fight coverage.`
        : scheduledProviderWorked
          ? `The scheduler called both the UFC card source and odds provider ${displayTime(decision?.attemptedAt)}.`
          : `The scheduler woke ${displayTime(inbox?.scheduler.lastWakeStartedAt)}, but ${skippedReason}.`;
  const sourceUrl = inbox?.latestRun?.cardSourceUrl ?? null;
  const pendingFindings = inbox?.newFindings.filter((finding) => !isEquivalentFinding(finding)) ?? [];
  const latestRun = inbox?.latestRun ?? null;
  const allCurrentFindings = [...(inbox?.newFindings ?? []), ...(inbox?.reviewedFindings ?? [])]
    .filter((finding, index, values) => values.findIndex((item) => item.findingId === finding.findingId) === index);
  const latestFindings = latestRun
    ? allCurrentFindings.filter((finding) => finding.runId === latestRun.runId)
    : [];
  const oddsUpdated = latestFindings.filter((finding) => (
    (finding.findingType === "odds_available" || finding.findingType === "odds_change")
    && finding.sourceDetails.automatically_applied === true
  )).length;
  const coverageMatched = latestRun?.completeSnapshotCount ?? 0;
  const coverageMissing = latestRun?.missingSnapshotCount ?? 0;
  const coverageTotal = coverageMatched + coverageMissing;
  const oddsUnchanged = Math.max(0, coverageMatched - oddsUpdated);
  const cardChangesFound = latestFindings.filter((finding) => finding.findingType === "card_change").length;
  const quotaRemaining = latestRun?.providerRequestsRemaining ?? null;
  const receipt = latestRun
    ? `${displayTime(latestRun.completedAt ?? latestRun.startedAt)} · ${latestRun.status === "failed" ? "Check failed" : "UFC card checked"}. Odds provider called. ${coverageMatched}/${coverageTotal || inbox?.monitoredEvent?.boutCount || 0} fights matched, ${oddsUpdated} odds updated, ${oddsUnchanged} unchanged, ${cardChangesFound} card ${cardChangesFound === 1 ? "change" : "changes"} found.${quotaRemaining === null ? "" : ` ${quotaRemaining} requests remain.`}`
    : "No completed UFC card and odds provider check has been recorded yet.";

  return (
    <div className={`page monitoring-inbox-page${embedded ? " monitoring-inbox-page--embedded" : ""}`}>
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
            <div className="monitoring-status__grid monitoring-status__grid--proof" aria-label="Automation status">
              <div><span>NEXT SCHEDULER WAKE</span><strong>{displayTime(nextHourlyWake(inbox.scheduler.lastWakeStartedAt))}</strong></div>
              <div><span>NEXT PROVIDER CALL</span><strong>{displayTime(inbox.scheduleState?.nextEligibleAt)}</strong></div>
              <div><span>LAST CARD CHECK</span><strong>{displayTime(latestRun?.completedAt ?? latestRun?.startedAt)}</strong></div>
              <div><span>LAST ODDS CALL</span><strong>{displayTime(latestRun?.completedAt ?? latestRun?.startedAt)}</strong></div>
              <div><span>MONTHLY REQUESTS LEFT</span><strong>{quotaRemaining ?? "UNKNOWN"}</strong><small>RESET {displayTime(nextQuotaReset())}</small></div>
              <div><span>FIGHT COVERAGE</span><strong>{coverageMatched}/{coverageTotal || inbox.monitoredEvent?.boutCount || 0} MATCHED</strong></div>
              <div><span>ODDS RESULT</span><strong>{oddsUpdated} UPDATED · {oddsUnchanged} SAME</strong></div>
              <div><span>CARD RESULT</span><strong>{pendingFindings.length ? `${pendingFindings.length} TO REVIEW` : "ALL CLEAR"}</strong></div>
            </div>
            <div className="monitoring-status__receipt" aria-label="Latest automatic monitoring receipt">
              <span>LATEST RECEIPT</span>
              <strong>{receipt}</strong>
            </div>
            {sourceUrl ? (
              <p className="monitoring-status__source">SOURCE · {latestRun?.cardSource ?? "UFC EVENT CARD"} · {sourceUrl}</p>
            ) : null}
            {pendingFindings.length === 0 ? (
              <div className="monitoring-status__all-clear" aria-label="Pending changes all clear">
                <span>ALL CLEAR</span>
                <strong>No event changes need your attention.</strong>
              </div>
            ) : null}
            <div className="monitoring-status__actions">
              <button className="primary-action" type="button" disabled={Boolean(busyAction)} onClick={runManualCheck}>
                {busyAction === "manual" ? "CHECKING NOW…" : "CHECK NOW"}
              </button>
              <button className="secondary-action" type="button" disabled={Boolean(busyAction)} onClick={() => void loadInbox()}>
                REFRESH STATUS
              </button>
              {sourceUrl ? (
                <a className="secondary-action" href={sourceUrl} target="_blank" rel="noreferrer">OPEN UFC EVENT SOURCE</a>
              ) : null}
            </div>
          </section>

          {!embedded && inbox.monitoredEvent ? (
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
          ) : null}

          {!embedded && !inbox.monitoredEvent ? (
            <section className="surface-card monitoring-inbox-state">
              <p className="eyebrow">NO CURRENT EVENT</p>
              <h2>Stage or publish the next UFC card.</h2>
              <Link className="primary-action" to="/picks/setup">OPEN EVENT SETUP</Link>
            </section>
          ) : null}

          {pendingFindings.length ? (
            <section className="monitoring-section" aria-labelledby="monitoring-findings-title">
              <div className="monitoring-section__heading">
                <div><p className="eyebrow">PENDING CHANGES</p><h2 id="monitoring-findings-title">Review only what changed</h2></div>
                <span>{pendingFindings.length}</span>
              </div>
              <p className="monitoring-section__note">
                Eligible pre-lock odds apply automatically. Supported event-card changes apply only after your confirmation; everything else remains review-only.
              </p>
              {pendingFindings.map((finding) => {
                const busy = busyAction === `finding:${finding.findingId}`;
                const automaticallyApplied = finding.sourceDetails.automatically_applied === true;
                return (
                  <article className={`surface-card monitoring-finding monitoring-finding--${finding.severity}`} key={finding.findingId}>
                    <div className="monitoring-finding__topline">
                      <span>{monitoringFindingTypeLabel(finding.findingType)}</span>
                      <small>{displayTime(finding.detectedAt)}</small>
                    </div>
                    <h3>{finding.summary}</h3>
                    {finding.matchupIdentity ? <p>{finding.matchupIdentity.replaceAll("|", " vs. ")}</p> : null}
                    <FindingEvidence finding={finding} />
                    {automaticallyApplied ? (
                      <p className="monitoring-section__note">ALREADY APPLIED AUTOMATICALLY</p>
                    ) : null}
                    {finding.approvalProposal?.action === "replace_fighter" ? (
                      <p className="monitoring-section__note">REPICK REQUIRED FOR AFFECTED MEMBERS</p>
                    ) : null}
                    <div className="monitoring-finding__actions">
                      {finding.approvalProposal ? (
                        <button type="button" disabled={Boolean(busyAction)} onClick={() => approveFinding(finding)}>
                          {busy ? "APPLYING…" : approvalLabel(finding)}
                        </button>
                      ) : (
                        <button type="button" disabled={Boolean(busyAction)} onClick={() => reviewFinding(finding, "reviewed")}>
                          {busy ? "SAVING…" : "MARK REVIEWED"}
                        </button>
                      )}
                      <button type="button" disabled={Boolean(busyAction)} onClick={() => reviewFinding(finding, "dismissed")}>DISMISS</button>
                    </div>
                  </article>
                );
              })}
            </section>
          ) : null}

          {error ? <p className="picks-error" role="status">{error}</p> : null}
        </>
      ) : null}
    </div>
  );
}
