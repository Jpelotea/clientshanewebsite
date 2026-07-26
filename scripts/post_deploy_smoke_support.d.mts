export const RETRYABLE_NETWORK_CODES: Set<string>;
export const RETRYABLE_STATUSES: Set<number>;
export const CUSTOM_404_HEADING_PATTERN: RegExp;

export function sleep(milliseconds: number): Promise<void>;
export function isSafeMethod(method?: string): boolean;
export function hasExpectedCustom404Heading(html: string): boolean;

export class SmokeRequestError extends Error {
  retryable: boolean;
  safeResult: string;
  constructor(
    message: string,
    options?: { cause?: unknown; retryable?: boolean; safeResult?: string }
  );
}

export type SmokeRequestPolicy = {
  retry?: boolean;
  maxAttempts?: number;
  timeoutMs?: number;
};

export type SmokeRequest = (
  path: string,
  options?: RequestInit,
  authenticated?: boolean,
  policy?: SmokeRequestPolicy
) => Promise<Response>;

export function createRequestClient(options: {
  baseUrl: string;
  authorization?: string;
  fetchImpl?: typeof fetch;
  logger?: { warn(message: string): void };
  timeoutMs?: number;
  maxAttempts?: number;
  retryDelaysMs?: number[];
  sleepImpl?: (milliseconds: number) => Promise<void>;
}): {
  request: SmokeRequest;
  metrics: { retryEvents: number };
};

export function waitForDeploymentReady(options: {
  request: SmokeRequest;
  logger?: { warn(message: string): void };
  timeoutMs?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  sleepImpl?: (milliseconds: number) => Promise<void>;
  now?: () => number;
}): Promise<{
  response: Response;
  attempts: number;
  retryEvents: number;
}>;
