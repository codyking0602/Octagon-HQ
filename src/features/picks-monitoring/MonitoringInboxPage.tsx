import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/picks-monitoring-decisions.css";
import { useIdentity } from "../identity/IdentityProvider";
import {
  compactMonitoringValue,
  monitoringValuesEquivalent,
} from "./monitoringChangeValues";
import {
  monitoringDecisionPresentation,
  type MonitoringDecisionPresentation,
} from "./monitoringDecisionPresentation";
import {
  monitoringFindingTypeLabel,
  type MonitoringFinding,
  type MonitoringInbox,
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

function DecisionComparison({ presentation }: { presentation: MonitoringDecisionPresentation }) {
  return (
    <div className="monitoring-decision__comparison" aria-label={`${presentation.currentValue} changes to ${presentation.proposedValue}`}>
      <div>
        <span>CURRENT</span>
        <strong>{presentation.currentValue}</strong>
      </div>
      <b aria-hidden="true">→</b>
      <div>
        <span>UFC SOURCE</span>
        <strong>{presentation.proposedValue}</strong>
      </div>
    </div>
  );
}

function DecisionImpacts({ presentation }: { presentation: MonitoringDecisionPresentation }) {
  return (
    <div className="monitoring-decision__impacts" aria-label="Expected change impact">
      {presentation.impacts.map((impact) => (
        <div className={impact.affected ? "is-affected" : ""} key={impact.label}>
          <span>{impact.label}</span>
          <strong>{impact.value}</strong>
        </div>
      ))}
    </div>
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

interface DecisionReceipt {
  title: string;
  summary: string;
  detail: string;
  kind: "applied" | "kept" | "dismissed";
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
  const [inbox, setInbox] = useState<MonitoringInbox | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [confirmingFindingId, setConfirmingFindingId] = useState<string | null>(null);
  const [impactAcknowledged, setImpactAcknowledged] = useState(false);
  const [decisionReceipt, setDecisionReceipt] = useState<DecisionReceipt | null>(null);

  const loadInbox = useCallback(async () => {
    if (!repository || !identity.profile) return null;
    setLoading(true);
    try {
      const nextInbox = await repository.loadInbox();
      setInbox(nextInbox);
      setError("");
      return nextInbox;
    } catch (nextError) {
      setError(readableError(nextError));
      return null;
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
    setDecisionReceipt(null);
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
      ? "This explicitly requested check will use one provider request."
      : `This explicitly requested check will use one provider request. ${remaining} requests remaining after the last provider call.`;
    if (!window.confirm(`Run the complete UFC card and odds monitoring operation now? ${quotaNote}`)) return;
    void runAction("manual", repository.runManualCheck);
  }

  function beginConfirmation(finding: MonitoringFinding) {
    setConfirmingFindingId(finding.findingId);
    setImpactAcknowledged(false);
    setDecisionReceipt(null);
    setError("");
  }

  async function applyConfirmedFinding(
    finding: MonitoringFinding,
    presentation: MonitoringDecisionPresentation,
  ) {
    if (!repository?.approveFinding) return;
    const key = `finding:${finding.findingId}`;
    setBusyAction(key);
    setError("");
    setDecisionReceipt(null);
    try {
      await repository.approveFinding(finding.findingId, presentation.auditReason);
      const refreshed = await loadInbox();
      if (!refreshed || refreshed.newFindings.some((item) => item.findingId === finding.findingId)) {
        throw new Error("The change did not clear from persisted monitoring state. Refresh status before trying again.");
      }
      const remaining = refreshed.newFindings.filter((item) => !isEquivalentFinding(item)).length;
      await onAppliedChange?.();
      setDecisionReceipt({
        kind: "applied",
        title: "CHANGE APPLIED",
        summary: `${presentation.fieldLabel}: ${presentation.currentValue} → ${presentation.proposedValue}.`,
        detail: `${presentation.playerResult} ${remaining} owner ${remaining === 1 ? "finding remains" : "findings remain"}.`,
      });
      setConfirmingFindingId(null);
      setImpactAcknowledged(false);
    } catch (nextError) {
      setError(readableError(nextError));
    } finally {
      setBusyAction("");
    }
  }

  async function keepCurrentFinding(
    finding: MonitoringFinding,
    presentation: MonitoringDecisionPresentation,
  ) {
    if (!repository) return;
    const key = `finding:${finding.findingId}`;
    setBusyAction(key);
    setError("");
    setDecisionReceipt(null);
    try {
      await repository.reviewFinding(finding.findingId, "reviewed");
      const refreshed = await loadInbox();
      if (!refreshed || refreshed.newFindings.some((item) => item.findingId === finding.findingId)) {
        throw new Error("The decision did not clear from persisted monitoring state. Refresh status before trying again.");
      }
      const remaining = refreshed.newFindings.filter((item) => !isEquivalentFinding(item)).length;
      setDecisionReceipt({
        kind: "kept",
        title: "CURRENT VALUE KEPT",
        summary: `${presentation.fieldLabel}: ${presentation.currentValue}. The UFC-source value was not applied.`,
        detail: `No live Picks mutation occurred. ${remaining} owner ${remaining === 1 ? "finding remains" : "findings remain"}.`,
      });
      setConfirmingFindingId(null);
      setImpactAcknowledged(false);
    } catch (nextError) {
      setError(readableError(nextError));
    } finally {
      setBusyAction("");
    }
  }

  async function dismissFinding(finding: MonitoringFinding) {
    if (!repository) return;
    const key = `finding:${finding.findingId}`;
    const automaticallyApplied = finding.sourceDetails.automatically_applied === true;
    setBusyAction(key);
    setError("");
    setDecisionReceipt(null);
    try {
      await repository.reviewFinding(finding.findingId, "dismissed");
      const refreshed = await loadInbox();
      if (!refreshed || refreshed.newFindings.some((item) => item.findingId === finding.findingId)) {
        throw new Error("The notice did not clear from persisted monitoring state. Refresh status before trying again.");
      }
      const remaining = refreshed.newFindings.filter((item) => !isEquivalentFinding(item)).length;
      setDecisionReceipt({
        kind: "dismissed",
        title: automaticallyApplied ? "AUTOMATIC ODDS RECEIPT DISMISSED" : "NOTICE DISMISSED",
        summary: finding.summary,
        detail: `No owner-applied live event change occurred. ${remaining} owner ${remaining === 1 ? "finding remains" : "findings remain"}.`,
      });
    } catch (nextError) {
      setError(readableError(nextError));
    } finally {
      setBusyAction("");
    }
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
  const ownerDecisions = pendingFindings.filter((finding) => Boolean(finding.approvalProposal));
  const reviewOnlyFindings = pendingFindings.filter((finding) => !finding.approvalProposal);
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
  const eventLabel = inbox?.monitoredEvent
    ? `${inbox.monitoredEvent.name} · ${inbox.monitoredEvent.subtitle}`
    : "NO MONITORED EVENT";

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
          <section className={`surface-card monitoring-status monitoring-status--compact${automationNeedsAttention ? " is-paused" : " is-active"}`}>
            <div className="monitoring-status__topline">
              <div>
                <p className="eyebrow">AUTOMATION · {eventLabel}</p>
                <h2>{automationTitle}</h2>
              </div>
              <span>{schedulerReady ? "ENABLED" : "DISABLED"}</span>
            </div>
            <p>{automationDetail}</p>
            <div className="monitoring-summary" aria-label="Owner monitoring summary">
              <div><span>CURRENT EVENT</span><strong>{eventLabel}</strong></div>
              <div><span>OWNER DECISIONS</span><strong>{ownerDecisions.length}</strong></div>
              <div><span>NEXT WAKE</span><strong>{displayTime(schedulerWake)}</strong></div>
              <div><span>NEXT PROVIDER CALL</span><strong>{displayTime(nextProviderCall)}</strong></div>
            </div>
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

          {decisionReceipt ? (
            <section className={`surface-card monitoring-decision-receipt is-${decisionReceipt.kind}`} aria-live="polite" aria-label="Owner decision receipt">
              <span>OWNER DECISION RECEIPT</span>
              <h2>{decisionReceipt.title}</h2>
              <strong>{decisionReceipt.summary}</strong>
              <p>{decisionReceipt.detail}</p>
            </section>
          ) : null}

          {ownerDecisions.length ? (
            <section className="monitoring-section monitoring-decisions" aria-labelledby="monitoring-decisions-title">
              <div className="monitoring-section__heading">
                <div><p className="eyebrow">PENDING OWNER DECISIONS</p><h2 id="monitoring-decisions-title">One finding, one clear decision</h2></div>
                <span>{ownerDecisions.length}</span>
              </div>
              <p className="monitoring-section__note">
                Eligible pre-lock odds continue to apply automatically. These UFC card changes use the existing owner-approved mutation path only after final confirmation.
              </p>
              {ownerDecisions.map((finding) => {
                const presentation = monitoringDecisionPresentation(finding);
                if (!presentation) return null;
                const busy = busyAction === `finding:${finding.findingId}`;
                const confirming = confirmingFindingId === finding.findingId;
                const finalDisabled = Boolean(busyAction)
                  || (presentation.requiresAcknowledgment && !impactAcknowledged);
                return (
                  <article className="surface-card monitoring-finding monitoring-finding--warning monitoring-decision" key={finding.findingId}>
                    <div className="monitoring-finding__topline">
                      <span>OWNER DECISION · {presentation.fieldLabel}</span>
                      <small>{displayTime(finding.detectedAt)}</small>
                    </div>
                    <h3>{finding.summary}</h3>
                    <p>{presentation.subject}</p>
                    <DecisionComparison presentation={presentation} />
                    <div className="monitoring-decision__result">
                      <span>CONFIRMING WILL</span>
                      <strong>{presentation.consequence}</strong>
                      <p>{presentation.playerResult}</p>
                    </div>
                    <DecisionImpacts presentation={presentation} />

                    {!confirming ? (
                      <div className="monitoring-finding__actions">
                        <button className="monitoring-confirm-action" type="button" disabled={Boolean(busyAction)} onClick={() => beginConfirmation(finding)}>
                          CONFIRM CHANGE
                        </button>
                        <button type="button" disabled={Boolean(busyAction)} onClick={() => void keepCurrentFinding(finding, presentation)}>
                          {busy ? "SAVING…" : "KEEP CURRENT"}
                        </button>
                      </div>
                    ) : (
                      <div className="monitoring-confirmation" role="group" aria-label={`Confirm ${finding.summary}`}>
                        <div>
                          <span>FINAL CONFIRMATION</span>
                          <h4>Confirm this change</h4>
                        </div>
                        <dl>
                          <div><dt>EVENT</dt><dd>{eventLabel}</dd></div>
                          <div><dt>FIGHT / FIELD</dt><dd>{presentation.subject} · {presentation.fieldLabel}</dd></div>
                          <div><dt>CURRENT</dt><dd>{presentation.currentValue}</dd></div>
                          <div><dt>NEW</dt><dd>{presentation.proposedValue}</dd></div>
                          <div><dt>EXPECTED RESULT</dt><dd>{presentation.consequence}</dd></div>
                          <div><dt>PLAYER PICKS</dt><dd>{presentation.playerResult}</dd></div>
                          <div><dt>AUDIT NOTE</dt><dd>{presentation.auditReason}</dd></div>
                        </dl>
                        {presentation.requiresAcknowledgment ? (
                          <label className="monitoring-confirmation__acknowledgment">
                            <input
                              type="checkbox"
                              checked={impactAcknowledged}
                              onChange={(event) => setImpactAcknowledged(event.currentTarget.checked)}
                            />
                            <span>I understand the player or card impact shown above.</span>
                          </label>
                        ) : null}
                        <div className="monitoring-confirmation__actions">
                          <button
                            className="primary-action"
                            type="button"
                            disabled={finalDisabled}
                            onClick={() => void applyConfirmedFinding(finding, presentation)}
                          >
                            {busy ? "APPLYING…" : "APPLY CONFIRMED CHANGE"}
                          </button>
                          <button
                            className="secondary-action"
                            type="button"
                            disabled={Boolean(busyAction)}
                            onClick={() => {
                              setConfirmingFindingId(null);
                              setImpactAcknowledged(false);
                            }}
                          >
                            CANCEL
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </section>
          ) : null}

          {reviewOnlyFindings.length ? (
            <section className="monitoring-section monitoring-notices" aria-labelledby="monitoring-notices-title">
              <div className="monitoring-section__heading">
                <div><p className="eyebrow">OPERATIONAL NOTICES</p><h2 id="monitoring-notices-title">Review-only monitoring receipts</h2></div>
                <span>{reviewOnlyFindings.length}</span>
              </div>
              <p className="monitoring-section__note">
                These findings do not have a supported live-card repair action. Dismissing one records the review without implying a backend fix.
              </p>
              {reviewOnlyFindings.map((finding) => {
                const busy = busyAction === `finding:${finding.findingId}`;
                const automaticallyApplied = finding.sourceDetails.automatically_applied === true;
                return (
                  <article className={`surface-card monitoring-finding monitoring-finding--${finding.severity}`} key={finding.findingId}>
                    <div className="monitoring-finding__topline">
                      <span>{automaticallyApplied ? "AUTOMATIC ODDS RECEIPT" : monitoringFindingTypeLabel(finding.findingType)}</span>
                      <small>{displayTime(finding.detectedAt)}</small>
                    </div>
                    <h3>{finding.summary}</h3>
                    {finding.matchupIdentity ? <p>{finding.matchupIdentity.replaceAll("|", " vs. ")}</p> : null}
                    <FindingEvidence finding={finding} />
                    {automaticallyApplied ? (
                      <p className="monitoring-section__note">ALREADY APPLIED AUTOMATICALLY · NO OWNER CONFIRMATION REQUIRED</p>
                    ) : (
                      <p className="monitoring-section__note">REVIEW ONLY · NO LIVE APPLICATION CONTROL EXISTS</p>
                    )}
                    <div className="monitoring-finding__actions monitoring-finding__actions--single">
                      <button type="button" disabled={Boolean(busyAction)} onClick={() => void dismissFinding(finding)}>
                        {busy ? "SAVING…" : automaticallyApplied ? "DISMISS RECEIPT" : "DISMISS NOTICE"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>
          ) : null}

          {!embedded && !inbox.monitoredEvent ? (
            <section className="surface-card monitoring-inbox-state">
              <p className="eyebrow">NO CURRENT EVENT</p>
              <h2>Stage or publish the next UFC card.</h2>
              <Link className="primary-action" to="/picks/setup">OPEN EVENT SETUP</Link>
            </section>
          ) : null}

          <details className="surface-card monitoring-operations">
            <summary>
              <div><span>AUTOMATION DETAILS</span><strong>Source, coverage, quota, and receipts</strong></div>
              <small>OPEN</small>
            </summary>
            <div className="monitoring-operations__body">
              <div className="monitoring-status__grid" aria-label="Automation status">
                <div><span>NEXT SCHEDULER WAKE</span><strong>{displayTime(schedulerWake)}</strong></div>
                <div><span>NEXT PROVIDER CALL</span><strong>{displayTime(nextProviderCall)}</strong></div>
                <div><span>LAST SCHEDULER WAKE</span><strong>{displayTime(inbox.scheduler.lastWakeStartedAt)}</strong><small>{inbox.scheduler.lastWakeStatus ?? "NO STATUS"}</small></div>
                <div><span>LAST UFC CARD CHECK</span><strong>{displayTime(latestCardCheck?.completedAt ?? latestCardCheck?.startedAt)}</strong></div>
                <div><span>LAST ODDS CHECK</span><strong>{displayTime(latestProviderCall?.completedAt ?? latestProviderCall?.startedAt)}</strong></div>
                <div><span>LAST SUCCESSFUL PROVIDER CALL</span><strong>{displayTime(lastSuccessfulProviderCall?.completedAt ?? lastSuccessfulProviderCall?.startedAt)}</strong></div>
                <div><span>LAST PROVIDER FAILURE</span><strong>{runFailureDetail(lastProviderFailure, allFindings)}</strong></div>
                <div><span>MONITORED UFC EVENT</span><strong>{eventLabel}</strong></div>
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
            </div>
          </details>

          {error ? <p className="picks-error" role="status">{error}</p> : null}
        </>
      ) : null}
    </div>
  );
}
