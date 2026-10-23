import { nbaAverageFanExpansionG2 as g2 } from "./nbaAverageFanExpansionG2";
import { nbaAverageFanExpansionG3 as g3 } from "./nbaAverageFanExpansionG3";
import { nbaAverageFanExpansionG4 as g4 } from "./nbaAverageFanExpansionG4";
import { nbaAverageFanExpansionG5 as g5 } from "./nbaAverageFanExpansionG5";
import { nbaAverageFanExpansionG5History as h5 } from "./nbaAverageFanExpansionG5History";
import { nbaAverageFanExpansionG5Iq as iq5 } from "./nbaAverageFanExpansionG5Iq";
import { nbaAverageFanExpansionG5IqExtras as ie5 } from "./nbaAverageFanExpansionG5IqExtras";
import { nbaAverageFanExpansionFinalA as fa } from "./nbaAverageFanExpansionFinalA";
import { nbaAverageFanExpansionFinalB as fb } from "./nbaAverageFanExpansionFinalB";
import { nbaAverageFanExpansionFinalC as fc } from "./nbaAverageFanExpansionFinalC";

export const nbaAverageFanFourMonthExpansion = {
  "2": g2, "3": g3, "4": g4, "5": [...g5, ...h5, ...iq5, ...ie5],
  final: [...fa, ...fb, ...fc],
} as const;
