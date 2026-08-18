import { HIT_THE_NUMBER_STATS } from "../play/hitTheNumberEngine";
import { getPlayFighter } from "../play/playFighterPool";
import { resultScore, type ChallengeJson, type PlayChallenge } from "./challengeModel";

interface NamedChoice {
  id: string;
  name: string;
}

interface HitNumberSelection {
  fighterId: string;
  value: number;
}

function record(value: ChallengeJson): { [key: string]: ChallengeJson } | null {
  return value && !Array.isArray(value) && typeof value === "object" ? value : null;
}

function strings(value: ChallengeJson) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function numbers(value: ChallengeJson) {
  return Array.isArray(value) ? value.filter((item): item is number => typeof item === "number" && Number.isFinite(item)) : [];
}

function namedChoices(value: ChallengeJson): NamedChoice[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const row = record(item);
    return row && typeof row.id === "string" && typeof row.name === "string"
      ? [{ id: row.id, name: row.name }]
      : [];
  });
}

function hitNumberSelections(value: ChallengeJson): HitNumberSelection[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const row = record(item);
    return row
      && typeof row.fighterId === "string"
      && typeof row.value === "number"
      && Number.isFinite(row.value)
      ? [{ fighterId: row.fighterId, value: row.value }]
      : [];
  });
}

function nameMap(value: ChallengeJson) {
  return new Map(namedChoices(value).map((item) => [item.id, item.name]));
}

function scoreVerdict(challenge: PlayChallenge, creatorName: string, responderName: string) {
  const creatorScore = resultScore(challenge.creatorResult);
  const responderScore = resultScore(challenge.responderResult);
  if (creatorScore === null || responderScore === null) return "Matchup complete";
  if (creatorScore === responderScore) return "Tie game";
  return creatorScore > responderScore ? `${creatorName} wins` : `${responderName} wins`;
}

function overlapCount(left: readonly string[], right: readonly string[]) {
  const rightSet = new Set(right);
  return left.filter((value) => rightSet.has(value)).length;
}

function keepCutLineup(challenge: PlayChallenge) {
  const setup = record(challenge.setup);
  const legacy = namedChoices(setup?.lineup ?? null);
  const legacyNames = new Map(legacy.map((fighter) => [fighter.id, fighter.name]));
  const lineupIds = strings(setup?.lineupIds ?? null);
  return lineupIds.length > 0
    ? lineupIds.map((id) => ({ id, name: getPlayFighter(id)?.name ?? legacyNames.get(id) ?? id }))
    : legacy;
}

function keepCutDecisions(result: ChallengeJson, lineupIds: readonly string[]) {
  const row = record(result);
  const legacyDecisions = strings(row?.decisions ?? null);
  if (legacyDecisions.length === lineupIds.length) return legacyDecisions;
  const keptIds = new Set(strings(row?.keptIds ?? null));
  return lineupIds.map((id) => keptIds.has(id) ? "keep" : "cut");
}

export function challengeResultVerdict(
  challenge: PlayChallenge,
  creatorName: string,
  responderName: string,
) {
  const creator = record(challenge.creatorResult);
  const responder = record(challenge.responderResult);

  if (challenge.gameId === "blind-rank") {
    const creatorPlacements = strings(creator?.placements ?? null);
    const responderPlacements = strings(responder?.placements ?? null);
    const exactSlots = creatorPlacements.filter((fighterId, index) => responderPlacements[index] === fighterId).length;
    return `${exactSlots} of 5 slots matched`;
  }

  if (challenge.gameId === "keep-cut") {
    if (resultScore(challenge.creatorResult) !== null && resultScore(challenge.responderResult) !== null) {
      return scoreVerdict(challenge, creatorName, responderName);
    }
    const lineupIds = keepCutLineup(challenge).map((fighter) => fighter.id);
    const creatorDecisions = keepCutDecisions(challenge.creatorResult, lineupIds);
    const responderDecisions = keepCutDecisions(challenge.responderResult, lineupIds);
    const matches = creatorDecisions.filter((choice, index) => responderDecisions[index] === choice).length;
    return `${matches} of 8 calls matched`;
  }

  if (challenge.gameId === "better-than") {
    const creatorIds = namedChoices(creator?.selections ?? null).map((item) => item.id);
    const responderIds = namedChoices(responder?.selections ?? null).map((item) => item.id);
    return `${overlapCount(creatorIds, responderIds)} shared names`;
  }

  return scoreVerdict(challenge, creatorName, responderName);
}

