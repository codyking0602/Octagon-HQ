import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { copyText, whyPromptFor } from "../intelligence/intelligence";
import { FighterPhoto } from "./FighterPhoto";
import { getFighter } from "./rankingModel";
import { resolveProfileWatchAction } from "./rankingPresentation";
import { profileCategoryRows, profileDisplayName } from "./profilePresentation";

export function shareProfile(name: string, slug: string) {
  const path = `/fighters/${slug}`;
  const url = typeof window === "undefined" ? path : new URL(path, window.location.origin).toString();
  if (typeof navigator !== "undefined" && navigator.share) {
    void navigator.share({ title: `${name} · Octagon HQ`, url });
    return;
  }
  if (typeof navigator !== "undefined" && navigator.clipboard) void navigator.clipboard.writeText(url);
}

export function normalizeResumeCopy(copy: string) {
  return copy.replace(/r\u00e9sum\u00e9/gi, "resume");
}

export function profileCopy(copy: string, rank: number) {
  const token = "__PROFILE_RANK__";
  return normalizeResumeCopy(copy)
    .replace(/#\{rank\}/g, token)
    .replace(/\{rank\}/g, token)
    .replace(/\branks #\d+ because\b/gi, "ranks here because")
    .replace(/\branked #\d+ because\b/gi, "ranked here because")
    .replace(/\bsits at #\d+\b/gi, "sits here")
    .replace(/\bsits #\d+\b/gi, "sits here")
    .replace(/\bthe #\d+ fighter\b/gi, "this fighter")
    .replace(/\bcurrently #\d+\b/gi, "currently here")
    .replace(/\bat #\d+\b/gi, "here")
    .replace(/\bnumber \d+\b/gi, "this spot")
    .replace(/\bNo\. \d+\b/g, "this spot")
    .replace(new RegExp(token, "g"), `#${rank}`);
}

export function whyNotProfileCopy(fighter: { rank: number; slug: string; whyNotHigher?: string }) {
  if (fighter.rank !== 1) return fighter.whyNotHigher ?? "";
  if (fighter.slug === "jon-jones") {
    return "He cannot rank higher. The argument against a runaway #1 case is based on close fights, inactivity, heavyweight sample size, and outside-the-cage controversy—not a stronger UFC resume above him.";
  }
  return fighter.whyNotHigher || "They cannot rank higher on this board. The debate is whether the gap over the fighters below is large enough, not whether a stronger UFC resume currently sits above them.";
}

export default function FighterProfilePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const fighter = getFighter(slug);
  const [activeCategory, setActiveCategory] = useState<string | null>("championship");
  const categories = useMemo(() => (fighter ? profileCategoryRows(fighter) : []), [fighter]);

  if (!fighter) {
    return (
      <div className="page">
        <section className="surface-card empty-state">
          <h1>Fighter not found</h1>
          <Link className="primary-action" to="/rankings">Back to rankings</Link>
        </section>
      </div>
    );
  }

  const displayName = profileDisplayName(fighter);
  const active = categories.find((category) => category.key === activeCategory) ?? categories[0];
  const watchAction = resolveProfileWatchAction(fighter.slug);
  const whyNotHeading = fighter.rank === 1 ? "Why Not Lower?" : "Why Not Ranked Higher?";
  const whyNotCopy = whyNotProfileCopy(fighter);

  function openComparison() {
    if (!fighter) return;
    navigate(`/intelligence?mode=compare&fighter=${fighter.slug}`);
  }

  async function askWhy() {
    if (!fighter) return;
    const copied = await copyText(whyPromptFor(fighter));
    navigate(`/intelligence?mode=why&fighter=${fighter.slug}`, { state: { copied } });
  }

  return (
    <div className="page fighter-profile-page v1-profile">
      <div className="profile-toolbar">
        <Link className="back-link" to="/rankings">‹ Back to Rankings</Link>
      </div>

      <section className="profile-photo-card" aria-label={`${fighter.name} photo`}>
        <FighterPhoto name={fighter.name} src={fighter.profileUrl} className="profile-photo-card__image" />
        <span className="profile-photo-card__ovr" data-testid="photo-ovr-badge"><strong>{fighter.ovr}</strong><small>OVR</small></span>
      </section>

      <section className="profile-summary" aria-label="Fighter summary">
        <div className="profile-pills">
          <span>#{fighter.rank} UFC All-Time</span>
          <span>{fighter.division}</span>
        </div>
        <h1>{displayName}</h1>
        <p>{profileCopy(fighter.oneLiner, fighter.rank)}</p>
      </section>

      <section className="profile-actions" aria-label="Profile actions">
        <button type="button" onClick={openComparison}>Compare</button>
        <button type="button" onClick={() => void askWhy()}>Ask Why</button>
        {watchAction ? <a href={watchAction.url} target="_blank" rel="noreferrer" aria-label={watchAction.label}>Watch Fight</a> : null}
        <button type="button" onClick={() => shareProfile(fighter.name, fighter.slug)}><svg className="profile-action-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4m0 0 5 5m-5-5-5 5"/><path d="M5 12v7h14v-7"/></svg>Share</button>
      </section>

      <section className="surface-card resume-snapshot" aria-labelledby="resume-title">
        <h2 id="resume-title">Resume Snapshot</h2>
        <div className="resume-grid">
          {[
            [fighter.visibleStats.ufcRecord, "UFC Record"],
            [fighter.longestUfcWinStreak, "Longest UFC Win Streak"],
            [fighter.visibleStats.titleFightWins, "UFC Title-Fight Wins"],
            [fighter.visibleStats.topFiveWins, "Top-5 Wins"],
            [`${fighter.visibleStats.finishRatePct.toFixed(1)}%`, "Finish Rate"],
            [fighter.visibleStats.primeRecord, "Prime UFC Record"],
            [`${fighter.visibleStats.roundsWonPct.toFixed(1)}%`, "Rounds Won"],
            [fighter.visibleStats.activeEliteYears.toFixed(1), "Active Elite Years"],
          ].map(([value, label]) => <div className="resume-tile" key={label}><strong>{value}</strong><span>{label}</span></div>)}
        </div>
      </section>

      <section className="surface-card category-breakdown" aria-labelledby="category-title">
        <div className="section-heading"><div><h2 id="category-title">Category Breakdown</h2><p>Tap any category to see what it means, what evidence matters, and why this fighter lands there.</p></div></div>
        <div className="profile-category-grid">
          {categories.map((category) => <button className={`profile-category-card tier-${category.tier.toLowerCase()} ${active.key === category.key ? "is-active" : ""}`} key={category.key} type="button" onClick={() => setActiveCategory(category.key)}>
            <span className="profile-category-card__name">{category.label}</span>
            <span className="profile-category-card__rating"><strong>{category.rating}</strong><small>Rating</small></span>
            <span className="profile-category-card__rank">#{category.rank} in category</span>
            <span className="profile-category-card__description">{category.description}</span>
            <span className="profile-category-card__tier">{category.tier}</span>
            <span className="profile-category-card__meter" aria-label={`${category.label} bar ${category.barFillPercent}%`}><span style={{ width: `${category.barFillPercent}%` }} /></span>
          </button>)}
        </div>
        <div className="category-expanded" data-testid="category-expanded">
          <div><span className={`profile-category-card__tier tier-${active.tier.toLowerCase()}`}>{active.tier}</span><strong>#{active.rank} category rank</strong></div>
          <h3>{active.label} · {active.rating} Rating</h3>
          <h4>What it means</h4>
          <p>{active.whatItMeans}</p>
          <div className="evidence-grid">{active.evidence.map(([label, value]) => <div data-testid="evidence-tile" key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
        </div>
      </section>

      <section className="surface-card profile-copy-card" aria-labelledby="why-ranked-here">
        <h2 id="why-ranked-here">Why Ranked Here</h2>
        <p>{profileCopy(fighter.whyRankedHere, fighter.rank)}</p>
      </section>

      <section className="surface-card profile-copy-card profile-copy-card--penalty">
        <h2>{whyNotHeading}</h2>
        <p>{profileCopy(whyNotCopy, fighter.rank)}</p>
      </section>
    </div>
  );
}
