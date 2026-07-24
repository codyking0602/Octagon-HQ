import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { allTime, getFighter } from "../rankings/rankingModel";
import {
  OCTAGON_VERDICT_URL,
  copyText,
  matchupPrompt,
  starterPrompts,
  whyPromptFor,
} from "./intelligence";

interface MatchupBuilderProps {
  initialFighterSlug?: string;
  expanded?: boolean;
}

function MatchupBuilder({ initialFighterSlug, expanded = false }: MatchupBuilderProps) {
  const firstDefault = initialFighterSlug || allTime[0]?.slug || "";
  const secondDefault = initialFighterSlug ? "" : allTime[1]?.slug || "";
  const [firstSlug, setFirstSlug] = useState(firstDefault);
  const [secondSlug, setSecondSlug] = useState(secondDefault);
  const [status, setStatus] = useState("");
  const secondSelectRef = useRef<HTMLSelectElement | null>(null);

  useEffect(() => {
    setFirstSlug(firstDefault);
    setSecondSlug(secondDefault);
    setStatus("");
  }, [firstDefault, secondDefault]);

  useEffect(() => {
    if (expanded && initialFighterSlug) secondSelectRef.current?.focus();
  }, [expanded, initialFighterSlug]);

  const first = getFighter(firstSlug);
  const second = getFighter(secondSlug);
  const prompt = first && second && first.slug !== second.slug
    ? matchupPrompt(first.name, second.name)
    : "";

  async function handleCopy() {
    const copied = await copyText(prompt);
    setStatus(copied ? "Matchup copied. Paste it into Octagon Verdict." : "Could not copy automatically. Press and hold the visible matchup text.");
  }

  function handleCopyAndOpen() {
    window.open(OCTAGON_VERDICT_URL, "_blank", "noopener,noreferrer");
    void copyText(prompt).then((copied) => {
      setStatus(copied ? "Matchup copied. Octagon Verdict opened in a new tab." : "Octagon Verdict opened. Copy the visible matchup text manually.");
    });
  }

  const content = (
    <div className="intelligence-matchup-body">
      <div className="intelligence-select-grid">
        <label>
          <span>First fighter</span>
          <select aria-label="First fighter" value={firstSlug} onChange={(event) => setFirstSlug(event.target.value)}>
            {allTime.map((fighter) => <option value={fighter.slug} key={fighter.slug}>{fighter.name}</option>)}
          </select>
        </label>
        <label>
          <span>Second fighter</span>
          <select ref={secondSelectRef} aria-label="Second fighter" value={secondSlug} onChange={(event) => setSecondSlug(event.target.value)}>
            <option value="" disabled>Choose opponent</option>
            {allTime.map((fighter) => <option value={fighter.slug} key={fighter.slug}>{fighter.name}</option>)}
          </select>
        </label>
      </div>
      <div className="intelligence-visible-prompt" aria-live="polite">
        {prompt || "Choose two different fighters to prepare the debate."}
      </div>
      <div className="intelligence-action-grid">
        <button className="intelligence-primary" type="button" disabled={!prompt} onClick={handleCopyAndOpen}>Copy &amp; Open Verdict</button>
        <button className="intelligence-secondary" type="button" disabled={!prompt} onClick={() => void handleCopy()}>Copy Matchup</button>
      </div>
      {status ? <p className="intelligence-status" role="status">{status}</p> : null}
    </div>
  );

  if (expanded) {
    return (
      <section className="surface-card intelligence-matchup-card intelligence-matchup-card--open" aria-labelledby="matchup-title">
        <div className="section-heading"><div><p className="eyebrow">FROM FIGHTER PROFILE</p><h1 id="matchup-title">Compare fighters</h1><p>{first ? `${first.name} is ready. Choose an opponent.` : "Choose two fighters."}</p></div></div>
        {content}
      </section>
    );
  }

  return (
    <details className="surface-card intelligence-matchup-card">
      <summary><span><strong>Quick matchup builder</strong><small>Choose two fighters, copy the debate, then open Octagon Verdict.</small></span><b aria-hidden="true">+</b></summary>
      {content}
    </details>
  );
}

