import { useState, type ReactNode } from "react";
import FootballPicksSetupPage from "../picks-setup/FootballPicksSetupPage";
import PicksControlCenterPage from "./PicksControlCenterPage";

type OwnerSport = "mma" | "football";

interface PicksOwnerPageProps {
  initialSport?: OwnerSport;
  ufcOwner?: ReactNode;
  footballOwner?: ReactNode;
}

export default function PicksOwnerPage({ initialSport = "mma", ufcOwner, footballOwner }: PicksOwnerPageProps) {
  const [sport, setSport] = useState<OwnerSport>(initialSport);

  return (
    <>
      <section className="page surface-card picks-setup-scope" aria-label="Picks owner sport">
        <div>
          <p className="eyebrow">PICKS OWNER</p>
          <h2>Choose setup</h2>
        </div>
        <div className="picks-setup-scope__options">
          <button className={sport === "mma" ? "is-active" : ""} type="button" aria-pressed={sport === "mma"} onClick={() => setSport("mma")}>
            <strong>UFC</strong><small>Existing fight-card owner</small>
          </button>
          <button className={sport === "football" ? "is-active" : ""} type="button" aria-pressed={sport === "football"} onClick={() => setSport("football")}>
            <strong>FOOTBALL</strong><small>Weekly ATS slate</small>
          </button>
        </div>
      </section>
      {sport === "mma" ? (ufcOwner ?? <PicksControlCenterPage />) : (footballOwner ?? <FootballPicksSetupPage />)}
    </>
  );
}
