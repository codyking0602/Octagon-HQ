import { WAVELENGTH_CONTRACT_VERSIONS, wavelengthScore, type WavelengthClue, type WavelengthRound } from "./wavelengthEngine";

export interface WavelengthOfficialMaterializedSetup {
  gameId: "wavelength";
  target: number;
  clues: readonly WavelengthClue[];
  versions: typeof WAVELENGTH_CONTRACT_VERSIONS;
}

export interface WavelengthOfficialPreRevealProjection {
  gameId: "wavelength";
  clueCount: number;
  currentClue: Pick<WavelengthClue, "id" | "category" | "text">;
  versions: typeof WAVELENGTH_CONTRACT_VERSIONS;
}

export interface WavelengthOfficialRevealProjection {
  gameId: "wavelength";
  target: number;
  revealedClues: readonly Pick<WavelengthClue, "id" | "category" | "text">[];
  finalScore?: number;
  versions: typeof WAVELENGTH_CONTRACT_VERSIONS;
}

export type WavelengthOfficialProjectionRequest =
  | { stage: "pre-reveal"; currentClueIndex: number }
  | { stage: "reveal"; finalGuess?: number };

export function materializeWavelengthOfficialSetup(round: WavelengthRound): WavelengthOfficialMaterializedSetup {
  return {
    gameId: "wavelength",
    target: round.target,
    clues: round.clues,
    versions: round.versions ?? WAVELENGTH_CONTRACT_VERSIONS,
  };
}

function publicClue(clue: WavelengthClue): Pick<WavelengthClue, "id" | "category" | "text"> {
  return { id: clue.id, category: clue.category, text: clue.text };
}

export function projectWavelengthPreReveal(
  setup: WavelengthOfficialMaterializedSetup,
  currentClueIndex: number,
): WavelengthOfficialPreRevealProjection {
  const currentClue = setup.clues[Math.max(0, Math.min(currentClueIndex, setup.clues.length - 1))];
  if (!currentClue) throw new RangeError("A Wavelength official setup requires at least one clue.");

  return {
    gameId: "wavelength",
    clueCount: setup.clues.length,
    currentClue: publicClue(currentClue),
    versions: setup.versions,
  };
}

export function projectWavelengthReveal(
  setup: WavelengthOfficialMaterializedSetup,
  finalGuess?: number,
): WavelengthOfficialRevealProjection {
  return {
    gameId: "wavelength",
    target: setup.target,
    revealedClues: setup.clues.map(publicClue),
    finalScore: typeof finalGuess === "number" ? wavelengthScore(finalGuess, setup.target) : undefined,
    versions: setup.versions,
  };
}

/**
 * This is the canonical future-official wire boundary. The generalized daily
 * backend must serialize only this allowlisted projection rather than the
 * private materialized setup. Casual and direct-challenge payloads remain on
 * their existing owners and do not use this official projection contract.
 */
export function serializeWavelengthOfficialProjection(
  setup: WavelengthOfficialMaterializedSetup,
  request: WavelengthOfficialProjectionRequest,
) {
  const projection = request.stage === "pre-reveal"
    ? projectWavelengthPreReveal(setup, request.currentClueIndex)
    : projectWavelengthReveal(setup, request.finalGuess);

  return JSON.stringify(projection);
}
