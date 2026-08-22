import { useNavigate } from "react-router-dom";

export default function FootballBackRoomPage() {
  const navigate = useNavigate();

  return (
    <div className="page back-room-page football-room-page">
      <section className="back-room-hero football-room-hero">
        <p className="eyebrow">THE BACK ROOM · FOOTBALL</p>
        <h1>Saturday + Sunday.</h1>
        <p>College football and the NFL together. No feeds. No news. Just games worth arguing about.</p>
        <div className="football-room-tags" aria-label="Football leagues">
          <span>COLLEGE FOOTBALL</span>
          <span>NFL</span>
        </div>
      </section>

      <section className="football-room-preview">
        <div>
          <small>FIRST GAME THROUGH THE DOOR</small>
          <strong>RANK 5</strong>
          <p>Players, programs, seasons, coaches, and impossible football arguments.</p>
        </div>
        <span aria-hidden="true">05</span>
      </section>

      <button className="back-room-secondary" type="button" onClick={() => navigate("/back-room")}>
        ← BACK TO THE BACK ROOM
      </button>
    </div>
  );
}
