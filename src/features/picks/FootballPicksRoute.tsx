import { PicksProvider } from "./PicksProvider";
import FootballPicksPage from "./FootballPicksPage";

/** Route adapter only: Football uses the same Picks provider and repository as UFC. */
export default function FootballPicksRoute() {
  return (
    <PicksProvider sport="football">
      <FootballPicksPage />
    </PicksProvider>
  );
}
