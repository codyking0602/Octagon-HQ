import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FighterPhoto } from "./FighterPhoto";
import { abbreviateDivisionLabel, categoryDisplayRating } from "./rankingDisplay";
import {
  categoryBoard,
  rankingCategoryOptions,
  type CategoryGender,
  type RankingCategory,
} from "./rankingControls";
import { getFighter, type RankingFighter } from "./rankingModel";
import { nicknameFor, signatureFightFor, watchMomentFor } from "./rankingPresentation";
import "./FighterProfilePage.css";

const profileCategoryLabels: Record<RankingCategory, string> = {
  championship: "Championship Resume",
  opponentQuality: "Opponent Quality",
  primeDominance: "Prime Dominance",
  longevity: "Elite Longevity",
  apexPeak: "Peak Apex",
  penalty: "Loss Context",
};

interface ProfileFact {
  label: string;
  value: string;
}

function categoryRank(
  fighter: RankingFighter,
  gender: CategoryGender,
  category: RankingCategory,
) {
  return categoryBoard(gender, category).findIndex((row) => row.slug === fighter.slug) + 1;
}

function categoryCardProof(fighter: RankingFighter, category: RankingCategory) {
  const stats = fighter.visibleStats;
  switch (category) {
    case "championship":
      return `${stats.titleFightWins} UFC title-fight wins`;
    case "opponentQuality":
      return `${stats.topFiveWins} Top-5 wins`;
    case "primeDominance":
      return `${stats.primeRecord} prime UFC record`;
    case "longevity":
      return `${stats.activeEliteYears.toFixed(1)} active elite years`;
    case "apexPeak":
      return "Best two-performance UFC peak";
    case "penalty":
      return "Losses adjusted for timing and context";
  }
}

function categoryExplanation(fighter: RankingFighter, category: RankingCategory, rank: number) {
  const stats = fighter.visibleStats;
  switch (category) {
    case "championship":
      return `${fighter.name} ranks #${rank} here behind ${stats.titleFightWins} UFC title-fight wins and ${stats.adjustedTitleWins.toFixed(1)} adjusted title-win credit.`;
    case "opponentQuality":
      return `${fighter.name} ranks #${rank} here with ${stats.topFiveWins} Top-5 wins and ${stats.rankedWins} ranked wins, weighted for opponent quality and timing.`;
    case "primeDominance":
      return `${fighter.name} ranks #${rank} here with a ${stats.primeRecord} prime UFC record and ${Math.round(stats.roundsWonPct)}% of audited prime rounds won.`;
    case "longevity":
      return `${fighter.name} ranks #${rank} here with ${stats.activeEliteYears.toFixed(1)} active elite UFC years, using capped gaps rather than calendar padding.`;
    case "apexPeak":
      return `${fighter.name} ranks #${rank} here based on the strength, proof, and separation of the best two-performance UFC peak.`;
    case "penalty":
      return fighter.penalty === 0
        ? `${fighter.name} ranks #${rank} here without a damaging counted UFC loss penalty.`
        : `${fighter.name} ranks #${rank} here after losses are adjusted for prime timing, opponent quality, finish context, and division context.`;
  }
}

function categoryFacts(
  fighter: RankingFighter,
  category: RankingCategory,
  rating: number,
  rank: number,
): ProfileFact[] {
  const stats = fighter.visibleStats;
  switch (category) {
    case "championship":
      return [
        { label: "UFC title-fight wins", value: String(stats.titleFightWins) },
        { label: "Adjusted title wins", value: stats.adjustedTitleWins.toFixed(1) },
      ];
    case "opponentQuality":
      return [
        { label: "Top-5 wins", value: String(stats.topFiveWins) },
        { label: "Ranked wins", value: String(stats.rankedWins) },
      ];
    case "primeDominance":
      return [
        { label: "Prime UFC record", value: stats.primeRecord },
        { label: "Rounds won", value: `${Math.round(stats.roundsWonPct)}%` },
      ];
    case "longevity":
      return [
        { label: "Active elite years", value: stats.activeEliteYears.toFixed(1) },
        { label: "Through-prime UFC fights", value: String(stats.throughPrimeUfcFights) },
      ];
    case "apexPeak":
      return [
        { label: "Category rating", value: String(rating) },
        { label: "Category rank", value: `#${rank}` },
      ];
    case "penalty":
      return [
        { label: "Prime UFC record", value: stats.primeRecord },
        { label: "Times finished in prime", value: String(stats.timesFinishedPrime) },
      ];
  }
}

