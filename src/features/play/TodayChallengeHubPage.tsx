import PlayPage from "./PlayPage";
import TodayChallengeHub from "./TodayChallengeHub";

export default function TodayChallengeHubPage() {
  return (
    <div className="page play-page today-challenge-hub-page">
      <section className="page-heading">
        <p className="eyebrow">GAMES &amp; CHALLENGES</p>
        <h1>Play</h1>
        <p>Daily challenges, blind debates, and UFC rankings built to argue about.</p>
      </section>
      <TodayChallengeHub />
      <div className="today-challenge-hub-page__legacy">
        <PlayPage />
      </div>
    </div>
  );
}
