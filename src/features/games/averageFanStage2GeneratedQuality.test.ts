import { describe, expect, it } from "vitest";
import { ufcFactualExpansion, getUfcFactualSubject, ufcFactualLedgerSubjects } from "../back-room/ufcFactualLedger";
import { queryFootballSubjects } from "../back-room/footballSubjectRegistry";
import {
  AVERAGE_FAN_CONTENT_BANKS,
  averageFanQuestionFactKey,
  ufcCandidates,
  averageFanQuestionNamedTopics,
} from "./averageFanContentBanks";
import { buildAverageFanDailySetup } from "../play/averageFanDailyRuntime";
import { lockedWeightedGameForDay } from "../play/dailyChallengeRotation";
import type { AverageFanQuestion } from "./averageFanEngine";

function nameKey(value: string) {
  return value.replace(/[Łł]/g, "l").replace(/[Øø]/g, "o")
    .replace(/[Đđ]/g, "d").replace(/ß/g, "ss").normalize("NFKD")
    .toLowerCase().replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
}
function naturalDate(date: string) {
  return new Date(date + "T12:00:00Z").toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
  });
}

describe("Stage 2 generated Average Fan source-ledger editorial quality", () => {
  it("reconciles every shared expansion-fighter bout across the two independent ledger records", () => {
    const subjects = ufcFactualExpansion.subjects;
    const lookup = new Map(subjects.map((fighter) => [nameKey(fighter.name), fighter] as const));
    const checked = new Set<string>();
    for (const fighter of subjects) {
      expect(fighter.fights.length, fighter.name).toBeGreaterThan(0);
      expect(fighter.fights.every((fight) =>
        fight.date >= fighter.activeFrom && fight.date <= fighter.activeTo
      ), fighter.name).toBe(true);

      const oneDateOpponent = new Set<string>();
      for (const fight of fighter.fights) {
        const fixture = fight.date + ":" + nameKey(fight.opponent);
        expect(oneDateOpponent.has(fixture), fighter.name + " " + fixture).toBe(false);
        oneDateOpponent.add(fixture);
        const peer = lookup.get(nameKey(fight.opponent));
        if (!peer) continue;
        const pairId = [nameKey(fighter.name), nameKey(peer.name)].sort().join("/") + "@" + fight.date;
        if (checked.has(pairId)) continue;
        checked.add(pairId);
        const returnFight = peer.fights.find((other) =>
          nameKey(other.opponent) === nameKey(fighter.name) && other.date === fight.date
        );
        expect(returnFight, pairId + " reciprocal fight missing").toBeDefined();
        if (!returnFight) continue;
        expect(returnFight.methodCategory, pairId).toBe(fight.methodCategory);
        expect(returnFight.titleFight, pairId).toBe(fight.titleFight);
        expect(returnFight.interimTitleFight, pairId).toBe(fight.interimTitleFight);
        const opposite = { win: "loss", loss: "win", draw: "draw", "no-contest": "no-contest" } as const;
        expect(returnFight.result, pairId).toBe(opposite[fight.result]);
      }
    }
    expect(checked.size).toBeGreaterThanOrEqual(45);
  });

  it("keeps generated CFB player facts bound to the canonical school, position, draft and Heisman ledger", () => {
    const players = new Map(queryFootballSubjects({ league: "CFB", kind: "player-career" })
      .map((player) => [player.id, player] as const));
    const programs = new Map(queryFootballSubjects({ league: "CFB", kind: "program" })
      .map((program) => [program.id, program] as const));
    const generated = AVERAGE_FAN_CONTENT_BANKS.cfb.filter((q) =>
      /^average-fan:cfb:g[1-5]:/.test(q.id));
    let checked = 0;
    for (const question of generated) {
      const match = /^average-fan:cfb:g[1-5]:(.+):([^:]+)$/.exec(question.id);
      expect(match, question.id).toBeTruthy();
      const [, subjectId, template] = match!;
      const player = players.get(subjectId!);
      const program = programs.get(subjectId!);
      expect(player || program, question.id + " missing registry identity").toBeTruthy();
      if (player) {
        if (template === "position" || template === "school-position") {
          expect(question.answer, question.id).toBe(player.position);
          if (template === "school-position") expect(question.prompt, question.id).toContain(player.school);
        }
        if (template === "position-tf") {
          expect(question.explanation, question.id).toContain(player.position);
        }
        if (template === "heisman") {
          expect(question.answer, question.id).toBe(player.heismanWinner ? "True" : "False");
          expect(player.heismanWinner, question.id).not.toBeNull();
          expect(player.heismanWinner, question.id).not.toBeUndefined();
        }
        if (template === "draft-pick" || template === "draft-identity") {
          expect(player.draftYear, question.id).toBeTruthy();
          expect(player.draftPick, question.id).toBeTruthy();
          expect(player.school, question.id).toBeTruthy();
          expect(question.prompt, question.id).toContain(String(player.draftYear));
          expect(question.prompt, question.id).toContain(String(player.draftPick));
          expect(question.prompt, question.id).toContain(player.school);
          expect(question.answer, question.id).toBe(player.name);
        }
      }
      if (program) {
        const year = String(program.conferenceSeason ?? 2025);
        expect(question.prompt, question.id).toContain(year);
        if (template === "conference") expect(question.answer, question.id).toBe(program.conference);
        if (template === "conference-tf") {
          expect(question.explanation, question.id).toContain(program.conference);
        }
        if (template === "conference-program") expect(question.answer, question.id).toBe(program.name);
      }
      checked += 1;
    }
    expect(checked).toBeGreaterThan(40);
  });

  it("ties each selected generated UFC dated-fight clue to its exact official-result ledger row", () => {
    const generated = AVERAGE_FAN_CONTENT_BANKS.ufc.filter((q) =>
      /^average-fan:ufc:g[34]:ufc:[^:]+:(?:opponent|method-win|title-opponent)$/.test(q.id)
    );
    expect(generated.length).toBeGreaterThan(30);
    for (const question of generated) {
      const match = /^average-fan:ufc:g[34]:(ufc:[^:]+):(opponent|method-win|title-opponent)$/.exec(question.id)!;
      const fighter = getUfcFactualSubject(match[1]!);
      expect(fighter, question.id).toBeTruthy();
      const rows = fighter!.fights.filter((fight) =>
        question.prompt.includes(naturalDate(fight.date)) &&
        nameKey(fight.opponent) === nameKey(question.answer));
      expect(rows, question.id + " date + opponent absent").toHaveLength(1);
      const bout = rows[0]!;
      if (match[2] === "opponent") {
        const claimsDefeat = question.prompt.includes(" defeat ");
        expect(claimsDefeat, question.id + " cannot claim a win when sourced bout was a loss")
          .toBe(bout.result === "win");
      }
      if (match[2] === "method-win") {
        expect(bout.result, question.id).toBe("win");
        expect(bout.methodCategory, question.id).not.toBe("other");
      }
      if (match[2] === "title-opponent") expect(bout.titleFight, question.id).toBe(true);
      expect(question.format, question.id).toBe("four-choice");
      const allowed = new Map(ufcFactualLedgerSubjects.map((subject) => [nameKey(subject.name), subject] as const));
      const isWomen = fighter!.gender === "women";
      // The sourced opponent may not be a ledger *subject*. Distractors must
      // still be roster-verified fighters of the same gender as this bout.
      const wrongChoices = question.choices!.filter((choice) =>
        nameKey(choice) !== nameKey(question.answer));
      expect(wrongChoices, question.id).toHaveLength(3);
      for (const choice of wrongChoices) {
        const entry = allowed.get(nameKey(choice));
        expect(entry, question.id + " " + choice).toBeTruthy();
        expect(entry!.gender === "women", question.id + " " + choice).toBe(isWomen);
      }
    }
  });

  it("honors the ranked UFC women's board instead of treating its unprefixed divisions as men's", () => {
    const rankedWomen = ufcFactualLedgerSubjects.filter((fighter) =>
      fighter.scope === "ranked-core" && fighter.gender === "women");
    expect(rankedWomen.length).toBeGreaterThan(10);
    const generated = ufcCandidates();
    for (const fighter of rankedWomen) {
      const division = generated.find((row) =>
        row.id === `average-fan:ufc:g1:${fighter.id}:division`);
      if (!division) continue;
      expect(division.answer, division.id).toMatch(/^Women's /);
      expect(division.choices?.every((choice) => choice.startsWith("Women's ")), division.id).toBe(true);
    }
    // The actual production bug had male contenders on Holly Holm / Nunes
    // female-opponent cards. Keep that impossible even for unselected candidates.
    for (const question of generated.filter((row) =>
      /^average-fan:ufc:g[34]:ufc:[^:]+:(?:opponent|method-win|title-opponent)$/.test(row.id))) {
      const fighterId = /^average-fan:ufc:g[34]:(ufc:[^:]+):/.exec(question.id)![1]!;
      const fighter = getUfcFactualSubject(fighterId)!;
      const peers = ufcFactualLedgerSubjects.filter((subject) => question.choices?.some(
        (choice) => nameKey(choice) === nameKey(subject.name) && nameKey(choice) !== nameKey(question.answer)));
      expect(peers, question.id).toHaveLength(3);
      expect(peers.every((peer) => peer.gender === fighter.gender), question.id).toBe(true);
    }
  });

  it("keeps date-based fighter and finish questions focused on recognizable UFC opponents", () => {
    const recognizable = new Set(ufcFactualLedgerSubjects.map((fighter) => nameKey(fighter.name)));
    const generated = AVERAGE_FAN_CONTENT_BANKS.ufc.filter((row) =>
      /^average-fan:ufc:g[34]:ufc:[^:]+:(?:opponent|method-win)$/.test(row.id));
    expect(generated.length).toBeGreaterThan(20);
    for (const question of generated) {
      expect(recognizable.has(nameKey(question.answer)), question.id + ": obscure fight opponent").toBe(true);
    }
  });

  it("keeps all two-franchise/definition recalls fairly answer-bounded", () => {
    const nfl = AVERAGE_FAN_CONTENT_BANKS.nfl;
    const freezer = nfl.find((row) => row.id.startsWith("average-fan:nfl:00-history:freezer-bowl:"));
    if (freezer) {
      expect(freezer.format).toBe("four-choice");
      expect(freezer.choices).toHaveLength(4);
    }
    const stunt = nfl.find((row) => row.id.startsWith("average-fan:nfl:00-xo:stunt:"));
    if (stunt) {
      expect(stunt.format).toBe("four-choice");
      expect(stunt.choices).toHaveLength(4);
    }
    for (const row of nfl) {
      if (/Which two (?:teams|franchises) played/i.test(row.prompt))
        expect(row.format, row.id).not.toBe("short-answer");
    }
    const proseDefinitions = [
      "play-action", "slot", "hard-count", "kneel", "spike",
      "motion", "bootleg", "bracket", "contain", "stunt",
    ];
    for (const id of proseDefinitions) {
      const question = nfl.find((row) => row.id.startsWith(`average-fan:nfl:00-xo:${id}:`));
      if (question) {
        expect(question.format, id + " requires bounded definitions").toBe("four-choice");
        expect(question.choices, id).toHaveLength(4);
      }
    }
    expect(nfl.some((row) => row.id.startsWith("average-fan:nfl:00-xo:edge-rusher:")))
      .toBe(false);
    const schoolPosition = AVERAGE_FAN_CONTENT_BANKS.cfb.filter((row) =>
      row.id.endsWith(":school-position"));
    for (const row of schoolPosition) expect(row.grade, row.id).toBe(2);
  });

  it("normalizes accented UFC names consistently in board topic diversity", () => {
    const question = AVERAGE_FAN_CONTENT_BANKS.ufc[0]!;
    const decorated = averageFanQuestionNamedTopics({
      ...question, prompt: "Who defeated Jan Błachowicz?", answer: "Alex Pereira",
    });
    const ascii = averageFanQuestionNamedTopics({
      ...question, prompt: "Who defeated Jan Blachowicz?", answer: "Alex Pereira",
    });
    expect(decorated).toContain("ufc:jan blachowicz");
    expect(ascii).toContain("ufc:jan blachowicz");
  });

  it("uses stable symmetric UFC bout identities for accent and ASCII name variants", () => {
    const source = ufcFactualLedgerSubjects.find((fighter) => nameKey(fighter.name) === "janblachowicz");
    const peer = ufcFactualLedgerSubjects.find((fighter) => nameKey(fighter.name) === "dominicreyes" || nameKey(fighter.name) === "dominickreyes");
    expect(source).toBeTruthy();
    expect(peer).toBeTruthy();
    const fight = source!.fights.find((item) => nameKey(item.opponent) === nameKey(peer!.name));
    expect(fight).toBeTruthy();
    const first: AverageFanQuestion = {
      ...AVERAGE_FAN_CONTENT_BANKS.ufc[0]!,
      id: `average-fan:ufc:g4:${source!.id}:method-win`,
      prompt: `Which fighter did ${source!.name} defeat by KO/TKO in the UFC on ${naturalDate(fight!.date)}?`,
      answer: fight!.opponent,
    };
    const second: AverageFanQuestion = {
      ...first,
      id: `average-fan:ufc:g3:${peer!.id}:opponent`,
      prompt: `Which fighter did ${peer!.name} face in the UFC on ${naturalDate(fight!.date)}?`,
      answer: source!.name,
    };
    expect(averageFanQuestionFactKey(first)).toBe(averageFanQuestionFactKey(second));
  });

  it("exposes real future Daily board question/answer ladders for an editorial check", () => {
    const bySport = { nfl: 0, cfb: 0, ufc: 0 };
    for (const scope of ["football", "ufc"] as const) {
      const history: { day: string; sport: "nfl" | "cfb" | "ufc"; question_ids: string[]; final_question_id: string }[] = [];
      for (let offset = 0; offset < 180; offset += 1) {
        const day = new Date(Date.UTC(2026, 9, 16 + offset)).toISOString().slice(0, 10);
        if (lockedWeightedGameForDay(scope, day) !== "average_fan") continue;
        const pub = buildAverageFanDailySetup(scope, day, "stage2-x-future-editorial", history);
        const sport = pub.publicSetup.sport as "nfl" | "cfb" | "ufc";
        const board = pub.privateSetupEvidence.questions as AverageFanQuestion[];
        const final = pub.privateSetupEvidence.final_question as AverageFanQuestion;
        expect(board).toHaveLength(8);
        expect(board.filter((q) => q.grade === 2)).toHaveLength(2);
        expect(board.filter((q) => q.grade === 3)).toHaveLength(2);
        expect(board.filter((q) => q.grade === 4)).toHaveLength(2);
        expect(board.filter((q) => q.grade === 5)).toHaveLength(2);
        const sameFact = [...board, final].map((q) => averageFanQuestionFactKey(q)).filter(Boolean);
        expect(new Set(sameFact).size, scope + day).toBe(sameFact.length);
        if (bySport[sport] < 5) {
          const short = [...board, final].map((q) =>
            `${q.protectedFinal ? "FINAL" : "G" + q.grade}|${q.format}|${q.subject}|${q.prompt}|${q.answer}|${(q.choices ?? []).join("; ")}`
          );
          console.info("STAGE2_FUTURE_BOARD " + sport + " " + day + "\n" + short.join("\n"));
          bySport[sport] += 1;
        }
        history.push({
          day, sport, question_ids: board.map((q) => q.id), final_question_id: final.id,
        });
      }
    }
    expect(bySport).toEqual({ nfl: 5, cfb: 5, ufc: 5 });
  });
});
