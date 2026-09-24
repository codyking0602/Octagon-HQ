import { useIdentity } from "../identity/IdentityProvider";
import { canViewMlbPlayoffs } from "./mlbPlayoffsConfig";
import { MlbHomeHq } from "./MlbHomeHq";

export default function MlbPlayoffsPage() {
  const identity = useIdentity();
  const enabled = canViewMlbPlayoffs(identity.profile);

  return (
    <div className="page mlb-playoffs-page">
      <section className="page-heading">
        <p className="eyebrow">MLB PLAYOFFS</p>
        <h1>October starts here</h1>
        <p>Bracket, fresh series picks, and one-off postseason games.</p>
      </section>
      <MlbHomeHq enabled={enabled} signedIn={Boolean(identity.profile)} />
    </div>
  );
}
