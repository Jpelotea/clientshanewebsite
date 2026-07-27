export const RETRYABLE_NETWORK_CODES = new Set([
  'ECONNRESET',
  'ETIMEDOUT',
  'EAI_AGAIN',
  'ECONNREFUSED',
  'ENETUNREACH',
  'EPIPE',
  'UND_ERR_CONNECT_TIMEOUT',
  'UND_ERR_HEADERS_TIMEOUT',
  'UND_ERR_SOCKET'
]);

export const RETRYABLE_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);
export const CUSTOM_404_HEADING_PATTERN = /<h1[^>]*>\s*This page could not be found\.\s*<\/h1>/i;

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_RETRY_DELAYS_MS = [1_000, 2_000, 4_000, 8_000];

export function sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export function isSafeMethod(method) {
  const normalized = String(method || 'GET').toUpperCase();
  return normalized === 'GET' || normalized === 'HEAD';
}

export function hasExpectedCustom404Heading(html) {
  return CUSTOM_404_HEADING_PATTERN.test(html);
}

function errorCode(error, timedOut = false) {
  if (timedOut) return 'ETIMEDOUT';

  let current = error;
  for (let depth = 0; current && depth < 6; depth += 1) {
    if (typeof current.code === 'string' && current.code) return current.code;
    if (current.name === 'AbortError') return 'ETIMEDOUT';
    current = current.cause;
  }

  return null;
}

function retryDelay(delays, attempt) {
  const index = Math.min(Math.max(attempt - 1, 0), delays.length - 1);
  return delays[index] ?? 0;
}

function safeErrorLabel(error, timedOut = false) {
  return errorCode(error, timedOut) || error?.name || 'UNKNOWN_ERROR';
}

export class SmokeRequestError extends Error {
  constructor(message, { cause, retryable = false, safeResult = 'UNKNOWN_ERROR' } = {}) {
    super(message, cause ? { cause } : undefined);
    this.name = 'SmokeRequestError';
    this.retryable = retryable;
    this.safeResult = safeResult;
  }
}

export function createRequestClient({
  baseUrl,
  authorization,
  fetchImpl = globalThis.fetch,
  logger = console,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
  retryDelaysMs = DEFAULT_RETRY_DELAYS_MS,
  sleepImpl = sleep
}) {
  if (!baseUrl) throw new Error('baseUrl is required.');
  if (typeof fetchImpl !== 'function') throw new Error('fetchImpl must be a function.');

  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
  const metrics = { retryEvents: 0 };

  async function request(path, options = {}, authenticated = true, policy = {}) {
    const method = String(options.method || 'GET').toUpperCase();
    const safe = isSafeMethod(method);
    const retriesEnabled = policy.retry ?? safe;
    const attemptLimit = retriesEnabled ? Math.max(1, policy.maxAttempts ?? maxAttempts) : 1;
    const attemptTimeoutMs = policy.timeoutMs ?? timeoutMs;

    for (let attempt = 1; attempt <= attemptLimit; attempt += 1) {
      const headers = new Headers(options.headers || {});
      if (authenticated && authorization) headers.set('Authorization', authorization);

      const controller = new AbortController();
      let timedOut = false;
      const timeout = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, attemptTimeoutMs);

      let response;
      let requestError;

      try {
        response = await fetchImpl(`${normalizedBaseUrl}${path}`, {
          redirect: 'manual',
          ...options,
          method,
          headers,
          signal: controller.signal
        });
      } catch (error) {
        requestError = error;
      } finally {
        clearTimeout(timeout);
      }

      if (response) {
        if (!retriesEnabled || !RETRYABLE_STATUSES.has(response.status)) return response;

        const safeResult = `HTTP ${response.status}`;
        if (attempt >= attemptLimit) {
          throw new SmokeRequestError(
            `Request failed for ${method} ${path} after ${attemptLimit} attempts: ${safeResult}`,
            { retryable: true, safeResult }
          );
        }

        const delay = retryDelay(retryDelaysMs, attempt);
        metrics.retryEvents += 1;
        logger.warn(`Temporary ${safeResult} for ${method} ${path} on attempt ${attempt}/${attemptLimit}; retrying in ${delay}ms.`);
        await sleepImpl(delay);
        continue;
      }

      const code = safeErrorLabel(requestError, timedOut);
      const retryable = retriesEnabled && RETRYABLE_NETWORK_CODES.has(code);

      if (!retryable || attempt >= attemptLimit) {
        throw new SmokeRequestError(
          `Request failed for ${method} ${path} after ${attempt} attempt${attempt === 1 ? '' : 's'}: ${code}`,
          { cause: requestError, retryable, safeResult: code }
        );
      }

      const delay = retryDelay(retryDelaysMs, attempt);
      metrics.retryEvents += 1;
      logger.warn(`Temporary ${code} for ${method} ${path} on attempt ${attempt}/${attemptLimit}; retrying in ${delay}ms.`);
      await sleepImpl(delay);
    }

    throw new SmokeRequestError(`Request failed for ${method} ${path}: UNKNOWN_ERROR`);
  }

  return { request, metrics };
}

export async function waitForDeploymentReady({
  request,
  logger = console,
  timeoutMs = 90_000,
  initialDelayMs = 2_000,
  maxDelayMs = 8_000,
  sleepImpl = sleep,
  now = Date.now
}) {
  if (typeof request !== 'function') throw new Error('request is required.');

  const startedAt = now();
  let delay = initialDelayMs;
  let attempts = 0;
  let retryEvents = 0;
  let lastResult = 'no response';

  while (now() - startedAt <= timeoutMs) {
    attempts += 1;

    try {
      const response = await request('/', {}, false, { maxAttempts: 1, retry: true });
      const challenge = response.headers.get('www-authenticate') || '';

      if (response.status === 401) {
        if (!challenge.startsWith('Basic ')) {
          throw new Error('Deployment readiness check received 401 without Basic authentication challenge.');
        }
        return { response, attempts, retryEvents };
      }

      throw new Error(`Deployment readiness check received unexpected HTTP ${response.status}.`);
    } catch (error) {
      if (!(error instanceof SmokeRequestError) || !error.retryable) throw error;
      lastResult = error.safeResult;
    }

    const elapsed = now() - startedAt;
    if (elapsed >= timeoutMs) break;

    const remaining = timeoutMs - elapsed;
    const waitMs = Math.min(delay, remaining);
    retryEvents += 1;
    logger.warn(`Deployment readiness pending after ${lastResult}; retrying in ${waitMs}ms.`);
    await sleepImpl(waitMs);
    delay = Math.min(delay * 2, maxDelayMs);
  }

  throw new Error(`Deployment did not become ready within ${Math.round(timeoutMs / 1_000)} seconds. Last result: ${lastResult}`);
}