export function challengeResultScoreLabel(challenge: PlayChallenge, result: ChallengeJson) {
  const row = record(result);
  const score = resultScore(result);
  if (challenge.gameId === "wavelength") return score === null ? "DONE" : String(score);
  if (challenge.gameId === "blind-resume") {
    if (score === null) return "DONE";
    if (challenge.gameVersion !== "blind-resume-v3") return `${score}/5`;
    const resultRecord = record(row?.record ?? null);
    const wins = typeof resultRecord?.wins === "number" ? resultRecord.wins : null;
    const losses = typeof resultRecord?.losses === "number" ? resultRecord.losses : null;
    return wins !== null && losses !== null ? `${score}/100 · ${wins}-${losses}` : `${score}/100`;
  }
  if (challenge.gameId === "find-leader") return score === null ? "DONE" : `${score}/10`;
  if (challenge.gameId === "blind-rank") return `${strings(row?.placements ?? null).length}/5`;
  if (challenge.gameId === "keep-cut") return score === null ? `${strings(row?.decisions ?? null).length}/8` : `${score}/100`;
  if (challenge.gameId === "better-than") {
    const count = typeof row?.claimCount === "number" ? row.claimCount : namedChoices(row?.selections ?? null).length;
    return `${count} NAMES`;
  }
  if (challenge.gameId === "hit-the-number") {
    const total = typeof row?.total === "number" && Number.isFinite(row.total) ? row.total : null;
    return total === null ? (score === null ? "DONE" : `${score}/100`) : String(total);
  }
  return "DONE";
}

function FindLeaderDetails({ challenge, creatorName, responderName }: DetailProps) {
  const setup = record(challenge.setup);
  const board = record(setup?.board ?? null);
  const candidates = namedChoices(board?.candidates ?? null);
  const names = new Map(candidates.map((fighter) => [fighter.id, fighter.name]));
  const leaderId = typeof board?.leaderId === "string" ? board.leaderId : "";

  function Path({ label, name, result }: { label: string; name: string; result: ChallengeJson }) {
    const row = record(result);
    const eliminated = strings(row?.eliminated ?? null);
    const fatalId = typeof row?.fatalId === "string" ? row.fatalId : null;
    return (
      <article className="challenge-detail-card">
        <header><span><small>{label}</small><strong>{name}</strong></span><b>{challengeResultScoreLabel(challenge, result)}</b></header>
        <div className="challenge-detail-label">ELIMINATION ORDER</div>
        <ol className="challenge-choice-list">
          {eliminated.map((fighterId, index) => (
            <li className={fighterId === fatalId ? "is-fatal" : ""} key={`${fighterId}-${index}`}>
              <span>{index + 1}</span><strong>{names.get(fighterId) ?? fighterId}</strong><em>{fighterId === fatalId ? "LEADER" : "SAFE"}</em>
            </li>
          ))}
        </ol>
        <p>{row?.perfect === true
          ? `Left ${names.get(leaderId) ?? "the leader"} standing.`
          : fatalId
            ? `Run ended on ${names.get(fatalId) ?? fatalId}.`
            : "Detailed history unavailable."}</p>
      </article>
    );
  }

  return challenge.responderResult ? (
    <div className="challenge-detail-columns">
      <Path label="SENDER PATH" name={creatorName} result={challenge.creatorResult} />
      <Path label="RESPONDER PATH" name={responderName} result={challenge.responderResult} />
    </div>
  ) : null;
}

function WavelengthDetails({ challenge, creatorName, responderName }: DetailProps) {
  const setup = record(challenge.setup);
  const target = typeof setup?.target === "number" ? setup.target : null;

  function Path({ label, name, result }: { label: string; name: string; result: ChallengeJson }) {
    const row = record(result);
    const guesses = numbers(row?.guesses ?? null);
    return (
      <article className="challenge-detail-card">
        <header><span><small>{label}</small><strong>{name}</strong></span><b>{challengeResultScoreLabel(challenge, result)}</b></header>
        <div className="challenge-number-path" aria-label={`${name} guess path`}>
          {guesses.map((guess, index) => <span key={`${guess}-${index}`}><small>G{index + 1}</small><strong>{guess}</strong></span>)}
        </div>
        <p>Final guess {guesses.at(-1) ?? "—"}{target === null ? "" : ` · target ${target}`}.</p>
      </article>
    );
  }

  return challenge.responderResult ? (
    <div className="challenge-detail-columns">
      <Path label="SENDER PATH" name={creatorName} result={challenge.creatorResult} />
      <Path label="RESPONDER PATH" name={responderName} result={challenge.responderResult} />
    </div>
  ) : null;
}

