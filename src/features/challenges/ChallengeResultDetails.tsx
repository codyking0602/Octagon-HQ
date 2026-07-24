import { getPlayFighter } from "../play/playFighterPool";
import type { ChallengeJson, PlayChallenge } from "./challengeModel";

function recordField(value: ChallengeJson, key: string): ChallengeJson | undefined {
  if (!value || Array.isArray(value) || typeof value !== "object") return undefined;
  return value[key];
}

function stringIds(value: ChallengeJson, key: string) {
  const field = recordField(value, key);
  return Array.isArray(field) ? field.filter((id): id is string => typeof id === "string") : [];
}

function fighterName(id: string) {
  return getPlayFighter(id)?.name ?? id;
}

function NameList({ title, ids }: { title: string; ids: readonly string[] }) {
  return (
    <section className="challenge-comparison__list">
      <header><span>{title}</span><strong>{ids.length}</strong></header>
      {ids.length ? (
        <div>{ids.map((id) => <span key={id}>{fighterName(id)}</span>)}</div>
      ) : <p>None</p>}
    </section>
  );
}

function BlindRankComparison({ challenge }: { challenge: PlayChallenge }) {
  const creator = stringIds(challenge.creatorResult, "placements");
  const responder = stringIds(challenge.responderResult, "placements");
  const matches = creator.filter((id, index) => responder[index] === id).length;

  return (
    <section className="challenge-comparison">
      <header className="challenge-comparison__headline">
        <span>EXACT SLOT MATCHES</span><strong>{matches}/5</strong>
      </header>
      <div className="challenge-comparison__rankings">
        <section><header>SENDER</header>{creator.map((id, index) => <div key={id}><b>#{index + 1}</b><span>{fighterName(id)}</span></div>)}</section>
        <section><header>RESPONDER</header>{responder.map((id, index) => <div key={id}><b>#{index + 1}</b><span>{fighterName(id)}</span></div>)}</section>
      </div>
    </section>
  );
}

function KeepCutComparison({ challenge }: { challenge: PlayChallenge }) {
  const lineup = stringIds(challenge.setup, "lineupIds");
  const creatorKept = new Set(stringIds(challenge.creatorResult, "keptIds"));
  const responderKept = new Set(stringIds(challenge.responderResult, "keptIds"));
  const bothKept = lineup.filter((id) => creatorKept.has(id) && responderKept.has(id));
  const bothCut = lineup.filter((id) => !creatorKept.has(id) && !responderKept.has(id));
  const splits = lineup.filter((id) => creatorKept.has(id) !== responderKept.has(id));
  const sameCalls = bothKept.length + bothCut.length;

  return (
    <section className="challenge-comparison">
      <header className="challenge-comparison__headline">
        <span>SAME CALLS</span><strong>{sameCalls}/8</strong>
      </header>
      <div className="challenge-comparison__groups">
        <NameList title="BOTH KEPT" ids={bothKept} />
        <NameList title="BOTH CUT" ids={bothCut} />
        <NameList title="SPLIT DECISIONS" ids={splits} />
      </div>
    </section>
  );
}

function BetterThanComparison({ challenge }: { challenge: PlayChallenge }) {
  const creator = stringIds(challenge.creatorResult, "selectionIds");
  const responder = stringIds(challenge.responderResult, "selectionIds");
  const creatorSet = new Set(creator);
  const responderSet = new Set(responder);
  const shared = creator.filter((id) => responderSet.has(id));
  const creatorOnly = creator.filter((id) => !responderSet.has(id));
  const responderOnly = responder.filter((id) => !creatorSet.has(id));
  const denominator = Math.max(creator.length, responder.length, 1);
  const overlap = Math.round((shared.length / denominator) * 100);

  return (
    <section className="challenge-comparison">
      <header className="challenge-comparison__headline">
        <span>LIST OVERLAP</span><strong>{overlap}%</strong>
      </header>
      <div className="challenge-comparison__groups">
        <NameList title="SHARED NAMES" ids={shared} />
        <NameList title="SENDER ONLY" ids={creatorOnly} />
        <NameList title="RESPONDER ONLY" ids={responderOnly} />
      </div>
    </section>
  );
}

export function ChallengeResultDetails({ challenge }: { challenge: PlayChallenge }) {
  if (challenge.gameId === "blind-rank") return <BlindRankComparison challenge={challenge} />;
  if (challenge.gameId === "keep-cut") return <KeepCutComparison challenge={challenge} />;
  if (challenge.gameId === "better-than") return <BetterThanComparison challenge={challenge} />;
  return null;
}
