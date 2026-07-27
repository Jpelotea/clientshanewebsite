import { randomUUID } from 'node:crypto';
import { PublicError } from './http';

interface TurnstileResult {
  success: boolean;
  'error-codes'?: string[];
  hostname?: string;
  action?: string;
}

export async function verifyTurnstile(token: string, remoteIp?: string): Promise<void> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) throw new PublicError('Form security is not configured.', 503);
  if (!token) throw new PublicError('Please complete the security verification.', 400);

  const payload = new URLSearchParams({
    secret,
    response: token,
    idempotency_key: randomUUID()
  });
  if (remoteIp) payload.set('remoteip', remoteIp);

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: payload,
    signal: AbortSignal.timeout(8000)
  });
  if (!response.ok) throw new PublicError('The security verification service is unavailable.', 503);

  const result = (await response.json()) as TurnstileResult;
  if (!result.success) throw new PublicError('The security verification was unsuccessful. Please try again.', 400);

  const expectedAction = process.env.TURNSTILE_EXPECTED_ACTION?.trim();
  if (expectedAction && result.action !== expectedAction) {
    throw new PublicError('The security verification context was invalid. Please try again.', 400);
  }

  const allowedHostnames = (process.env.TURNSTILE_ALLOWED_HOSTNAMES || '')
    .split(',')
    .map(value => value.trim().toLowerCase())
    .filter(Boolean);
  if (allowedHostnames.length && (!result.hostname || !allowedHostnames.includes(result.hostname.toLowerCase()))) {
    throw new PublicError('The security verification host was invalid. Please try again.', 400);
  }
}
