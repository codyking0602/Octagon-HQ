export function verifyProductionArtifact(options?: {
  dist?: string;
  env?: Record<string, string | undefined>;
}): Promise<{ files: number; hostname: string }>;
export const requiredApplicationMarkers: string[];
export const requiredShareArtwork: string[];
