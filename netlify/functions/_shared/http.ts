export class PublicError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status = 400, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'PublicError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export function jsonResponse(data: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...headers
    }
  });
}

export function assertAllowedOrigin(request: Request): void {
  const origin = request.headers.get('origin');
  if (!origin) throw new PublicError('The request origin could not be verified.', 403);

  const requestOrigin = new URL(request.url).origin;
  const configured = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean);
  const allowed = new Set([requestOrigin, ...configured]);

  if (!allowed.has(origin)) throw new PublicError('The request origin is not allowed.', 403);
}

export function assertBodySize(request: Request, maximumBytes = 4_500_000): void {
  const value = request.headers.get('content-length');
  if (!value) return;
  const size = Number(value);
  if (!Number.isFinite(size) || size < 0) throw new PublicError('The submitted form size is invalid.', 400);
  if (size > maximumBytes) throw new PublicError('The submitted form is too large.', 413);
}

export function safeMessage(error: unknown): { message: string; status: number; errors?: Record<string, string> } {
  if (error instanceof PublicError) {
    return { message: error.message, status: error.status, errors: error.fieldErrors };
  }
  console.error('Form processing failed without exposing private submission data.', error instanceof Error ? error.name : 'UnknownError');
  return { message: 'The form could not be submitted securely. Please try again later.', status: 500 };
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function safeHeaderValue(value: unknown, maximum = 120): string {
  return String(value ?? '').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maximum);
}
