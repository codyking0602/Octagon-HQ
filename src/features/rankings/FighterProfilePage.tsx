import { Link, useParams } from "react-router-dom";
import { FighterPhoto } from "./FighterPhoto";
import { categoryRating, getFighter } from "./rankingModel";

const categories = [
  { key: "championship", label: "Championship", maximum: 30 },
  { key: "opponentQuality", label: "Opponent quality", maximum: 30 },
  { key: "primeDominance", label: "Prime dominance", maximum: 30 },
  { key: "longevity", label: "Longevity", maximum: 30 },
] as const;

export default function FighterProfilePage() {
  const { slug } = useParams();
  const fighter = getFighter(slug);

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

  return (
    <div className="page fighter-profile-page">
      <Link className="back-link" to="/rankings">‹ Rankings</Link>

      <section className="fighter-hero">
        <div className="fighter-hero__copy">
          <p className="eyebrow">#{fighter.rank} UFC ALL-TIME</p>
          <h1>{fighter.name}</h1>
          <p>{fighter.oneLiner}</p>
          <div className="fighter-hero__meta">
            <span>{fighter.visibleStats.ufcRecord} UFC</span>
            <span>{fighter.division}</span>
            <span>Model {fighter.rawScore.toFixed(2)}</span>
          </div>
        </div>
        <div className="fighter-hero__visual">
          <FighterPhoto name={fighter.name} src={fighter.profileUrl} className="fighter-hero__photo" />
          <span className="fighter-hero__ovr"><strong>{fighter.ovr}</strong><small>OVR</small></span>
        </div>
      </section>

      <section className="surface-card" aria-labelledby="category-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">SCORECARD</p>
            <h2 id="category-title">Category breakdown</h2>
          </div>
        </div>
        <div className="category-list">
          {categories.map((category) => {
            const raw = fighter[category.key];
            const rating = categoryRating(raw, category.maximum);
            return (
              <div className="category-row" key={category.key}>
                <div><span>{category.label}</span><strong>{rating}</strong></div>
                <div className="category-meter"><span style={{ width: `${rating}%` }} /></div>
              </div>
            );
          })}
          <div className="penalty-row"><span>Peak Apex</span><strong>+{fighter.apexPeak.toFixed(2)}</strong></div>
          <div className="penalty-row"><span>Loss context</span><strong>{fighter.penalty.toFixed(2)}</strong></div>
          <div className="penalty-row"><span>Era depth</span><strong>{fighter.eraDepth.toFixed(2)}</strong></div>
        </div>
      </section>

      <section className="surface-card profile-copy-card">
        <p className="eyebrow">RESUME SNAPSHOT</p>
        <h2>{fighter.resumeTag}</h2>
        <p>
          {fighter.visibleStats.titleFightWins} UFC title-fight wins · {fighter.visibleStats.topFiveWins} top-five wins · {fighter.visibleStats.finishRatePct.toFixed(1)}% finish rate · {fighter.visibleStats.activeEliteYears.toFixed(1)} active elite years
        </p>
      </section>

      <section className="surface-card profile-copy-card">
        <p className="eyebrow">DIVISION STRENGTH</p>
        <h2>Era and division context</h2>
        <p>{fighter.divisionStrength}</p>
      </section>

      <section className="surface-card profile-copy-card">
        <p className="eyebrow">KEY JUDGMENT CALLS</p>
        <h2>What the model decided</h2>
        {fighter.judgmentCalls.length ? (
          <ul>{fighter.judgmentCalls.map((call) => <li key={call}>{call}</li>)}</ul>
        ) : (
          <p>The position follows directly from the approved UFC-only facts and category inputs.</p>
        )}
      </section>

      <section className="surface-card profile-copy-card">
        <p className="eyebrow">WHY RANKED HERE</p>
        <h2>Why #{fighter.rank}</h2>
        <p>{fighter.whyRankedHere}</p>
      </section>

      <section className="surface-card profile-copy-card profile-copy-card--penalty">
        <p className="eyebrow">WHY NOT RANKED HIGHER?</p>
        <h2>The limiting case</h2>
        <p>{fighter.whyNotHigher}</p>
      </section>

      <section className="surface-card profile-copy-card">
        <p className="eyebrow">FINAL TAKEAWAY</p>
        <h2>The UFC-only case</h2>
        <p>{fighter.finalTakeaway}</p>
      </section>
    </div>
  );
}
