import { PicksProvider } from "./PicksProvider";
import FootballPicksPage from "./FootballPicksPage";

/** Football Picks uses the shared provider with no entry video or overlay. */
export default function FootballPicksRoute() {
  return <PicksProvider sport="football"><FootballPicksPage /></PicksProvider>;
}
