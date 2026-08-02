import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import MonitoringInboxPage from "../picks-monitoring/MonitoringInboxPage";
import type { MonitoringInboxRepository } from "../picks-monitoring/monitoringInboxRepository";
import PicksSetupPage from "../picks-setup/PicksSetupPage";
import type { PickSetupRepository } from "../picks-setup/pickSetupRepository";
import type { PickControlEvent } from "./pickControlModel";
import PicksControlPage from "./PicksControlPage";
import type { PickControlRepository } from "./pickControlRepository";

function primaryStatus(event: PickControlEvent | null | undefined) {
  if (event === undefined) return "LOADING CONTROL CENTER";
  if (!event) return "SET UP NEXT EVENT";
  if (event.status === "upcoming") return "PICKS OPEN";
  if (event.status === "locked") {
    const unresolved = event.bouts.filter((bout) => bout.includedInPicks && bout.resultStatus === "pending").length;
    return unresolved ? `${unresolved} FIGHT${unresolved === 1 ? "" : "S"} NEED RESULTS` : "PICKS CLOSED · RESULTS OPEN";
  }
  return "EVENT COMPLETE";
}

interface PicksControlCenterPageProps {
  controlRepository?: PickControlRepository | null;
  setupRepository?: PickSetupRepository | null;
  monitoringRepository?: MonitoringInboxRepository | null;
}

export default function PicksControlCenterPage({
  controlRepository,
  setupRepository,
  monitoringRepository,
}: PicksControlCenterPageProps) {
  const [event, setEvent] = useState<PickControlEvent | null | undefined>(undefined);
  const receiveEvent = useCallback((nextEvent: PickControlEvent | null) => setEvent(nextEvent), []);

  return (
    <div className="picks-control-center">
      <header className="page picks-control-center__header">
        <p className="eyebrow">PRIVATE PICKS OWNER</p>
        <h1>Picks Control Center</h1>
        <strong className="picks-control-center__status">{primaryStatus(event)}</strong>
        <p>One control room for setup, card monitoring, Picks lock, official results, and audited corrections.</p>
        <Link className="secondary-action" to="/picks">OPEN PLAYER PICKS</Link>
      </header>

      <section id="fight-night" aria-label="Event and fight-night control">
        <PicksControlPage repository={controlRepository} onEventState={receiveEvent} />
      </section>

      {event === null ? (
        <section id="setup" className="picks-control-center__section" aria-label="Event setup">
          <PicksSetupPage repository={setupRepository} />
        </section>
      ) : null}

      {event?.status === "upcoming" ? (
        <section id="monitoring" className="picks-control-center__section" aria-label="Automatic monitoring and card review">
          <MonitoringInboxPage repository={monitoringRepository} />
        </section>
      ) : null}
    </div>
  );
}
