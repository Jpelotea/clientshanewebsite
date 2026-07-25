type EdgeContext = {
  next: () => Promise<Response>;
};

type NetlifyEnvironment = {
  get: (name: string) => string | undefined;
};

declare const Netlify: {
  env: NetlifyEnvironment;
};

const REALM = 'Shane Perez technical staging';
const HEX_SHA256 = /^[a-f0-9]{64}$/i;

function responseHeaders(): Headers {
  return new Headers({
    'Cache-Control': 'no-store, private, max-age=0',
    Pragma: 'no-cache',
    'X-Robots-Tag': 'noindex, nofollow, noarchive'
  });
}

function unauthorizedResponse(): Response {
  const headers = responseHeaders();
  headers.set('WWW-Authenticate', `Basic realm="${REALM}", charset="UTF-8"`);
  return new Response('Authentication is required to access this technical staging site.', {
    status: 401,
    headers
  });
}

function configurationErrorResponse(): Response {
  return new Response('Technical staging access is not configured.', {
    status: 503,
    headers: responseHeaders()
  });
}

export function parseBasicAuthorization(header: string | null): { username: string; password: string } | null {
  if (!header?.startsWith('Basic ')) return null;
  const encoded = header.slice(6).trim();
  if (!encoded) return null;

  try {
    const decoded = atob(encoded);
    const separator = decoded.indexOf(':');
    if (separator < 1) return null;
    return {
      username: decoded.slice(0, separator),
      password: decoded.slice(separator + 1)
    };
  } catch {
    return null;
  }
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

export function constantTimeHexEqual(left: string, right: string): boolean {
  if (!HEX_SHA256.test(left) || !HEX_SHA256.test(right)) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

export async function credentialsAreValid(
  authorization: string | null,
  expectedUsername: string,
  expectedPasswordHash: string
): Promise<boolean> {
  const supplied = parseBasicAuthorization(authorization);
  if (!supplied) return false;

  const [suppliedUsernameHash, expectedUsernameHash, suppliedPasswordHash] = await Promise.all([
    sha256Hex(supplied.username),
    sha256Hex(expectedUsername),
    sha256Hex(supplied.password)
  ]);

  return (
    constantTimeHexEqual(suppliedUsernameHash, expectedUsernameHash) &&
    constantTimeHexEqual(suppliedPasswordHash, expectedPasswordHash.toLowerCase())
  );
}

export default async function stagingAccess(request: Request, context: EdgeContext): Promise<Response> {
  const enabled = Netlify.env.get('STAGING_ACCESS_ENABLED') === 'true';
  if (!enabled) return context.next();

  const expectedUsername = Netlify.env.get('STAGING_ACCESS_USERNAME')?.trim() || '';
  const expectedPasswordHash = Netlify.env.get('STAGING_ACCESS_PASSWORD_HASH')?.trim() || '';

  if (!expectedUsername || !HEX_SHA256.test(expectedPasswordHash)) {
    return configurationErrorResponse();
  }

  const valid = await credentialsAreValid(
    request.headers.get('authorization'),
    expectedUsername,
    expectedPasswordHash
  );

  if (!valid) return unauthorizedResponse();
  return context.next();
}

export const config = {
  path: '/*'
};
