# Security and Privacy Notes

This is a public source repository for a website that may later receive recruitment and consultation information. Do not report security issues through a public issue containing secrets, personal data, private URLs, or exploitation details.

## Repository boundary

The repository must not contain credentials, tokens, real `.env` files, résumés, applicant data, consultation submissions, identity documents, private photographs, or confidential compliance records.

## Staging access gate

- `netlify/edge-functions/staging-access.ts` executes server-side before protected content is returned.
- Protection is enabled only when `STAGING_ACCESS_ENABLED=true` exists in the Netlify staging environment.
- The username and password are never hard-coded or sent to browser JavaScript.
- GitHub stores the review password as a protected environment secret.
- Netlify receives a SHA-256 password hash, not the plaintext password.
- Invalid credentials return a Basic Authentication challenge and anti-caching headers.
- Missing configuration fails closed with HTTP 503.
- No OAuth callback path is exempted before the actual OAuth implementation and state validation are reviewed.

HTTP Basic Authentication is acceptable only over Netlify HTTPS and only for temporary technical staging. Remove the gate before final production launch.

## Forms and personal data

`PUBLIC_FORMS_ENABLED=false` disables form controls and submission during Milestone A. Netlify Forms remains disabled. The custom Function still rejects unsupported, unconfigured, invalid-origin, or unprotected requests and must never claim success without required processing.

When Milestone B begins:

- Use mandatory server-side Turnstile verification.
- Store résumé files only in one private bucket.
- Use randomized object keys and expiring signed links.
- Never attach résumés to notification email.
- Enforce lifecycle deletion and cleanup after downstream failure.
- Use synthetic test data only.

## Operational requirements

- Use least-privilege credentials and protected environment interfaces.
- Mask all derived secrets in GitHub Actions logs.
- Rotate exposed credentials immediately.
- Keep storage private and enforce lifecycle deletion.
- Restrict recipient mailboxes and CMS access.
- Review logs for accidental personal-data exposure.
- Complete an authorized staging security review before accepting live data.
