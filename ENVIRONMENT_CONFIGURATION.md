# Environment Variable Guide

Copy `.env.example` to `.env` for local development. Never commit `.env`, deployment credentials, staging passwords, OAuth secrets, storage keys, or real recipient addresses.

## Public build-time values

| Variable | Required | Purpose |
|---|---:|---|
| `PUBLIC_SITE_URL` | Deployed builds | Canonical staging or production origin. |
| `PUBLIC_SITE_READY` | Yes | Keep `false` for local, preview, staging, and unapproved production builds. |
| `PUBLIC_SHOW_DRAFT_CONTENT` | No | Controlled draft display; remains `false` for Milestone A. |
| `PUBLIC_PROFILE_CLAIMS_VERIFIED` | No | Includes verified profile claims in structured data only after approval. |
| `PUBLIC_FORMS_ENABLED` | Yes for controlled deployment | Keep `false` until Turnstile, storage, email, rate limiting, and failure recovery pass. |
| `PUBLIC_GOOGLE_ANALYTICS_ID` | No | Consent-gated Google Analytics ID; blank during technical staging. |
| `PUBLIC_META_PIXEL_ID` | No | Consent-gated Meta Pixel ID; blank during technical staging. |
| `PUBLIC_TURNSTILE_SITE_KEY` | Working forms only | Public Turnstile site key; blank while forms are disabled. |

## Staging access values

| Variable | Stored in | Secret | Purpose |
|---|---|---:|---|
| `STAGING_ACCESS_ENABLED` | Netlify Functions/Edge context | Yes | Enables the temporary server-side gate. |
| `STAGING_ACCESS_USERNAME` | GitHub environment and Netlify | Yes | Review username; masked in logs. |
| `STAGING_ACCESS_PASSWORD` | GitHub `staging` environment only | Yes | Plaintext review password used by the authenticated smoke test. It is not copied into Netlify. |
| `STAGING_ACCESS_PASSWORD_HASH` | Netlify | Yes | SHA-256 hash derived during the deployment workflow. |

## Server-only provider values

| Variable | Required | Purpose |
|---|---:|---|
| `TURNSTILE_SECRET_KEY` | Working forms | Server-only Siteverify secret. |
| `TURNSTILE_EXPECTED_ACTION` | Recommended | Expected action, currently `website_form`. |
| `TURNSTILE_ALLOWED_HOSTNAMES` | Recommended | Comma-separated approved hostnames. |
| `RESEND_API_KEY` | Notifications | Server-only Resend key. |
| `RESEND_FROM_EMAIL` | Notifications | Sender on a verified domain. |
| `RESEND_REPLY_TO_EMAIL` | Optional | Approved reply-to; never visitor-controlled. |
| `RECRUITMENT_NOTIFICATION_EMAILS` | Recruitment | Authorized comma-separated recipients. |
| `CONSULTATION_NOTIFICATION_EMAILS` | Consultation | Authorized comma-separated recipients. |
| `CONTACT_NOTIFICATION_EMAILS` | Contact | Authorized comma-separated recipients. |
| `RESUME_STORAGE_PROVIDER` | Recruitment | `aws-s3` or explicitly approved `cloudflare-r2`. |
| `RESUME_STORAGE_BUCKET` | Recruitment | Private bucket name. |
| `RESUME_STORAGE_REGION` | AWS | AWS region. |
| `RESUME_STORAGE_ENDPOINT` | R2 only | S3-compatible endpoint. |
| `RESUME_STORAGE_ACCESS_KEY_ID` | Recruitment | Least-privilege access key. |
| `RESUME_STORAGE_SECRET_ACCESS_KEY` | Recruitment | Least-privilege secret. |
| `RESUME_SIGNED_URL_EXPIRATION_SECONDS` | Optional | Signed-link duration, maximum 86400 seconds. |
| `RESUME_RETENTION_DAYS` | Optional | Retention metadata; provider lifecycle rules enforce deletion. |
| `ALLOWED_ORIGINS` | Recommended | Comma-separated exact origins allowed to call form endpoints. |

## GitHub environment secrets

Under `Repository → Settings → Environments → staging`, configure:

- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`
- `STAGING_ACCESS_USERNAME`
- `STAGING_ACCESS_PASSWORD`

Restrict the environment to `chore/technical-validation-and-staging` and require approval where supported. Forked pull requests must not receive these secrets.

## Context rules

The deployment workflow synchronizes safe public values to production, deploy-preview, and branch-deploy contexts on the dedicated staging project. It synchronizes the gate values as Netlify secret variables. Milestone B provider secrets must be configured in Netlify through explicit staging contexts and protected scopes.
