import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface BackRoomLocationState {
  showDiscovery?: boolean;
}

export default function BackRoomPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialState = location.state as BackRoomLocationState | null;
  const [showDiscovery, setShowDiscovery] = useState(Boolean(initialState?.showDiscovery));

  if (showDiscovery) {
    return (
      <div className="back-room-reveal" role="dialog" aria-modal="true" aria-label="The Back Room discovered">
        <div className="back-room-reveal__scan" aria-hidden="true" />
        <section>
          <p>ACCESS GRANTED</p>
          <h1>You weren’t supposed to find this.</h1>
          <span>There’s more behind Octagon HQ than the Octagon.</span>
          <button type="button" onClick={() => setShowDiscovery(false)}>ENTER THE BACK ROOM</button>
        </section>
      </div>
    );
  }

  return (
    <div className="page back-room-page">
      <section className="back-room-hero">
        <p className="eyebrow">OFF THE BOOKS</p>
        <h1>The Back Room</h1>
        <p>Same group-chat energy. Different arenas. Pick a door.</p>
      </section>

      <section className="back-room-sports" aria-label="Back Room sports">
        <button className="back-room-sport back-room-sport--ufc" type="button" onClick={() => navigate("/play")}>
          <span className="back-room-sport__icon" aria-hidden="true">🥊</span>
          <small>ORIGINAL ROOM</small>
          <strong>UFC</strong>
          <p>Back to Octagon HQ games.</p>
          <em>ENTER →</em>
        </button>

        <article className="back-room-sport back-room-sport--locked" aria-disabled="true">
          <span className="back-room-sport__icon" aria-hidden="true">🏀</span>
          <small>COMING SOON</small>
          <strong>BASKETBALL</strong>
          <p>The door is here. It just isn’t open yet.</p>
          <em>LOCKED</em>
        </article>
      </section>
    </div>
  );
}
