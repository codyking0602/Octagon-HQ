import { useState } from "react";
import { chooseTwentyQuestionsFootballLeague } from "../games/twentyQuestionsEngine";
import { getFootballTwentyQuestionsRuntimeUniverse } from "../games/twentyQuestionsFootballRuntimeAuthority";
import { createTwentyQuestionsRound } from "../games/twentyQuestionsRuntime";
import TwentyQuestionsPage from "./TwentyQuestionsPage";

export type FootballTwentyQuestionsBoard = "NFL" | "CFB" | "RANDOM";

export function resolveFootballTwentyQuestionsLeague(
  board: FootballTwentyQuestionsBoard,
  random: () => number,
) {
  return board === "RANDOM" ? chooseTwentyQuestionsFootballLeague(random) : board;
}

function createFootballTwentyQuestionsRound(board: FootballTwentyQuestionsBoard) {
  const random = Math.random;
  const league = resolveFootballTwentyQuestionsLeague(board, random);
  return createTwentyQuestionsRound(
    "football",
    getFootballTwentyQuestionsRuntimeUniverse(league),
    random,
  );
}

export default function FootballTwentyQuestionsPage() {
  const [board, setBoard] = useState<FootballTwentyQuestionsBoard | null>(null);

  if (!board) {
    return (
      <main className="page twenty-questions-page" data-sport="football">
        <section className="twenty-questions-shell">
          <header className="twenty-questions-header">
            <div>
              <p className="eyebrow">FOOTBALL GAMES</p>
              <h1>20 Questions</h1>
            </div>
          </header>
          <section className="twenty-questions-start">
            <div className="twenty-questions-start__mark">?</div>
            <p className="twenty-questions-start__league">NEW BOARD</p>
            <h2>Choose your football universe.</h2>
            <p>NFL and College stay separate. Random gives you a 50/50 draw and reveals the league before the first question.</p>
            <div className="twenty-questions-board-options" aria-label="Choose football 20 Questions board">
              <button className="twenty-questions-primary" type="button" onClick={() => setBoard("NFL")}>NFL</button>
              <button className="twenty-questions-primary" type="button" onClick={() => setBoard("CFB")}>COLLEGE</button>
              <button className="twenty-questions-primary" type="button" onClick={() => setBoard("RANDOM")}>RANDOM</button>
            </div>
          </section>
        </section>
      </main>
    );
  }

  return (
    <TwentyQuestionsPage
      sport="football"
      createRound={() => createFootballTwentyQuestionsRound(board)}
    />
  );
}
