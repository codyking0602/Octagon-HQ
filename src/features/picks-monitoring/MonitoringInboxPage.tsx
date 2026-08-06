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
  type MonitoringRun,
} from "./monitoringInboxModel";
import {
  createMonitoringInboxRepository,
  type MonitoringInboxRepository,
} from "./monitoringInboxRepository";

function validTimestamp(value: string | null | undefined) {
  return Boolean(value && Number.isFinite(Date.parse(value)));
}

function displayTime(value: string | null | undefined) {
  if (!validTimestamp(value)) return "NOT YET";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value!));
}

function displayDate(value: string | null | undefined) {
  if (!validTimestamp(value)) return "UNKNOWN";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value!));
}

function nextSchedulerWake(schedule: string | null, generatedAt: string) {
  const match = schedule?.trim().match(/^(\d{1,2}) \* \* \* \*$/);
  if (!match || !validTimestamp(generatedAt)) return null;
  const minute = Number(match[1]);
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) return null;
  const next = new Date(generatedAt);
  next.setUTCSeconds(0, 0);
  next.setUTCMinutes(minute);
  if (next.getTime() <= Date.parse(generatedAt)) next.setUTCHours(next.getUTCHours() + 1);
  return next.toISOString();
}

function monthlyResetDate(reference: string) {
  const date = validTimestamp(reference) ? new Date(reference) : new Date();
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1)).toISOString();
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
  return "value";
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

function providerWasCalled(run: MonitoringRun | null | undefined) {
  return Boolean(run && (
    run.oddsProvider
    || run.providerRequestsUsed !== null
    || run.providerLastRequestCost !== null
    || run.providerEventCount > 0
  ));
}

function uniqueRuns(latestRun: MonitoringRun | null, recentRuns: MonitoringRun[]) {
  const runs = new Map<string, MonitoringRun>();
  if (latestRun) runs.set(latestRun.runId, latestRun);
  recentRuns.forEach((run) => {
    if (!runs.has(run.runId)) runs.set(run.runId, run);
  });
  return [...runs.values()].sort((left, right) => (
    Date.parse(right.completedAt ?? right.startedAt) - Date.parse(left.completedAt ?? left.startedAt)
  ));
}

