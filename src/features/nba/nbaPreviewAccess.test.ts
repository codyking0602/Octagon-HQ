import { describe,expect,it } from "vitest";
import { canPreviewNba,NBA_PUBLIC_ENABLED } from "./nbaPreviewAccess";
describe("NBA owner preview access",()=>{
  it("is closed for public launch",()=>{expect(NBA_PUBLIC_ENABLED).toBe(false)});
  it("only allows the established owner profile",()=>{
    expect(canPreviewNba({displayName:"CODY",canControlPicks:true})).toBe(true);
    expect(canPreviewNba({displayName:"CODY",canControlPicks:false})).toBe(false);
    expect(canPreviewNba({displayName:"SHANE",canControlPicks:true})).toBe(false);
    expect(canPreviewNba(null)).toBe(false);
  });
});
