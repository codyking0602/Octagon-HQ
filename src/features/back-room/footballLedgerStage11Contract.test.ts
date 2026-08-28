import fs from "node:fs";
import { describe, expect, it } from "vitest";
import {
  FOOTBALL_LEDGER_AUDIT_LEAGUES,
  FOOTBALL_LEDGER_NON_PLAYER_POOL_CONTRACTS,
  FOOTBALL_LEDGER_PLAYER_POOL_CONTRACTS,
} from "./footballLedgerAuditContract";

describe("Football Ledger Stage 11 census/stat contract", () => {
  it("uses the same nine player pools for NFL and CFB without a generic defense pool", () => {
    expect(FOOTBALL_LEDGER_AUDIT_LEAGUES).toEqual(["NFL", "CFB"]);
    expect(FOOTBALL_LEDGER_PLAYER_POOL_CONTRACTS.map((pool) => pool.id)).toEqual([
      "qb",
      "rb",
      "wr",
      "te",
      "ol",
      "dl-edge",
      "lb",
      "secondary",
      "k-p",
    ]);
    expect(FOOTBALL_LEDGER_PLAYER_POOL_CONTRACTS.map((pool) => pool.label)).toContain("DL / EDGE");
    expect(FOOTBALL_LEDGER_PLAYER_POOL_CONTRACTS.map((pool) => pool.label)).toContain("Secondary");
    expect(FOOTBALL_LEDGER_PLAYER_POOL_CONTRACTS.some((pool) => pool.label === "Defense")).toBe(false);
  });

  it("requires the same non-player entity families in both leagues", () => {
    const expected = ["team-seasons", "organization", "head-coaches", "eras-dynasties", "notable-games"];
    expect(FOOTBALL_LEDGER_NON_PLAYER_POOL_CONTRACTS.NFL.map((pool) => pool.id)).toEqual(expected);
    expect(FOOTBALL_LEDGER_NON_PLAYER_POOL_CONTRACTS.CFB.map((pool) => pool.id)).toEqual(expected);
    expect(FOOTBALL_LEDGER_NON_PLAYER_POOL_CONTRACTS.NFL.find((pool) => pool.id === "organization")?.label).toBe("Franchises");
    expect(FOOTBALL_LEDGER_NON_PLAYER_POOL_CONTRACTS.CFB.find((pool) => pool.id === "organization")?.label).toBe("Programs");
  });

  it("locks the recognition-vs-facts rule and the agreed game-useful stat concepts", () => {
    const audit = fs.readFileSync("docs/football-ledger-stage11-census-and-stat-contracts.md", "utf8");
    expect(audit).toContain("Recognition evidence decides who belongs. Factual/stat sources decide what is true about them.");
    expect(audit).toContain("first-team All-Conference");
    expect(audit).toContain("turnovers and turnover margin");
    expect(audit).toContain("SRS and SOS");
    expect(audit).toContain("secondary/back-end dimensions");
    expect(audit).toContain("27,237");
    expect(audit).toContain("Jermaine Gresham");
    expect(audit).toContain("Mark Andrews");
  });

  it("locks the revised 15-stage roadmap and makes recognizability the next owner", () => {
    const roadmap = fs.readFileSync("docs/football-knowledge-ledger.md", "utf8");
    expect(roadmap).toContain("roadmap is now **15 stages**");
    expect(roadmap).toContain("Stage 11 — Full Ledger Census + Stat Contracts");
    expect(roadmap).toContain("Stage 12 — Recognizability Universe");
    expect(roadmap).toContain("Stage 13 — Factual Universe");
    expect(roadmap).toContain("Stage 14 — Game Integration");
    expect(roadmap).toContain("Stage 15 — Cleanup + Final Release Audit");
    expect(roadmap).toContain("There is **no arbitrary A-C quota**");
    expect(roadmap).not.toContain("### PR 11 — Blind Resume deep factual generation + remaining factual consumers — NEXT");
  });
});