function WhyContext({ fighterSlug, copiedFromSource }: { fighterSlug: string; copiedFromSource: boolean }) {
  const fighter = getFighter(fighterSlug);
  const [status, setStatus] = useState(copiedFromSource ? "Question copied. Paste it into Octagon Verdict." : "Question ready.");

  if (!fighter) return null;
  const prompt = whyPromptFor(fighter);

  async function handleCopy() {
    const copied = await copyText(prompt);
    setStatus(copied ? "Question copied. Paste it into Octagon Verdict." : "Could not copy automatically. Press and hold the visible question.");
  }

  function handleCopyAndOpen() {
    window.open(OCTAGON_VERDICT_URL, "_blank", "noopener,noreferrer");
    void copyText(prompt).then((copied) => setStatus(copied ? "Question copied. Octagon Verdict opened in a new tab." : "Octagon Verdict opened. Copy the visible question manually."));
  }

  return (
    <section className="surface-card intelligence-context-card" aria-labelledby="why-context-title">
      <p className="eyebrow">FROM FIGHTER PROFILE</p>
      <h1 id="why-context-title">Why {fighter.name} ranks here</h1>
      <div className="intelligence-visible-prompt">{prompt}</div>
      <div className="intelligence-action-grid">
        <button className="intelligence-primary" type="button" onClick={handleCopyAndOpen}>Copy &amp; Open Verdict</button>
        <button className="intelligence-secondary" type="button" onClick={() => void handleCopy()}>Copy Question</button>
      </div>
      <p className="intelligence-status" role="status">{status}</p>
    </section>
  );
}

export default function IntelligencePage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [showAll, setShowAll] = useState(false);
  const [promptStatus, setPromptStatus] = useState("");
  const mode = searchParams.get("mode");
  const fighterSlug = searchParams.get("fighter") || "";
  const copiedFromSource = Boolean((location.state as { copied?: boolean } | null)?.copied);
  const visiblePrompts = useMemo(() => starterPrompts.slice(0, showAll ? starterPrompts.length : 4), [showAll]);

  if (mode === "why" && fighterSlug) {
    return <div className="page intelligence-page intelligence-page--context"><WhyContext fighterSlug={fighterSlug} copiedFromSource={copiedFromSource} /></div>;
  }

  if (mode === "compare" && fighterSlug) {
    return <div className="page intelligence-page intelligence-page--context"><MatchupBuilder initialFighterSlug={fighterSlug} expanded /></div>;
  }

  async function copyStarter(prompt: string) {
    const copied = await copyText(prompt);
    setPromptStatus(copied ? "Question copied. Open Octagon Verdict when you’re ready." : "Could not copy automatically. Press and hold the question to copy it.");
  }

  return (
    <div className="page intelligence-page">
      <section className="intelligence-hero-card">
        <div className="intelligence-hero-art" aria-hidden="true"><span>Let’s talk.</span></div>
        <div className="intelligence-hero-copy">
          <p>Ask anything about rankings, scores, comparisons, future scenarios, or UFC debates.</p>
          <a className="intelligence-open-card" href={OCTAGON_VERDICT_URL} target="_blank" rel="noreferrer"><strong>Open Octagon Verdict</strong><span aria-hidden="true">↗</span></a>
        </div>
      </section>

      <section className="surface-card intelligence-prompts" aria-labelledby="try-asking-title">
        <div className="section-heading"><div><p className="eyebrow">TRY ASKING</p><h2 id="try-asking-title">Start a debate</h2></div></div>
        <div className="intelligence-prompt-list">
          {visiblePrompts.map((prompt) => (
            <button type="button" className="intelligence-prompt-row" key={prompt} onClick={() => void copyStarter(prompt)}>
              <span>{prompt}</span><b>Copy</b>
            </button>
          ))}
        </div>
        {!showAll ? <button className="intelligence-show-more" type="button" onClick={() => setShowAll(true)}>Show more questions</button> : null}
        {promptStatus ? <p className="intelligence-status" role="status">{promptStatus}</p> : null}
      </section>

      <MatchupBuilder />
    </div>
  );
}
