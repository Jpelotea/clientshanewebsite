import { afterEach, describe, expect, it, vi } from 'vitest';
import stagingAccess, {
  constantTimeHexEqual,
  credentialsAreValid,
  parseBasicAuthorization,
  sha256Hex
} from '../netlify/edge-functions/staging-access';

const password = 'synthetic-staging-password';

function setNetlifyEnvironment(values: Record<string, string | undefined>) {
  vi.stubGlobal('Netlify', {
    env: {
      get: (name: string) => values[name]
    }
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('staging access helpers', () => {
  it('parses valid Basic credentials without exposing them', () => {
    const encoded = Buffer.from('reviewer:password:with:colon').toString('base64');
    expect(parseBasicAuthorization(`Basic ${encoded}`)).toEqual({
      username: 'reviewer',
      password: 'password:with:colon'
    });
  });

  it('rejects malformed Basic credentials', () => {
    expect(parseBasicAuthorization(null)).toBeNull();
    expect(parseBasicAuthorization('Bearer token')).toBeNull();
    expect(parseBasicAuthorization('Basic !!!')).toBeNull();
  });

  it('hashes and compares SHA-256 values', async () => {
    const hash = await sha256Hex(password);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(constantTimeHexEqual(hash, hash)).toBe(true);
    expect(constantTimeHexEqual(hash, `${hash.slice(0, -1)}0`)).toBe(false);
    expect(constantTimeHexEqual('not-a-hash', hash)).toBe(false);
  });

  it('validates the username and password hash together', async () => {
    const hash = await sha256Hex(password);
    const validHeader = `Basic ${Buffer.from(`reviewer:${password}`).toString('base64')}`;
    const invalidHeader = `Basic ${Buffer.from('reviewer:wrong').toString('base64')}`;
    expect(await credentialsAreValid(validHeader, 'reviewer', hash)).toBe(true);
    expect(await credentialsAreValid(invalidHeader, 'reviewer', hash)).toBe(false);
  });
});

describe('staging access edge function', () => {
  it('continues when staging protection is disabled', async () => {
    setNetlifyEnvironment({ STAGING_ACCESS_ENABLED: 'false' });
    const next = vi.fn(async () => new Response('next', { status: 200 }));
    const response = await stagingAccess(new Request('https://example.test/'), { next });
    expect(response.status).toBe(200);
    expect(next).toHaveBeenCalledOnce();
  });

  it('fails closed when enabled credentials are incomplete', async () => {
    setNetlifyEnvironment({ STAGING_ACCESS_ENABLED: 'true' });
    const next = vi.fn(async () => new Response('next'));
    const response = await stagingAccess(new Request('https://example.test/'), { next });
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(next).not.toHaveBeenCalled();
  });

  it('returns an authentication challenge for invalid credentials', async () => {
    setNetlifyEnvironment({
      STAGING_ACCESS_ENABLED: 'true',
      STAGING_ACCESS_USERNAME: 'reviewer',
      STAGING_ACCESS_PASSWORD_HASH: await sha256Hex(password)
    });
    const next = vi.fn(async () => new Response('next'));
    const response = await stagingAccess(new Request('https://example.test/'), { next });
    expect(response.status).toBe(401);
    expect(response.headers.get('www-authenticate')).toContain('Basic');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
    expect(next).not.toHaveBeenCalled();
  });

  it('continues only for valid credentials', async () => {
    setNetlifyEnvironment({
      STAGING_ACCESS_ENABLED: 'true',
      STAGING_ACCESS_USERNAME: 'reviewer',
      STAGING_ACCESS_PASSWORD_HASH: await sha256Hex(password)
    });
    const next = vi.fn(async () => new Response('protected content', { status: 200 }));
    const authorization = `Basic ${Buffer.from(`reviewer:${password}`).toString('base64')}`;
    const response = await stagingAccess(
      new Request('https://example.test/', { headers: { authorization } }),
      { next }
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('protected content');
    expect(next).toHaveBeenCalledOnce();
  });
});
