# Netlify Staging and Deployment Guide

## Repository connection

- GitHub repository: `Jpelotea/clientshanewebsite`
- Production branch: `main`
- Pull requests: Netlify deploy previews when enabled
- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`
- Node version: 22

These values are also declared in `netlify.toml`.

## Safe initial connection

1. Connect the GitHub repository to a Netlify site controlled by Shane or an authorized account owner.
2. Keep the automatically assigned `*.netlify.app` hostname for staging.
3. Add non-secret build variables, including `PUBLIC_SITE_READY=false`.
4. Add isolated test credentials only to a trusted staging context when end-to-end form testing begins.
5. Do not enable production indexing, a custom domain, or live applicant intake during technical review.

`netlify.toml` keeps preview, branch, and production contexts at `PUBLIC_SITE_READY=false`. A later explicit reviewed change is required before production indexing.

## Decap CMS authentication

The CMS uses the GitHub backend. Configure the GitHub OAuth application and the Netlify OAuth provider for the actual Netlify site. No token is committed to the repository. Verify `/admin/`, editorial workflow, deploy previews, and approved content rendering before launch.

## Form services

Configure, in order:

1. Cloudflare Turnstile domains and keys.
2. One private résumé-storage provider and lifecycle rule.
3. Resend verified sending domain and authorized recipients.
4. Allowed staging origin and Turnstile hostname.
5. Synthetic end-to-end submissions.
6. Deletion of all test data.

Do not use live personal information during testing.

## Staging verification

- Every route, legal page, and 404 behavior.
- Mobile and desktop layout.
- Form validation, Turnstile, rate limiting, private upload, signed link, email result, and cleanup.
- CMS login and editorial workflow.
- Consent withdrawal and absence of trackers before consent.
- HTTPS, headers, redirects, and `noindex`/robots behavior.
- Draft resource download and explicit draft labeling.

## Production promotion

Production requires:

- All GitHub Actions and staging checks passing.
- Shane's final content approval.
- Required compliance/legal approval.
- Verified contact details and publication permissions.
- Security and privacy configuration accepted by the account owner.
- Final resource files replacing drafts.
- An explicit reviewed change that sets production readiness and indexing behavior.

Do not deploy or promote production without explicit authorization.
