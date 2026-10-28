import { describe,expect,it } from "vitest";
import { conciseUfcPreview,conciseUfcEdge,isConciseUfcEditorial,wordCount,previewSentences } from "./ufcSpotlightEditorialLimits";
describe("UFC automated editorial limits",()=>{
  it("returns a short readable legacy preview while preserving the first meaningful tactical statements",()=>{
    const long="Moicano's veteran grappling faces Nolan's southpaw striking. Moicano needs the clinch and mat exchanges, with control and back takes available. Nolan has better reach and wants longer striking exchanges. Both need to adapt their tactics as the fight moves into later rounds.";
    const result=conciseUfcPreview(long);
    expect(previewSentences(result)).toHaveLength(3);
    expect(result).not.toContain("later rounds");
  });
  it("keeps original short advantages and compacts overlong stat-based phrases",()=>{
    expect(conciseUfcEdge("Southpaw striking")).toBe("Southpaw striking");
    expect(conciseUfcEdge("11 career submission wins and proven back-taking threat")).toBe("Submission grappling");
    expect(conciseUfcEdge("Four-inch height and one-inch reach advantage against opponent")).toBe("Height and reach");
  });
  it("prevents preproduction ready certification for excessive copy",()=>{
    const good={preview:"Fighter One favors the clinch and wrestling exchanges. Fighter Two must maintain range and score with steady striking.",red:{edges:["Submission grappling"]},blue:{edges:["Southpaw striking"]}};
    expect(isConciseUfcEditorial(good)).toBe(true);
    expect(isConciseUfcEditorial({...good,preview:"Word ".repeat(85)})).toBe(false);
    expect(isConciseUfcEditorial({...good,red:{edges:["The fighter has a long list of many complicated advantages over his opponent inside the cage"]}})).toBe(false);
    expect(wordCount(conciseUfcPreview("A ".repeat(90)))).toBeLessThanOrEqual(70);
  });
});
