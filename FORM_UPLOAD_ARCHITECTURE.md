# Form and Secure Resume Architecture

## Endpoint

All public forms submit to `/api/forms/:formType`, handled by one Netlify Function with shared security, validation, storage, and notification modules.

## Request controls

- `POST` only and supported form content types only.
- Same-origin or explicit origin allowlist.
- Request-size guard before multipart parsing when content length is available.
- Honeypot rejection.
- Cloudflare Turnstile token verified server-side for every form.
- Expected Turnstile action and optional hostname allowlist.
- Netlify platform rate limiting for every form route using domain and runtime client IP.
- Zod server-side schemas and field-specific safe errors.
- No form values, credentials, or résumé contents written to application logs.

## Selected deployment model

The code supports one configured S3-compatible provider at runtime. **AWS S3 is the recommended initial deployment provider** unless the account owner explicitly selects Cloudflare R2 before staging integration testing.

The website must never configure two live buckets for the same environment.

## Recruitment upload sequence

1. The visitor submits validated multipart form data and a Turnstile token.
2. The server validates application fields and required consent.
3. The server accepts PDF, DOC, or DOCX only, up to 4 MB.
4. Extension, MIME type, and file signature are checked.
5. The file is written to a private bucket under a date and random UUID key.
6. The object is stored as an attachment with a neutral downloaded filename.
7. AWS S3 receives server-side AES-256 encryption; R2 relies on provider-managed storage encryption.
8. The server creates an expiring signed link limited to 24 hours.
9. Resend sends the authorized recipients a notification and protected bearer link, never an attachment.
10. If notification delivery fails, the newly uploaded object is deleted on a best-effort basis and the visitor receives a failure response.

## Retention and deletion

- `RESUME_RETENTION_DAYS` defaults to 30 days and is recorded in object metadata.
- The selected bucket must have a lifecycle rule that deletes `recruitment-resumes/` objects according to the approved period.
- Metadata does not enforce deletion by itself.
- The account owner must document who may access, renew, download, or delete a résumé.
- Test uploads must use a separate bucket or prefix and must be deleted immediately after validation.

## Residual risks requiring approval

- A signed URL is a bearer link until expiration. Authorized recipients must not forward it.
- Email delivery creates a record containing applicant form information. Recipient mailbox access and retention must be controlled.
- Malware scanning is not included in the initial architecture. Recipients should treat downloaded files as untrusted; managed malware scanning is a future hardening option.
- File-signature checks reduce accidental mismatch but are not a complete content-disarm or antivirus system.

## Consultation and contact

These forms do not create calendar events, send automatic visitor confirmations, or store submissions in the repository. Authorized recipients review and respond manually.
