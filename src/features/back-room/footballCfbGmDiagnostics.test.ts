import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("CFB GM private owner diagnostics", () => {
  const read=(path:string)=>readFileSync(path,"utf8");
  const page=read("src/features/back-room/FootballCfbGmPage.tsx");
  const panel=read("src/features/back-room/FootballCfbGmDiagnostics.tsx");
  it("mounts grade-revealing diagnostics exclusively below the owner authorization return",()=>{
    const guard=page.indexOf('identity.profile?.canControlPicks !== true');
    const mount=page.indexOf("<FootballCfbGmDiagnostics run={run} />");
    expect(guard).toBeGreaterThan(0);
    expect(mount).toBeGreaterThan(guard);
    expect(panel).toContain('data-owner-diagnostics="cfb"');
    expect(panel).toContain("OWNER DIAGNOSTICS");
    expect(panel).toContain("CFB_GM_VERSION");
    expect(panel).not.toContain("window.localStorage");
    expect(read("src/features/back-room/FootballGmModePage.tsx")).not.toContain("FootballCfbGmDiagnostics");
  });
  it("keeps the debug grades and seeded CFP calibration separate from immutable public Wheel grades",()=>{
    expect(panel).toContain("player.currentGrade");
    expect(panel).toContain("cfbGmSimulateCollegeSeason");
    expect(panel).toContain("useState(false)");
    expect(panel).not.toContain("gradeProjection");
    expect(panel).not.toContain("writeFileSync");
  });
});
