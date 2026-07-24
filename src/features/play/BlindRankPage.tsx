import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FighterPhoto } from "../rankings/FighterPhoto";
import {
  blindRankChallengeUrl,
  blindRankPacks,
  createBlindRankLineup,
  createBlindRankSeed,
  loadBlindRankHistory,
  loadBlindRankPack,
  resolveBlindRankChallenge,
  saveBlindRankPack,
  saveBlindRankReveal,
} from "./blindRankEngine";
import type { BlindRankPackId, PlayFighter } from "./playFighterPool";
import { shareGameChallenge } from "./challengeShare";

function packIsValid(value: string | null): value is BlindRankPackId {
  return blindRankPacks.some((pack) => pack.id === value);
}

function compactDivision(fighter: PlayFighter) {
  const abbreviations: Record<string, string> = {
    Strawweight: "SW",
    Flyweight: "FLW",
    Bantamweight: "BW",
    Featherweight: "FW",
    Lightweight: "LW",
    Welterweight: "WW",
    Middleweight: "MW",
    "Light Heavyweight": "LHW",
    Heavyweight: "HW",
  };
  return fighter.divisions.map((division) => abbreviations[division] ?? division).join(" / ");
}

export default function BlindRankPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryPack = searchParams.get("pack");
  const initialPack = packIsValid(queryPack) ? queryPack : loadBlindRankPack();
  const sharedLineup = useMemo(() => {
    const ids = (searchParams.get("lineup") ?? "").split(",").map((value) => value.trim()).filter(Boolean);
    return resolveBlindRankChallenge(initialPack, ids);
  }, [initialPack, searchParams]);
  const shared = Boolean(sharedLineup);
  const initialSeed = useMemo(() => createBlindRankSeed(), []);
  const initialLineup = useMemo(
    () => sharedLineup ?? createBlindRankLineup(initialPack, initialSeed, loadBlindRankHistory(initialPack)).fighters,
    [initialPack, initialSeed, sharedLineup],
  );

  const [packId, setPackId] = useState<BlindRankPackId>(initialPack);
  const [lineup, setLineup] = useState<PlayFighter[]>(initialLineup);
  const [placements, setPlacements] = useState<Array<PlayFighter | null>>(Array(5).fill(null));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [challengeStatus, setChallengeStatus] = useState("");
  const pack = blindRankPacks.find((item) => item.id === packId)!;
  const complete = currentIndex >= 5;
  const current = lineup[currentIndex];

  function resetPlacements() {
    setPlacements(Array(5).fill(null));
    setCurrentIndex(0);
    setChallengeStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startNewLineup(nextPack = packId) {
    const nextSeed = createBlindRankSeed();
    const next = createBlindRankLineup(nextPack, nextSeed, loadBlindRankHistory(nextPack));
    saveBlindRankPack(nextPack);
    setPackId(nextPack);
    setLineup(next.fighters);
    resetPlacements();
  }

  function changePack(nextPack: BlindRankPackId) {
    startNewLineup(nextPack);
  }

  function placeCurrent(slotIndex: number) {
    if (complete || !current || placements[slotIndex]) return;
    const next = [...placements];
    next[slotIndex] = current;
    setPlacements(next);
    if (!shared) saveBlindRankReveal(packId, current.id, lineup);
    setCurrentIndex((index) => index + 1);
  }

  async function challengeSomeone() {
    setChallengeStatus("");
    const status = await shareGameChallenge({
      title: "Blind Rank 5 Challenge",
      text: `I challenged you to rank the same five UFC fighters in ${pack.name}. Every slot locks before the next reveal.`,
      url: blindRankChallengeUrl(packId, lineup),
    });
    setChallengeStatus(status);
  }

  return (
    <div className="page blind-rank-page">
      <section className="blind-rank-intro">
        <div>
          <p className="eyebrow">{shared ? "FRIEND CHALLENGE" : "BLIND RANK 5"}</p>
          <h1>{shared ? "Same five. Your ranking." : pack.prompt}</h1>
          <p>{pack.intro}</p>
        </div>
        {!shared ? (
          <div className="blind-rank-controls">
            <label>
              <span>Category</span>
              <select aria-label="Blind Rank category" value={packId} onChange={(event) => changePack(event.target.value as BlindRankPackId)}>
                {blindRankPacks.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
              </select>
            </label>
            <button type="button" onClick={() => startNewLineup()}>NEW LINEUP</button>
          </div>
        ) : <span className="blind-rank-shared-pack">{pack.name}</span>}
      </section>

      <section className="blind-rank-game">
        <header><strong>{complete ? "COMPLETE" : `LOCKED ${currentIndex} OF 5`}</strong><span>{pack.name}</span></header>
        <div className="blind-rank-slots" aria-label="Blind Rank locked slots">
          {placements.map((fighter, index) => fighter ? (
            <button className="blind-rank-slot is-filled" type="button" disabled key={index}>
              <b>{index + 1}</b>
              <FighterPhoto className="blind-rank-slot__photo" name={fighter.name} src={fighter.thumbUrl} />
              <strong>{fighter.name}</strong>
            </button>
          ) : (
            <button className="blind-rank-slot" type="button" disabled={complete} key={index} onClick={() => placeCurrent(index)}>
              <b>{index + 1}</b><span>PLACE HERE</span>
            </button>
          ))}
        </div>

        {complete ? (
          <div className="blind-rank-finish">
            <p className="eyebrow">YOUR FINAL RANKING</p>
            <div className="blind-rank-results">
              {placements.map((fighter, index) => fighter ? (
                <article key={fighter.id}>
                  <b>#{index + 1}</b>
                  <FighterPhoto className="blind-rank-result__photo" name={fighter.name} src={fighter.thumbUrl} />
                  <span><strong>{fighter.name}</strong><small>{compactDivision(fighter)}</small></span>
                </article>
              ) : null)}
            </div>
            <div className="game-result-actions">
              <button className="primary-action" type="button" onClick={challengeSomeone}>CHALLENGE SOMEONE</button>
              <button className="find-secondary-action" type="button" onClick={resetPlacements}>REPLAY</button>
              <button className="find-secondary-action" type="button" onClick={() => navigate("/play")}>ALL GAMES</button>
            </div>
            <p className="game-action-status" role="status">{challengeStatus}</p>
          </div>
        ) : current ? (
          <article className="blind-rank-current">
            <FighterPhoto className="blind-rank-current__photo" name={current.name} src={current.profileUrl || current.thumbUrl} />
            <div>
              <p className="eyebrow">FIGHTER {currentIndex + 1} OF 5</p>
              <h2>{current.name}</h2>
              <p>{compactDivision(current)}</p>
              <strong>Choose an open slot. Once placed, it is locked.</strong>
            </div>
          </article>
        ) : null}
      </section>
    </div>
  );
}
