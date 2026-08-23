import { useNavigate } from "react-router-dom";

const footballGames = [
  {
    id: "5",
    kicker: "BLIND RANKING",
    name: "BLIND RANK 5",
    description: "Five football names. Five locked slots. Same blind-ranking game as UFC, built from college football and the NFL.",
    path: "/back-room/football/rank-five",
  },
  {
    id: "4/4",
    kicker: "ROSTER DECISIONS",
    name: "KEEP 4 / CUT 4",
    description: "Eight names, one at a time. Keep four. Cut four. Every decision locks before the next reveal.",
    path: "/back-room/football/keep-cut",
  },
  {
    id: "~",
    kicker: "READ THE SCALE",
    name: "WAVELENGTH",
    description: "One hidden 1–100 football number. Four adaptive clues. Same Wavelength rules as the UFC room.",
    path: "/back-room/football/wavelength",
  },
  {
    id: "?",
    kicker: "NO NAMES. JUST THE RÉSUMÉ.",
    name: "BLIND RESUME",
    description: "Player careers, single seasons, teams, programs and coaches. Reveal résumé stats in stages, then lock the better one.",
    path: "/back-room/football/blind-resume",
  },
  {
    id: "#",
    kicker: "BUILD TO THE TARGET",
    name: "HIT THE NUMBER",
    description: "Pick four from eight and chase a factual football target without going over. Classic, themed, era and team-build boards.",
    path: "/back-room/football/hit-the-number",
  },
  {
    id: "↑",
    kicker: "KNOW THE RECORDS",
    name: "FIND THE LEADER",
    description: "Ten NFL or college football names. Eliminate nine decoys without knocking out the hidden statistical leader.",
    path: "/back-room/football/find-leader",
  },
] as const;

export default function FootballBackRoomPage() {
  const navigate = useNavigate();
  return (
    <div className="page back-room-page football-room-page">
      <section className="back-room-hero football-room-hero">
        <p className="eyebrow">THE BACK ROOM · FOOTBALL</p>
        <h1>Saturday + Sunday.</h1>
        <p>College football and the NFL together. Same games that work in the Octagon. Different sport. Different room.</p>
        <div className="football-room-tags" aria-label="Football leagues">
          <span>COLLEGE FOOTBALL</span>
          <span>NFL</span>
          <span>TODAY’S CHALLENGE + 6 GAMES</span>
        </div>
      </section>
      <button className="football-room-preview football-room-daily" type="button" onClick={() => navigate("/back-room/football/today")}>
        <span className="football-room-preview__mark" aria-hidden="true">24H</span>
        <div>
          <small>SAME BOARD FOR EVERYONE</small>
          <strong>TODAY’S CHALLENGE</strong>
          <p>One official football board each day with deliberate NFL/CFB balance. Blind Rank 5 and Keep 4 / Cut 4 combine into one Daily Double.</p>
          <em>PLAY TODAY →</em>
        </div>
      </button>
      <section className="football-room-game-grid" aria-label="Football games">
        {footballGames.map((game) => (
          <button className="football-room-preview" type="button" key={game.path} onClick={() => navigate(game.path)}>
            <span className="football-room-preview__mark" aria-hidden="true">{game.id}</span>
            <div><small>{game.kicker}</small><strong>{game.name}</strong><p>{game.description}</p><em>OPEN GAME →</em></div>
          </button>
        ))}
      </section>
      <button className="back-room-secondary" type="button" onClick={() => navigate("/back-room")}>← BACK TO THE BACK ROOM</button>
    </div>
  );
}