function whyNotHigherCopy(fighter: RankingFighter) {
  if (fighter.rank !== 1) return fighter.whyNotHigher;
  if (fighter.slug === "jon-jones") {
    return "He cannot rank higher. The argument against a runaway #1 case is based on close fights, inactivity, heavyweight sample size, and outside-the-cage controversy—not a stronger UFC résumé above him.";
  }
  return `${fighter.name} already ranks #1 on this board. The limiting argument is whether the résumé separates enough from the field—not whether anyone currently ranks above it.`;
}

export default function FighterProfilePage() {
  const { slug } = useParams();
  const fighter = getFighter(slug);
  const [expandedCategory, setExpandedCategory] = useState<RankingCategory | null>(null);
  const [shareStatus, setShareStatus] = useState("");

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

  const gender: CategoryGender = fighter.board === "women" ? "women" : "men";
  const nickname = nicknameFor(fighter.slug);
  const signatureFightUrl = signatureFightFor(fighter.slug);
  const watchUrl = signatureFightUrl ?? watchMomentFor(fighter.slug);
  const watchLabel = signatureFightUrl ? "Watch Signature Fight" : "Watch Moment";
  const selectedCategory = rankingCategoryOptions.find(
    (category) => category.value === expandedCategory,
  );
  const selectedRank = expandedCategory
    ? categoryRank(fighter, gender, expandedCategory)
    : 0;
  const selectedRating = expandedCategory
    ? categoryDisplayRating(gender, expandedCategory, fighter)
    : 0;

  async function shareProfile() {
    const url = window.location.href;
    const shareData = {
      title: `${fighter.name} | Octagon HQ`,
      text: `${fighter.name} is #${fighter.rank} in Octagon HQ's UFC-only all-time rankings.`,
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareStatus("Shared");
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setShareStatus("Link copied");
        return;
      }
      setShareStatus("Share unavailable");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareStatus("Share unavailable");
    }
  }

  return (
    <div className="page fighter-profile-page fighter-profile-v2">
      <div className="fighter-profile-toolbar">
        <Link className="back-link" to="/rankings">‹ Rankings</Link>
        <button
          type="button"
          className="fighter-profile-share"
          onClick={shareProfile}
          aria-label={`Share ${fighter.name} profile`}
          title="Share fighter profile"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3v11m0-11L8 7m4-4 4 4M5 11v8h14v-8" />
          </svg>
        </button>
      </div>
      {shareStatus ? <p className="fighter-profile-share-status" role="status">{shareStatus}</p> : null}

      <section className="fighter-profile-photo-card" aria-label={`${fighter.name} profile photo`}>
        <FighterPhoto
          name={fighter.name}
          src={fighter.profileUrl}
          className="fighter-profile-photo"
        />
      </section>

      <section className="fighter-identity-card" aria-labelledby="fighter-profile-title">
        <div className="fighter-identity-card__topline">
          <span>#{fighter.rank} UFC ALL-TIME</span>
        </div>
        <div className="fighter-identity-card__heading">
          <div>
            <h1 id="fighter-profile-title">{fighter.name}</h1>
            {nickname ? <p className="fighter-nickname">“{nickname}”</p> : null}
          </div>
          <div className="fighter-identity-ovr" aria-label={`${fighter.ovr} overall rating`}>
            <strong>{fighter.ovr}</strong>
            <span>OVR</span>
          </div>
        </div>
        <p className="fighter-identity-card__case">{fighter.oneLiner}</p>
        <div className="fighter-identity-card__meta">
          <span>{fighter.visibleStats.ufcRecord} UFC</span>
          <span>{abbreviateDivisionLabel(fighter.division)}</span>
        </div>
      </section>

      <nav className="fighter-profile-actions" aria-label={`${fighter.name} profile actions`}>
        <Link to={`/intelligence?mode=compare&fighter=${fighter.slug}`}>Compare</Link>
        <a href="#why-ranked-here">Ask Why</a>
        <a href={watchUrl} target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 7.5v9l7-4.5-7-4.5Z" />
          </svg>
          {watchLabel}
        </a>
      </nav>

      <section className="surface-card profile-resume-card" aria-labelledby="resume-snapshot-title">
        <div className="profile-section-heading">
          <p className="eyebrow">RÉSUMÉ SNAPSHOT</p>
          <h2 id="resume-snapshot-title">The UFC case at a glance</h2>
        </div>
        <div className="profile-stat-grid">
          <div><strong>{fighter.visibleStats.ufcRecord}</strong><span>UFC Record</span></div>
          <div><strong>{fighter.visibleStats.titleFightWins}</strong><span>UFC Title-Fight Wins</span></div>
          <div><strong>{fighter.visibleStats.topFiveWins}</strong><span>Top-5 Wins</span></div>
          <div><strong>{fighter.visibleStats.primeRecord}</strong><span>Prime UFC Record</span></div>
          <div><strong>{Math.round(fighter.visibleStats.roundsWonPct)}%</strong><span>Rounds Won</span></div>
          <div><strong>{fighter.visibleStats.activeEliteYears.toFixed(1)}</strong><span>Active Elite Years</span></div>
        </div>
      </section>

      <section className="surface-card profile-scorecard" aria-labelledby="profile-scorecard-title">
        <div className="profile-section-heading">
          <p className="eyebrow">CATEGORY SCORECARD</p>
          <h2 id="profile-scorecard-title">How the résumé wins</h2>
          <p>Tap a category for the fighter-specific breakdown.</p>
        </div>
        <div className="profile-category-grid">
          {rankingCategoryOptions.map((category) => {
            const rating = categoryDisplayRating(gender, category.value, fighter);
            const rank = categoryRank(fighter, gender, category.value);
            const isExpanded = expandedCategory === category.value;
            return (
              <button
                type="button"
                key={category.value}
                className={isExpanded ? "is-expanded" : ""}
                aria-expanded={isExpanded}
                onClick={() => setExpandedCategory(isExpanded ? null : category.value)}
              >
                <span>{profileCategoryLabels[category.value]}</span>
                <strong>{rating}</strong>
                <small>#{rank} in category · {categoryCardProof(fighter, category.value)}</small>
              </button>
            );
          })}
        </div>

        {expandedCategory && selectedCategory ? (
          <article className="profile-category-detail" aria-live="polite">
            <p className="eyebrow">#{selectedRank} IN CATEGORY</p>
            <h3>{profileCategoryLabels[expandedCategory]}: {selectedRating} rating</h3>
            <p>{categoryExplanation(fighter, expandedCategory, selectedRank)}</p>
            <div className="profile-category-facts">
              {categoryFacts(fighter, expandedCategory, selectedRating, selectedRank).map((fact) => (
                <div key={fact.label}>
                  <span>{fact.label}</span>
                  <strong>{fact.value}</strong>
                </div>
              ))}
            </div>
            <small>{selectedCategory.description}</small>
          </article>
        ) : null}
      </section>

      <section id="why-ranked-here" className="surface-card profile-copy-card profile-copy-card--focused">
        <p className="eyebrow">WHY RANKED HERE</p>
        <h2>Why #{fighter.rank}</h2>
        <p>{fighter.whyRankedHere}</p>
      </section>

      <section className="surface-card profile-copy-card profile-copy-card--penalty">
        <p className="eyebrow">WHY NOT RANKED HIGHER?</p>
        <h2>The limiting case</h2>
        <p>{whyNotHigherCopy(fighter)}</p>
      </section>

      <section className="surface-card profile-copy-card profile-final-card">
        <p className="eyebrow">FINAL TAKEAWAY</p>
        <h2>The UFC-only case</h2>
        <p>{fighter.finalTakeaway}</p>
      </section>
    </div>
  );
}