function runFailureDetail(run: MonitoringRun | null, findings: MonitoringFinding[]) {
  if (!run) return "NONE RECORDED";
  const providerFinding = findings.find((finding) => (
    finding.runId === run.runId && finding.findingType === "provider_error"
  ));
  if (providerFinding) return `${displayTime(providerFinding.detectedAt)} · ${providerFinding.summary}`;
  const diagnostic = run.diagnostics.find((value) => typeof value === "string" && value.trim());
  if (typeof diagnostic === "string") {
    return `${displayTime(run.completedAt ?? run.startedAt)} · ${diagnostic}`;
  }
  return `${displayTime(run.completedAt ?? run.startedAt)} · Provider call failed.`;
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
      ? "This explicitly requested check will use one provider request."
      : `This explicitly requested check will use one provider request. ${remaining} requests remaining after the last provider call.`;
    if (!window.confirm(`Run the complete UFC card and odds monitoring operation now? ${quotaNote}`)) return;
    void runAction("manual", repository.runManualCheck);
  }

  function approveFinding(finding: MonitoringFinding) {
    if (!repository?.approveFinding || !finding.approvalProposal) return;
    const reason = window.prompt("Why are you approving this detected UFC card change?")?.trim();
    if (!reason) return;
    if (reason.length < 3) {
      setError("Approval requires a reason of at least 3 characters.");
      return;
    }
    if (!window.confirm(
      `Approve and apply this detected change?\n\n${finding.summary}\n\nThe backend will reject it if the live card changed since this check.`,
    )) return;
    void runAction(
      `finding:${finding.findingId}`,
      () => repository.approveFinding!(finding.findingId, reason),
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
    ? "Automatic monitoring is not fully configured. Run a check now and review the result."
    : scheduledFailure
      ? decision?.providerCalled
        ? `The scheduled provider check failed ${displayTime(decision.attemptedAt)}.`
        : `Auto-sync failed before a provider call ${displayTime(decision?.attemptedAt)}.`
      : partialCoverage
        ? `The scheduled provider check at ${displayTime(decision?.attemptedAt)} returned partial coverage.`
        : scheduledProviderWorked
          ? `Last scheduled provider check ${displayTime(decision?.attemptedAt)}.`
          : `Auto-sync reviewed its schedule ${displayTime(inbox?.scheduler.lastWakeStartedAt)}, but ${skippedReason}.`;

  const pendingFindings = inbox?.newFindings.filter((finding) => !isEquivalentFinding(finding)) ?? [];
  const allFindings = [...(inbox?.newFindings ?? []), ...(inbox?.reviewedFindings ?? [])]
    .filter((finding, index, findings) => findings.findIndex((item) => item.findingId === finding.findingId) === index);
  const runs = inbox ? uniqueRuns(inbox.latestRun, inbox.recentRuns) : [];
  const latestRun = inbox?.latestRun ?? null;
  const latestRunFindings = latestRun ? allFindings.filter((finding) => finding.runId === latestRun.runId) : [];
  const latestCardCheck = runs.find((run) => Boolean(run.cardSource || run.cardSourceUrl)) ?? null;
  const latestProviderCall = runs.find(providerWasCalled) ?? null;
  const lastSuccessfulProviderCall = runs.find((run) => (
    providerWasCalled(run) && (run.status === "completed" || run.status === "partial")
  )) ?? null;
  const lastProviderFailure = runs.find((run) => providerWasCalled(run) && run.status === "failed") ?? null;
  const coverageMatched = latestRun?.completeSnapshotCount ?? 0;
  const coverageMissing = latestRun?.missingSnapshotCount ?? 0;
  const coverageTotal = coverageMatched + coverageMissing;
  const oddsUpdated = latestRunFindings.filter((finding) => (
    (finding.findingType === "odds_available" || finding.findingType === "odds_change")
    && finding.sourceDetails.automatically_applied === true
  )).length;
  const oddsUnchanged = Math.max(0, coverageMatched - oddsUpdated);
  const unmatched = latestRunFindings.filter((finding) => finding.findingType === "unmatched_fight").length;
  const cardChanges = latestRunFindings.filter((finding) => finding.findingType === "card_change").length;
  const providerFailures = latestRunFindings.filter((finding) => finding.findingType === "provider_error");
  const sourceFailures = latestRun?.status === "failed" && !providerWasCalled(latestRun);
  const schedulerWake = inbox ? nextSchedulerWake(inbox.scheduler.schedule, inbox.generatedAt) : null;
  const nextProviderCall = inbox?.scheduleState?.nextEligibleAt ?? null;
  const nextWakeConsumesRequest = Boolean(
    schedulerWake && nextProviderCall && Date.parse(nextProviderCall) <= Date.parse(schedulerWake),
  );
  const quotaUsed = latestProviderCall?.providerRequestsUsed ?? null;
  const quotaRemaining = latestProviderCall?.providerRequestsRemaining ?? null;
  const quotaReset = monthlyResetDate(
    latestProviderCall?.completedAt ?? latestProviderCall?.startedAt ?? inbox?.generatedAt ?? "",
  );
  const monitoredSource = latestCardCheck?.cardSource ?? "NOT RECORDED";
  const sourceUrl = latestCardCheck?.cardSourceUrl ?? null;
  const latestRunAt = latestRun?.completedAt ?? latestRun?.startedAt ?? null;
  const latestProviderCalled = providerWasCalled(latestRun);
  const latestOutcome = latestRun?.status === "completed"
    ? "checked successfully"
    : latestRun?.status === "partial"
      ? "completed with partial coverage"
      : latestRun?.status === "failed"
        ? "failed"
        : "has not run";
  const latestReceipt = latestRun
    ? [
        `${displayTime(latestRunAt)} — UFC card ${latestOutcome}.`,
        latestProviderCalled ? "Odds provider called." : "Odds provider not called.",
        latestProviderCalled
          ? `${coverageMatched}/${coverageTotal || inbox?.monitoredEvent?.boutCount || 0} fights matched, ${oddsUpdated} odds updated, ${oddsUnchanged} unchanged, ${unmatched} unmatched.`
          : null,
        `${cardChanges} card ${cardChanges === 1 ? "change" : "changes"} found.`,
        quotaRemaining === null ? null : `${quotaRemaining} monthly requests remain.`,
      ].filter(Boolean).join(" ")
    : "No authoritative monitoring execution receipt has been recorded yet.";
  const unmatchedWarning = unmatched === 1
    ? "1 monitored fight is unmatched and needs review."
    : `${unmatched} monitored fights are unmatched and need review.`;

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
              <span>{schedulerReady ? "ENABLED" : "DISABLED"}</span>
            </div>
            <p>{automationDetail}</p>

            <div className="monitoring-status__grid" aria-label="Automation status">
              <div><span>NEXT SCHEDULER WAKE</span><strong>{displayTime(schedulerWake)}</strong></div>
              <div><span>NEXT PROVIDER CALL</span><strong>{displayTime(nextProviderCall)}</strong></div>
              <div><span>LAST SCHEDULER WAKE</span><strong>{displayTime(inbox.scheduler.lastWakeStartedAt)}</strong><small>{inbox.scheduler.lastWakeStatus ?? "NO STATUS"}</small></div>
              <div><span>LAST UFC CARD CHECK</span><strong>{displayTime(latestCardCheck?.completedAt ?? latestCardCheck?.startedAt)}</strong></div>
              <div><span>LAST ODDS CHECK</span><strong>{displayTime(latestProviderCall?.completedAt ?? latestProviderCall?.startedAt)}</strong></div>
              <div><span>LAST SUCCESSFUL PROVIDER CALL</span><strong>{displayTime(lastSuccessfulProviderCall?.completedAt ?? lastSuccessfulProviderCall?.startedAt)}</strong></div>
              <div><span>LAST PROVIDER FAILURE</span><strong>{runFailureDetail(lastProviderFailure, allFindings)}</strong></div>
              <div><span>MONITORED UFC EVENT</span><strong>{inbox.monitoredEvent ? `${inbox.monitoredEvent.name} · ${inbox.monitoredEvent.subtitle}` : "NONE"}</strong></div>
              <div><span>EXACT UFC EVENT SOURCE</span><strong>{monitoredSource}</strong></div>
              <div><span>FIGHT MATCHING</span><strong>{latestProviderCalled ? `${coverageMatched} OF ${coverageTotal || inbox.monitoredEvent?.boutCount || 0} MATCHED` : "PROVIDER NOT CALLED"}</strong></div>
              <div><span>ODDS APPLICATION</span><strong>{latestProviderCalled ? `${oddsUpdated} UPDATED · ${oddsUnchanged} UNCHANGED · ${unmatched} UNMATCHED` : "PROVIDER NOT CALLED"}</strong></div>
              <div><span>CARD COMPARISON</span><strong>{cardChanges ? `${cardChanges} NEED CONFIRMATION` : latestRun ? "0 CHANGES FOUND" : "NOT CHECKED"}</strong></div>
              <div><span>OWNER FINDINGS</span><strong>{pendingFindings.length}</strong></div>
              <div><span>MONTHLY REQUESTS USED</span><strong>{quotaUsed ?? "UNKNOWN"}</strong></div>
              <div><span>MONTHLY REQUESTS REMAINING</span><strong>{quotaRemaining ?? "UNKNOWN"}</strong></div>
              <div><span>MONTHLY RESET</span><strong>{displayDate(quotaReset)}</strong></div>
              <div><span>NEXT WAKE USES REQUEST</span><strong>{nextWakeConsumesRequest ? "YES" : "NO"}</strong><small>CHECK NOW ALWAYS USES 1</small></div>
            </div>

            <div className="monitoring-status__all-clear" aria-label="Latest automatic monitoring receipt">
              <span>LATEST RECEIPT</span>
              <strong>{latestReceipt}</strong>
            </div>

            {sourceUrl ? <small>UFC EVENT SOURCE · {sourceUrl}</small> : null}
            {sourceFailures ? <p className="picks-error" role="status">The UFC event source failed before an odds-provider call.</p> : null}
            {providerFailures.map((finding) => (
              <p className="picks-error" role="status" key={finding.findingId}>{finding.summary}</p>
            ))}
            {unmatched ? <p className="picks-error" role="status">{unmatchedWarning}</p> : null}
            {quotaRemaining === 0 ? <p className="picks-error" role="status">The monthly provider quota is exhausted.</p> : null}
            {!inbox.scheduler.tokenConfigured ? <p className="picks-error" role="status">The scheduler credential is missing or stale.</p> : null}

            {pendingFindings.length === 0 ? (
              <div className="monitoring-status__all-clear" aria-label="Pending changes all clear">
                <span>OWNER REVIEW</span>
                <strong>No event changes need your attention. No current card changes need confirmation.</strong>
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
                Eligible pre-lock odds apply automatically. Supported event-card changes apply only after your explicit approval; everything else remains review-only.
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
                          {busy ? "APPLYING…" : "APPROVE CHANGE"}
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
