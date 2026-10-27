import { describe, expect, it } from "vitest";
import oct26 from "../../../data/curated/football/nfl/wheel-nfl-current-ability-revisions-2026-10-26.json";
import oct27Qbs from "../../../data/curated/football/nfl/wheel-nfl-current-ability-revisions-2026-10-27.json";
import oct27Skill from "../../../data/curated/football/nfl/wheel-nfl-skill-and-qb-ability-revisions-2026-10-27.json";
import oldQb from "../../../data/generated/football/wheel-nfl-qb-grades-2026-10-03.json";
import oldRb from "../../../data/generated/football/wheel-nfl-rb-grades-2026-10-03.json";
import oldWr from "../../../data/generated/football/wheel-nfl-wr-grades-2026-10-03.json";
import currentQb from "../../../data/generated/football/wheel-nfl-qb-grades-2026-10-27.json";
import currentRb from "../../../data/generated/football/wheel-nfl-rb-grades-2026-10-27.json";
import currentWr from "../../../data/generated/football/wheel-nfl-wr-grades-2026-10-27.json";
import contracts from "../../../data/generated/football/wheel-nfl-gm-contracts-2026-10-05.json";
import profiles from "../../../data/curated/football/gm-nfl-development-profiles-2026-10-07.json";
import { WHEEL_NFL_GM_AUTHORITY } from "./wheelFootballNflCurrentAuthority";
import { FOOTBALL_GM_PLAYER_POOL, FOOTBALL_GM_CURRENT_PLAYER_POOL, footballGmPlayerById, footballGmProjectedGradeForPlayer } from "./footballGmEngine";
import { NFL_GM_LONG_BY_ID } from "./footballGmLongCatalog";

const revisions = [...oct26.changes, ...oct27Qbs.changes, ...oct27Skill.changes];
const families = [
  ["QB",oldQb,currentQb],
  ["RB",oldRb,currentRb],
  ["WR",oldWr,currentWr],
] as const;

describe("NFL current Wheel grade authority propagates to new Short and Long GM candidates",()=>{
  it("includes the 12 Oct 27 approvals plus Stroud, and updates no other grade",()=>{
    expect(oct27Qbs.changes).toHaveLength(5);
    expect(oct27Skill.changes).toHaveLength(7);
    expect(revisions).toHaveLength(13);
    for(const [family,oldArtifact,artifact] of families){
      expect(artifact.version).toContain("2026-10-27-current-ability");
      expect(artifact.grades).toHaveLength(oldArtifact.grades.length);
      expect(artifact.grades.map(row=>row.team+"|"+row.player))
        .toEqual(oldArtifact.grades.map(row=>row.team+"|"+row.player));
      const changed = revisions.filter(row=>row.family===family);
      expect(artifact.revisions).toHaveLength(changed.length);
      for(let index=0;index<artifact.grades.length;index++){
        const before=oldArtifact.grades[index]!, after=artifact.grades[index]!;
        const updated=changed.find(row=>row.team===before.team&&row.player===before.player);
        expect(after.grade, before.team+" "+before.player).toBe(updated?.newGrade ?? before.grade);
        if(updated)expect(before.grade).toBe(updated.oldGrade);
      }
    }
  });
  it("binds the updated source files, retaining original GM identity, salary and development populations",()=>{
    expect(WHEEL_NFL_GM_AUTHORITY.gradeFiles).toMatchObject({
      QB:"wheel-nfl-qb-grades-2026-10-27.json",
      RB:"wheel-nfl-rb-grades-2026-10-27.json",
      WR:"wheel-nfl-wr-grades-2026-10-27.json"
    });
    expect(FOOTBALL_GM_PLAYER_POOL).toHaveLength(594);
    expect(FOOTBALL_GM_CURRENT_PLAYER_POOL).toHaveLength(591);
    expect(contracts.players).toHaveLength(594);
    expect(profiles.profiles).toHaveLength(594);
    const expected = new Map(revisions.map(row=>[
      row.team+"|"+row.family+"|"+row.player,
      row.newGrade
    ]));
    for(const contract of contracts.players){
      const player=FOOTBALL_GM_PLAYER_POOL.find(row=>row.team===contract.team &&
        row.family===contract.family&&row.name===contract.player);
      expect(player,contract.player).toBeDefined();
      expect(player!.salaryApy).toBe(contract.salaryApy);
      expect(profiles.profiles.some(profile=>profile.id===player!.id)).toBe(true);
      const grade=expected.get(contract.team+"|"+contract.family+"|"+contract.player);
      if(grade!==undefined){
        expect(player!.currentGrade).toBe(grade);
        expect(footballGmPlayerById(player!.id)?.currentGrade).toBe(grade);
        expect(NFL_GM_LONG_BY_ID.get(player!.id)?.currentGrade).toBe(grade);
        expect(footballGmProjectedGradeForPlayer(player!,1,"brand-new-gm-run")).toBe(grade);
      }
    }
    expect(new Set(FOOTBALL_GM_PLAYER_POOL.map(row=>row.id)).size).toBe(594);
  });
});
