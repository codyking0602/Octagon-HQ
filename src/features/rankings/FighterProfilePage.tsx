import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FighterPhoto } from "./FighterPhoto";
import { categoryBoard, rankingCategoryOptions, type CategoryGender, type RankingCategory } from "./rankingControls";
import { abbreviateDivisionLabel, categoryDisplayRating, categorySupportCopy } from "./rankingDisplay";
import { getFighter, type RankingFighter } from "./rankingModel";
import { nicknameFor, signatureFightFor, watchMomentFor } from "./rankingPresentation";
import "./FighterProfilePage.css";

type ProfileCategory = RankingCategory;

const categoryProof: Record<ProfileCategory, (fighter: RankingFighter) => string> = {
  championship: (fighter) => `${fighter.visibleStats.titleFightWins} UFC title-fight wins`,
  opponentQuality: (fighter) => `${fighter.visibleStats.topFiveWins} Top-5 wins`,
  primeDominance: (fighter) => `${fighter.visibleStats.primeRecord} prime UFC record`,
  longevity: (fighter) => `${fighter.visibleStats.activeEliteYears.toFixed(1)} active elite years`,
  apexPeak: () => "Signature peak performances carry elite separation",
  penalty: (fighter) => fighter.penalty === 0 ? "No counted UFC loss damage" : "Loss context is already reflected",
};

function boardGender(fighter: RankingFighter): CategoryGender {
  return fighter.board === "women" ? "women" : "men";
}

function categoryRank(fighter: RankingFighter, category: ProfileCategory) {
  return categoryBoard(boardGender(fighter), category).findIndex((row) => row.slug === fighter.slug) + 1;
}

function whyNotHigherCopy(fighter: RankingFighter) {
  if (fighter.rank !== 1) return fighter.whyNotHigher;
  if (fighter.slug === "jon-jones") {
    return "He cannot rank higher. The argument against a runaway #1 case is based on close fights, inactivity, heavyweight sample size, and outside-the-cage controversy—not a stronger UFC résumé above him.";
  }
  return "This fighter already owns the top slot on this board, so the limiting case is about whether the lead is narrow rather than whether a stronger résumé sits above them.";
}

export default function FighterProfilePage() {
  const { slug } = useParams();
  const fighter = getFighter(slug);
  const [openCategory, setOpenCategory] = useState<ProfileCategory | null>(null);

  const actionUrl = useMemo(() => (fighter ? signatureFightFor(fighter.slug) ?? watchMomentFor(fighter.slug) : "#"), [fighter]);

  if (!fighter) {
    return (
      <div className="page">
        <section className="surface-card empty-state">
          <h1>Fighter not found</h1>
          <Link className="primary-action" to="/rankings">Back to Rankings</Link>
        </section>
      </div>
    );
  }

  const stats = fighter.visibleStats;
  const nickname = nicknameFor(fighter.slug);
  const profileCategories = rankingCategoryOptions.map((category) => category.value);

  return (
    <div className="page fighter-profile-page">
      <nav className="fighter-toolbar" aria-label="Fighter profile controls">
        <Link to="/rankings">‹ Back to Rankings</Link>
        <button type="button" onClick={() => void navigator.share?.({ title: fighter.name, url: window.location.href })}>Share</button>
      </nav>

      <section className="fighter-photo-card" aria-label={`${fighter.name} clean fighter photo`}>
        <FighterPhoto name={fighter.name} src={fighter.profileUrl} className="fighter-profile-photo" />
      </section>

      <section className="surface-card fighter-identity">
        <p className="eyebrow">#{fighter.rank} UFC All-Time</p>
        <h1>{fighter.name}</h1>
        {nickname ? <p className="fighter-nickname">“{nickname}”</p> : null}
        <p>{fighter.oneLiner}</p>
        <div className="identity-meta">
          <span><small>OVR</small><strong>{fighter.ovr}</strong></span>
          <span><small>UFC record</small><strong>{stats.ufcRecord}</strong></span>
          <span><small>Division</small><strong>{abbreviateDivisionLabel(fighter.division)}</strong></span>
          <span><small>Résumé</small><strong>{fighter.resumeTag}</strong></span>
        </div>
      </section>

      <section className="profile-actions" aria-label="Profile actions">
        <Link to={`/intelligence?compare=${fighter.slug}`}>Compare</Link>
        <a href="#why-ranked-here">Ask Why</a>
        <a href={actionUrl} target="_blank" rel="noopener noreferrer">{signatureFightFor(fighter.slug) ? "Watch Signature Fight" : "Watch Moment"}</a>
      </section>

      <section className="surface-card" aria-labelledby="resume-title">
        <p className="eyebrow">Résumé Snapshot</p>
        <h2 id="resume-title">Calculated visible résumé</h2>
        <div className="resume-grid">
          <span className="resume-stat"><small>UFC record</small><strong>{stats.ufcRecord}</strong></span>
          <span className="resume-stat"><small>UFC title-fight wins</small><strong>{stats.titleFightWins}</strong></span>
          <span className="resume-stat"><small>Top-5 wins</small><strong>{stats.topFiveWins}</strong></span>
          <span className="resume-stat"><small>Prime UFC record</small><strong>{stats.primeRecord}</strong></span>
          <span className="resume-stat"><small>Rounds won</small><strong>{Math.round(stats.roundsWonPct)}%</strong></span>
          <span className="resume-stat"><small>Active elite years</small><strong>{stats.activeEliteYears.toFixed(1)}</strong></span>
        </div>
      </section>

      <section className="surface-card" aria-labelledby="category-title">
        <p className="eyebrow">Category Scorecard</p><h2 id="category-title">Category breakdown</h2>
        <div className="category-profile-grid">
          {profileCategories.map((category) => {
            const option = rankingCategoryOptions.find((row) => row.value === category)!;
            const isOpen = openCategory === category;
            return <button type="button" key={category} className={`category-card${isOpen ? " is-open" : ""}`} aria-expanded={isOpen} onClick={() => setOpenCategory(isOpen ? null : category)}><span className="category-card__top"><span><small>{option.label}</small><strong>{categoryDisplayRating(boardGender(fighter), category, fighter)}</strong></span><span>#{categoryRank(fighter, category)}</span></span><p>{categoryProof[category](fighter)}</p>{isOpen ? <span className="category-detail"><strong>What it means:</strong> {option.description} <strong>Why here:</strong> {categoryProof[category](fighter)}. Supporting facts: {stats.ufcRecord} UFC, {stats.primeRecord} prime.</span> : null}</button>;
          })}
        </div>
      </section>

      <section id="why-ranked-here" className="surface-card profile-copy-card"><p className="eyebrow">Why Ranked Here</p><h2>Why #{fighter.rank}</h2><p>{fighter.whyRankedHere}</p></section>
      <section className="surface-card profile-copy-card"><p className="eyebrow">WHY NOT RANKED HIGHER?</p><h2>The limiting case</h2><p>{whyNotHigherCopy(fighter)}</p></section>
      <section className="surface-card profile-copy-card"><p className="eyebrow">Final Takeaway</p><h2>The UFC-only case</h2><p>{fighter.finalTakeaway}</p></section>
    </div>
  );
}
