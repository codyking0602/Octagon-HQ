import { describe,expect,it } from "vitest";
import { canPreviewNba,NBA_PUBLIC_ENABLED } from "./nbaPreviewAccess";
describe("NBA public launch",()=>{
  it("is open to everyone",()=>{
    expect(NBA_PUBLIC_ENABLED).toBe(true);
    expect(canPreviewNba({displayName:"CODY",canControlPicks:true})).toBe(true);
    expect(canPreviewNba({displayName:"SHANE",canControlPicks:false})).toBe(true);
    expect(canPreviewNba(null)).toBe(true);
  });
});
