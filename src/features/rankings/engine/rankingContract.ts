import type { RankingContract } from "./rankingEngine";

/**
 * V2 owns the live scoring and OVR projection contract.
 *
 * These approved values were proven against the sealed migration fixture, but runtime
 * ranking calculation must not read its contract from that historical artifact.
 */
export const rankingContract: RankingContract = {
  categoryMax: 30,
  weights: {
    championship: 35,
    opponentQuality: 25,
    primeDominance: 30,
    longevity: 10,
  },
  ovr: {
    floor: 82,
    ceiling: 99,
    curve: 0.85,
    leaderOnly99: true,
    anchors: {
      men: {
        floorScore: 18.68,
        ceilingScore: 101.92,
      },
      women: {
        floorScore: 25.78,
        ceilingScore: 80.79,
      },
    },
  },
};