function BlindResumeDetails({ challenge, creatorName, responderName }: DetailProps) {
  const setup = record(challenge.setup);
  const rounds = Array.isArray(setup?.rounds) ? setup.rounds : [];
  const creator = record(challenge.creatorResult);
  const responder = record(challenge.responderResult);
  const creatorPicks = Array.isArray(creator?.picks) ? creator.picks : [];
  const responderPicks = Array.isArray(responder?.picks) ? responder.picks : [];

  return (
    <div className="challenge-round-comparison">
      <header><span>ROUND</span><strong>{creatorName}</strong><strong>{responderName}</strong><em>MODEL</em></header>
      {rounds.map((item, index) => {
        const round = record(item);
        const fighterA = record(round?.fighterA ?? null);
        const fighterB = record(round?.fighterB ?? null);
        const names = new Map([
          [typeof fighterA?.id === "string" ? fighterA.id : "a", typeof fighterA?.name === "string" ? fighterA.name : "Fighter A"],
          [typeof fighterB?.id === "string" ? fighterB.id : "b", typeof fighterB?.name === "string" ? fighterB.name : "Fighter B"],
        ]);
        const creatorPick = record(creatorPicks[index] ?? null);
        const responderPick = record(responderPicks[index] ?? null);
        const winnerId = typeof round?.winnerId === "string" ? round.winnerId : "";
        return (
          <div key={`round-${index}`}>
            <span>R{index + 1}</span>
            <strong>{names.get(typeof creatorPick?.pickedId === "string" ? creatorPick.pickedId : "") ?? "—"}</strong>
            <strong>{names.get(typeof responderPick?.pickedId === "string" ? responderPick.pickedId : "") ?? "—"}</strong>
            <em>{names.get(winnerId) ?? "—"}</em>
          </div>
        );
      })}
    </div>
  );
}

function BlindRankDetails({ challenge, creatorName, responderName }: DetailProps) {
  const setup = record(challenge.setup);
  const names = nameMap(setup?.lineup ?? null);
  const creator = record(challenge.creatorResult);
  const responder = record(challenge.responderResult);
  const creatorPlacements = strings(creator?.placements ?? null);
  const responderPlacements = strings(responder?.placements ?? null);

  return (
    <div className="challenge-ranking-comparison">
      <header><span>RANK</span><strong>{creatorName}</strong><strong>{responderName}</strong></header>
      {[0, 1, 2, 3, 4].map((index) => (
        <div className={creatorPlacements[index] === responderPlacements[index] ? "is-match" : ""} key={index}>
          <span>#{index + 1}</span>
          <strong>{names.get(creatorPlacements[index] ?? "") ?? "—"}</strong>
          <strong>{names.get(responderPlacements[index] ?? "") ?? "—"}</strong>
        </div>
      ))}
    </div>
  );
}

function KeepCutDetails({ challenge, creatorName, responderName }: DetailProps) {
  const lineup = keepCutLineup(challenge);
  const lineupIds = lineup.map((fighter) => fighter.id);
  const creatorDecisions = keepCutDecisions(challenge.creatorResult, lineupIds);
  const responderDecisions = keepCutDecisions(challenge.responderResult, lineupIds);

  return (
    <div className="challenge-call-comparison">
      <header><span>FIGHTER</span><strong>{creatorName}</strong><strong>{responderName}</strong></header>
      {lineup.map((fighter, index) => (
        <div className={creatorDecisions[index] === responderDecisions[index] ? "is-match" : ""} key={fighter.id}>
          <span>{fighter.name}</span>
          <strong className={`is-${creatorDecisions[index] ?? "none"}`}>{creatorDecisions[index]?.toUpperCase() ?? "—"}</strong>
          <strong className={`is-${responderDecisions[index] ?? "none"}`}>{responderDecisions[index]?.toUpperCase() ?? "—"}</strong>
        </div>
      ))}
    </div>
  );
}

