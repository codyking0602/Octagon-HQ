import { useLocation, useNavigate } from "react-router-dom";
import { FootballEntryTransition } from "../back-room/FootballEntryTransition";
import type { FootballEntryState } from "../back-room/footballEntrySession";
import { PicksProvider } from "./PicksProvider";
import FootballPicksPage from "./FootballPicksPage";

/** Route adapter only: Football uses the same Picks provider and repository as UFC. */
export default function FootballPicksRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const entrySurface = (location.state as FootballEntryState | null)?.footballEntry;

  return (
    <>
      {entrySurface === "picks" ? (
        <FootballEntryTransition
          surface="picks"
          onComplete={() => navigate("/football/picks", { replace: true, state: null })}
        />
      ) : null}
      <PicksProvider sport="football">
        <FootballPicksPage />
      </PicksProvider>
    </>
  );
}
