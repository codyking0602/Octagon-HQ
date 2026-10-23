import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";
import { buildNbaSportsFeudPack } from "./nbaSportsFeudBank";
import type { FamilyFeudPack } from "../games/familyFeudEngine";

/** Persisted on the account, not in device storage. A reserved board counts as
 * viewed even when the player exits early, so replaying cannot expose it again.
 * No leaderboard score or gameplay progress is written. */
const rotationSchema = z.object({
  main: z.array(z.string()),
  fast: z.array(z.string()),
  runs: z.number().int().nonnegative(),
  cycle: z.number().int().nonnegative(),
});

export async function claimNbaCasualFeudPack(): Promise<FamilyFeudPack> {
  const client = getSupabaseClient();
  if (!client) throw new Error("Account storage is unavailable.");
  // Concurrent tabs may race; the database checks and serializes each reservation.
  for (let attempt = 0; attempt < 4; attempt++) {
    const { data, error } = await client.rpc("get_nba_feud_casual_rotation");
    if (error) throw new Error(error.message);
    const history = rotationSchema.parse(data);
    const usedMain = new Set(history.main.map(id => id.replace(/^nba-feud-/, "")));
    const usedFast = new Set(history.fast.map(id => id.replace(/^nba-feud-/, "")));
    let pack: FamilyFeudPack | null = null;
    let reset = false;

    for (let trial = 0; trial < 128; trial++) {
      const seed = "casual:" + history.cycle + ":" + Math.random().toString(36).slice(2)
        + ":" + attempt + ":" + trial;
      try {
        pack = buildNbaSportsFeudPack(seed, { main: usedMain, fast: usedFast });
        break;
      } catch (caught) {
        if (!(caught instanceof Error) || !caught.message.includes("insufficient distinct editorial topics")) throw caught;
      }
    }

    if (!pack) {
      // Never recycle before the full 20-game/four-month commitment.
      if (history.runs < 20) {
        throw new Error("NBA Feud needs additional unused questions before a repeat-free board is possible.");
      }
      reset = true;
      pack = buildNbaSportsFeudPack("casual:cycle:" + (history.cycle + 1)
        + ":" + Math.random().toString(36).slice(2));
    }
    const main = pack.mainBoards.map(q => q.id);
    const fast = pack.fastMoney.map(q => q.id);
    const result = await client.rpc("reserve_nba_feud_casual_pack", {
      p_main: main, p_fast: fast, p_new_cycle: reset,
    });
    if (result.error) throw new Error(result.error.message);
    if (result.data === true) return pack;
    // A simultaneous session reserved an overlapping board. Reread, reselect.
  }
  throw new Error("A second session changed your Feud rotation. Please try again.");
}
