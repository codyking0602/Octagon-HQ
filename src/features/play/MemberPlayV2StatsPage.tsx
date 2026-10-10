import { Navigate, useParams } from "react-router-dom";
import PlayV2StatsPage from "./PlayV2StatsPage";

export default function MemberPlayV2StatsPage() {
  const { memberName = "", sport } = useParams();
  if (!memberName || (sport !== "football" && sport !== "ufc")) {
    return <Navigate to="/members" replace />;
  }
  return <PlayV2StatsPage sport={sport} memberName={memberName} />;
}
