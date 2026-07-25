# Environment Variable Guide

Copy `.env.example` to `.env` for local development. Never commit `.env`, deploy credentials, or real recipient addresses.

## Build-time public values

These variables are exposed to browser or generated HTML code and must not contain secrets.

| Variable | Required | Purpose |
|---|---:|---|
| `PUBLIC_SITE_URL` | Yes for deployed builds | Canonical origin used for metadata, robots, and sitemap generation. |
| `PUBLIC_SITE_READY` | Yes | Keep `false` for local, preview, staging, and unapproved production builds. |
| `PUBLIC_SHOW_DRAFT_CONTENT` | No | Enables draft collection content only in controlled review environments. |
| `PUBLIC_PROFILE_CLAIMS_VERIFIED` | No | Adds verified professional claims to Person structured data only after approval. |
| `PUBLIC_GOOGLE_ANALYTICS_ID` | No | Google Analytics measurement ID. Tracking still requires consent. |
| `PUBLIC_META_PIXEL_ID` | No | Meta Pixel ID. Tracking still requires marketing consent. |
| `PUBLIC_TURNSTILE_SITE_KEY` | Required for working forms | Public Cloudflare Turnstile site key. |

## Server-only runtime values

| Variable | Required | Purpose |
|---|---:|---|
| `TURNSTILE_SECRET_KEY` | Yes for forms | Server-only Turnstile secret. |
| `TURNSTILE_EXPECTED_ACTION` | Recommended | Expected widget action, currently `website_form`. |
| `TURNSTILE_ALLOWED_HOSTNAMES` | Recommended | Comma-separated preview/staging/production hostnames accepted after verification. |
| `RESEND_API_KEY` | Yes for notifications | Server-only Resend API key. |
| `RESEND_FROM_EMAIL` | Yes | Sender on a verified Resend domain. |
| `RESEND_REPLY_TO_EMAIL` | No | Approved shared reply-to address. Do not set this automatically to visitor input. |
| `RECRUITMENT_NOTIFICATION_EMAILS` | Yes for recruitment | Comma-separated authorized recruitment recipients. |
| `CONSULTATION_NOTIFICATION_EMAILS` | Yes for consultation | Comma-separated authorized consultation recipients. |
| `CONTACT_NOTIFICATION_EMAILS` | Yes for contact | Comma-separated authorized contact recipients. |
| `RESUME_STORAGE_PROVIDER` | Yes for recruitment | Select exactly one provider: `aws-s3` or `cloudflare-r2`. AWS S3 is the deployment recommendation unless R2 is explicitly approved. |
| `RESUME_STORAGE_BUCKET` | Yes | Private bucket name. |
| `RESUME_STORAGE_REGION` | AWS S3 only | AWS region. R2 uses `auto`. |
| `RESUME_STORAGE_ENDPOINT` | R2 only | R2 S3-compatible endpoint. Leave empty for AWS S3. |
| `RESUME_STORAGE_ACCESS_KEY_ID` | Yes | Least-privilege storage access key. |
| `RESUME_STORAGE_SECRET_ACCESS_KEY` | Yes | Least-privilege storage secret. |
| `RESUME_SIGNED_URL_EXPIRATION_SECONDS` | No | 300-86400 seconds; default and maximum are 86400. |
| `RESUME_RETENTION_DAYS` | No | Retention metadata, default 30 days. A bucket lifecycle rule must enforce deletion. |
| `ALLOWED_ORIGINS` | Recommended | Comma-separated additional preview/staging/production origins. The current request origin is always included. |

## Environment separation

Use separate values for:

- Local development
- Pull-request deploy previews
- Staging or branch deployments
- Production

Do not expose production form credentials to untrusted pull requests. Preview forms may use isolated test accounts or remain intentionally unavailable until a trusted staging context is used.

## GitHub Actions

The validation workflow does not require live form credentials. It runs static, unit, build, and local route/function method checks with `PUBLIC_SITE_READY=false`. Any future credentialed integration tests must use GitHub Actions Secrets and synthetic data only.
