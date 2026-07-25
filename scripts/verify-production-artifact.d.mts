export function verifyProductionArtifact(options?: {
  dist?: string;
  env?: Record<string, string | undefined>;
}): Promise<{ files: number; hostname: string }>;
