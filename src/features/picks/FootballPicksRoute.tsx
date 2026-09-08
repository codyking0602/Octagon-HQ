import { PicksSeasonHub } from "./PicksSeasonHub";
import { PicksProvider, usePicks } from "./PicksProvider";
import FootballPicksPage from "./FootballPicksPage";

function FootballPicksContent() {
  const picks = usePicks();

  return (
    <>
      <FootballPicksPage />
      <div className="page football-picks-history-page">
        <PicksSeasonHub history={picks.history} loading={picks.loading} sport="football" />
      </div>
    </>
  );
}

/** Route adapter only: Football uses the same Picks provider and repository as UFC. */
export default function FootballPicksRoute() {
  return (
    <PicksProvider sport="football">
      <FootballPicksContent />
    </PicksProvider>
  );
}
