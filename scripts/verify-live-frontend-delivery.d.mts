export interface LiveFrontendDeliveryOptions {
  origin?: string;
  expectedSha?: string;
  allowedDeployedShas?: string[];
  attempts?: number;
  delayMs?: number;
  fetchFn?: typeof fetch;
}

export interface LiveFrontendDeliveryResult {
  expectedSha: string;
  requestedSha: string;
  javascriptAssets: number;
  stylesheetAssets: number;
  auctionFormatAssets: number;
  references: string[];
}

export function resolveAcceptedDeploymentSha(options?: {
  markerSha?: unknown;
  expectedSha?: unknown;
  allowedDeployedShas?: unknown[];
}): string;

export function extractShellAssetReferences(html: string, origin?: string): string[];

export function verifyLiveFrontendDelivery(
  options?: LiveFrontendDeliveryOptions,
): Promise<LiveFrontendDeliveryResult>;
