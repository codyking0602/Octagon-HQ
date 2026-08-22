import { useNavigate } from "react-router-dom";

const footballGames = [
  {
    id: "05",
    kicker: "BLIND RANKING",
    name: "RANK 5",
    description: "Six rotating debates across college football and the NFL. Lock five before you know what’s coming.",
    path: "/back-room/football/rank-five",
  },
  {
    id: "44",
    kicker: "ROSTER KNIFE FIGHT",
    name: "KEEP 4 / CUT 4",
    description: "Eight names, one at a time. Keep four. Cut four. Every call is permanent until the board is over.",
    path: "/back-room/football/keep-cut",
  },
  {
    id: "100",
    kicker: "READ THE ROOM",
    name: "WAVELENGTH",
    description: "Game manager or gunslinger? Normal fanbase or completely insane? Find one hidden football number in four clues.",
    path: "/back-room/football/wavelength",
  },
] as const;

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
          <span>3 GAMES LIVE</span>
        </div>
      </section>

      <section className="football-room-game-grid" aria-label="Football games">
        {footballGames.map((game) => (
          <button className="football-room-preview" type="button" key={game.path} onClick={() => navigate(game.path)}>
            <div>
              <small>{game.kicker}</small>
              <strong>{game.name}</strong>
              <p>{game.description}</p>
              <em>OPEN GAME →</em>
            </div>
            <span aria-hidden="true">{game.id}</span>
          </button>
        ))}
      </section>

      <button className="back-room-secondary" type="button" onClick={() => navigate("/back-room")}>
        ← BACK TO THE BACK ROOM
      </button>
    </div>
  );
}
