import { describe, expect, it, vi } from 'vitest';
// @ts-ignore -- The production smoke helper is an ESM .mjs module executed directly by Node.
import {
  SmokeRequestError,
  createRequestClient,
  hasExpectedCustom404Heading,
  waitForDeploymentReady
} from '../scripts/post_deploy_smoke_support.mjs';

function networkError(code: string) {
  const cause = Object.assign(new Error(code), { code });
  return Object.assign(new TypeError('fetch failed'), { cause });
}

function client(fetchImpl: typeof fetch, overrides: Record<string, unknown> = {}) {
  return createRequestClient({
    baseUrl: 'https://staging.example.invalid',
    authorization: 'Basic test-only-authorization',
    fetchImpl,
    retryDelaysMs: [0, 0, 0, 0],
    sleepImpl: async () => undefined,
    ...overrides
  });
}

describe('post-deployment smoke request resilience', () => {
  it('returns a successful GET response on the first attempt', async () => {
    const fetchImpl = vi.fn(async () => new Response('ok', { status: 200 }));
    const { request } = client(fetchImpl as typeof fetch);

    const response = await request('/');

    expect(response.status).toBe(200);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('retries a GET after ECONNRESET', async () => {
    const fetchImpl = vi
      .fn()
      .mockRejectedValueOnce(networkError('ECONNRESET'))
      .mockResolvedValueOnce(new Response('ok', { status: 200 }));
    const { request, metrics } = client(fetchImpl as typeof fetch);

    const response = await request('/about-shane/');

    expect(response.status).toBe(200);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(metrics.retryEvents).toBe(1);
  });

  it('retries a GET after a temporary 502', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response('temporary', { status: 502 }))
      .mockResolvedValueOnce(new Response('ok', { status: 200 }));
    const { request } = client(fetchImpl as typeof fetch);

    const response = await request('/insights/');

    expect(response.status).toBe(200);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('stops a GET after the configured maximum number of attempts', async () => {
    const fetchImpl = vi.fn(async () => {
      throw networkError('ECONNRESET');
    });
    const { request } = client(fetchImpl as typeof fetch, { maxAttempts: 3 });

    await expect(request('/events-achievements/')).rejects.toThrow(
      'Request failed for GET /events-achievements/ after 3 attempts: ECONNRESET'
    );
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it('retries a timed-out GET request', async () => {
    let calls = 0;
    const fetchImpl = vi.fn((_url: string | URL | Request, init?: RequestInit) => {
      calls += 1;
      if (calls > 1) return Promise.resolve(new Response('ok', { status: 200 }));

      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
      });
    });
    const { request } = client(fetchImpl as typeof fetch, { timeoutMs: 5 });

    const response = await request('/contact/');

    expect(response.status).toBe(200);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('does not automatically retry POST requests', async () => {
    const fetchImpl = vi.fn(async () => {
      throw networkError('ECONNRESET');
    });
    const { request } = client(fetchImpl as typeof fetch);

    await expect(request('/api/forms/contact', { method: 'POST', body: 'synthetic=true' })).rejects.toThrow(
      'Request failed for POST /api/forms/contact after 1 attempt: ECONNRESET'
    );
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('accepts an unauthenticated 401 with a Basic challenge as ready', async () => {
    const request = vi.fn(async () => new Response('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="technical staging"' }
    }));

    const result = await waitForDeploymentReady({ request, sleepImpl: async () => undefined });

    expect(result.response.status).toBe(401);
    expect(result.attempts).toBe(1);
  });

  it('rejects a 401 readiness response without the Basic challenge', async () => {
    const request = vi.fn(async () => new Response('Unauthorized', { status: 401 }));

    await expect(waitForDeploymentReady({ request, sleepImpl: async () => undefined })).rejects.toThrow(
      'Deployment readiness check received 401 without Basic authentication challenge.'
    );
  });

  it('keeps credentials and Authorization values out of errors and retry logs', async () => {
    const warnings: string[] = [];
    const fetchImpl = vi.fn(async () => {
      throw networkError('ECONNRESET');
    });
    const secretAuthorization = 'Basic c3VwZXItc2VjcmV0';
    const { request } = createRequestClient({
      baseUrl: 'https://staging.example.invalid',
      authorization: secretAuthorization,
      fetchImpl: fetchImpl as typeof fetch,
      maxAttempts: 2,
      retryDelaysMs: [0],
      sleepImpl: async () => undefined,
      logger: { warn: (message: string) => warnings.push(message) }
    });

    let caught: unknown;
    try {
      await request('/about-shane/');
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(SmokeRequestError);
    expect((caught as Error).message).not.toContain(secretAuthorization);
    expect(warnings.join('\n')).not.toContain(secretAuthorization);
    expect(warnings.join('\n')).not.toMatch(/authorization/i);
  });

  it('preserves the corrected custom 404 heading assertion', () => {
    expect(hasExpectedCustom404Heading('<main><h1>This page could not be found.</h1></main>')).toBe(true);
    expect(hasExpectedCustom404Heading('<main><h1>Page not found</h1></main>')).toBe(false);
  });
});
