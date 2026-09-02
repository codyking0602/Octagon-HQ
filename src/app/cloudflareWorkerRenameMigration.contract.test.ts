import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(".github/workflows/rename-cloudflare-worker.yml", "utf8");

describe("Cloudflare Worker rename migration", () => {
  it("renames the existing production Worker in place without deploying or tolerating duplicates", () => {
    expect(workflow).toContain('"https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/workers/workers"');
    expect(workflow).toContain("--request PATCH");
    expect(workflow).toContain("--data '{\"name\":\"the\"}'");
    expect(workflow).toContain('"$api_base/octagon"');
    expect(workflow).toContain("Both octagon and the already exist; refusing to choose an owner.");
    expect(workflow).toContain("Expected the=200 and octagon=404");
    expect(workflow).not.toContain("wrangler deploy");
  });

  it("uses parser-safe JSON checks after the production shell heredoc failure", () => {
    expect(workflow).toContain("jq -e '.success == true and .result.name == \"the\"'");
    expect(workflow).not.toContain("<<'NODE'");
    expect(workflow).not.toContain('<<"NODE"');
  });

  it("runs automatically only when the one-time migration workflow lands on main", () => {
    expect(workflow).toContain("branches:\n      - main");
    expect(workflow).toContain('paths:\n      - ".github/workflows/rename-cloudflare-worker.yml"');
  });
});