function BetterThanDetails({ challenge, creatorName, responderName }: DetailProps) {
  const creator = record(challenge.creatorResult);
  const responder = record(challenge.responderResult);
  const creatorList = namedChoices(creator?.selections ?? null);
  const responderList = namedChoices(responder?.selections ?? null);
  const creatorIds = new Set(creatorList.map((fighter) => fighter.id));
  const responderIds = new Set(responderList.map((fighter) => fighter.id));
  const shared = creatorList.filter((fighter) => responderIds.has(fighter.id));
  const creatorOnly = creatorList.filter((fighter) => !responderIds.has(fighter.id));
  const responderOnly = responderList.filter((fighter) => !creatorIds.has(fighter.id));

  function List({ title, rows }: { title: string; rows: NamedChoice[] }) {
    return <section className="challenge-name-list"><header><span>{title}</span><strong>{rows.length}</strong></header>{rows.map((fighter) => <div key={fighter.id}>{fighter.name}</div>)}</section>;
  }

  return (
    <div className="challenge-better-than-comparison">
      <List title="SHARED NAMES" rows={shared} />
      <div className="challenge-detail-columns">
        <List title={`${creatorName.toUpperCase()} ONLY`} rows={creatorOnly} />
        <List title={`${responderName.toUpperCase()} ONLY`} rows={responderOnly} />
      </div>
    </div>
  );
}

function HitTheNumberDetails({ challenge, creatorName, responderName }: DetailProps) {
  const outerSetup = record(challenge.setup);
  const setup = record(outerSetup?.publicSetup ?? null) ?? outerSetup;
  const target = typeof setup?.target === "number" && Number.isFinite(setup.target) ? setup.target : null;
  const pickCount = typeof setup?.pickCount === "number" && Number.isFinite(setup.pickCount) ? setup.pickCount : null;
  const statId = typeof setup?.statId === "string" ? setup.statId : "";
  const statLabel = HIT_THE_NUMBER_STATS.find((stat) => stat.id === statId)?.label ?? "UFC stat";

  function Path({ label, name, result }: { label: string; name: string; result: ChallengeJson }) {
    const row = record(result);
    const total = typeof row?.total === "number" && Number.isFinite(row.total) ? row.total : null;
    const distance = typeof row?.distance === "number" && Number.isFinite(row.distance) ? row.distance : null;
    const score = resultScore(result);
    const status = typeof row?.status === "string" ? row.status : "";
    const selections = hitNumberSelections(row?.selections ?? null);
    const resultLine = status === "perfect"
      ? "EXACT HIT"
      : status === "bust"
        ? `BUST${distance === null ? "" : ` · ${distance} OVER`}`
        : distance === null
          ? "FINAL"
          : `${distance} AWAY`;

    return (
      <article className="challenge-detail-card">
        <header>
          <span><small>{label}</small><strong>{name}</strong></span>
          <b>{total ?? "—"}</b>
        </header>
        <div className="challenge-detail-label">PICKS · {statLabel.toUpperCase()}</div>
        <ol className="challenge-choice-list" aria-label={`${name} picks`}>
          {selections.map((selection, index) => (
            <li key={`${selection.fighterId}-${index}`}>
              <span>{index + 1}</span>
              <strong>{getPlayFighter(selection.fighterId)?.name ?? selection.fighterId}</strong>
              <em>{selection.value}</em>
            </li>
          ))}
        </ol>
        <p>{resultLine}{score === null ? "" : ` · GAME SCORE ${score}/100`}</p>
      </article>
    );
  }

  return challenge.responderResult ? (
    <div className="challenge-better-than-comparison">
      <section className="challenge-game-banner" aria-label="Hit the Number target">
        <span>TARGET</span>
        <strong>{target ?? "—"}</strong>
        <small>{statLabel.toUpperCase()}{pickCount === null ? "" : ` · PICK ${pickCount}`} · CLOSEST WITHOUT GOING OVER</small>
      </section>
      <div className="challenge-detail-columns">
        <Path label="SENDER" name={creatorName} result={challenge.creatorResult} />
        <Path label="RESPONDER" name={responderName} result={challenge.responderResult} />
      </div>
    </div>
  ) : null;
}

interface DetailProps {
  challenge: PlayChallenge;
  creatorName: string;
  responderName: string;
}

export function ChallengeResultDetails(props: DetailProps) {
  if (!props.challenge.responderResult) return null;
  if (props.challenge.gameId === "find-leader") return <FindLeaderDetails {...props} />;
  if (props.challenge.gameId === "wavelength") return <WavelengthDetails {...props} />;
  if (props.challenge.gameId === "blind-resume") return <BlindResumeDetails {...props} />;
  if (props.challenge.gameId === "blind-rank") return <BlindRankDetails {...props} />;
  if (props.challenge.gameId === "keep-cut") return <KeepCutDetails {...props} />;
  if (props.challenge.gameId === "better-than") return <BetterThanDetails {...props} />;
  if (props.challenge.gameId === "hit-the-number") return <HitTheNumberDetails {...props} />;
  return null;
}
