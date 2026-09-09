export interface H264AvcLevelMetadata {
  configLevelIdc: number;
  configLevelOffset: number;
  spsLevelIdc: number;
  spsLevelOffset: number;
}

export function readH264AvcLevelIdc(source: Buffer | Uint8Array): H264AvcLevelMetadata;

export function normalizeFootballRevealH264Level(source: Buffer | Uint8Array): Buffer;

export function normalizeBuiltFootballReveal(options?: { dist?: string }): Promise<H264AvcLevelMetadata>;
