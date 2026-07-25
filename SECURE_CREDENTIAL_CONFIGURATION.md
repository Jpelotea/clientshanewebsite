# Secure Staging Credential Configuration

Do not paste tokens, passwords, private email addresses, AWS credentials, or OAuth secrets into chat, GitHub issues, pull-request comments, documentation, screenshots, or committed files.

## GitHub staging environment

1. Open `Jpelotea/clientshanewebsite` on GitHub.
2. Select **Settings**.
3. Select **Environments**.
4. Create or open `staging`.
5. Under **Deployment branches and tags**, restrict the environment to `chore/technical-validation-and-staging`.
6. Add a required reviewer where supported.
7. Add these environment secrets:
   - `NETLIFY_AUTH_TOKEN`
   - `NETLIFY_SITE_ID`
   - `STAGING_ACCESS_USERNAME`
   - `STAGING_ACCESS_PASSWORD`
8. Set `NETLIFY_SITE_ID` to the existing staging site ID.
9. Do not add these values as repository variables or committed environment files.

Create the Netlify personal access token from the authorized Netlify account's user applications settings. Scope operational access to the staging project and revoke the token when it is no longer required.

## Netlify staging variables

The deployment workflow synchronizes the safe build variables and the staging access-gate values. Provider credentials for Milestone B must be added through **Netlify → Project configuration → Environment variables** and marked as secret when applicable.

### Cloudflare Turnstile

1. Create a staging-specific Turnstile widget.
2. Allow `shane-perez-personal-brand-staging.netlify.app` and required deploy-preview hostnames.
3. Use action `website_form`.
4. Add the public key as `PUBLIC_TURNSTILE_SITE_KEY` for trusted staging contexts.
5. Add the secret as `TURNSTILE_SECRET_KEY` with Functions scope and explicit staging contexts.
6. Keep `TURNSTILE_ALLOWED_HOSTNAMES` and `TURNSTILE_EXPECTED_ACTION` aligned with the repository.

### AWS S3

1. Create an isolated staging bucket.
2. Enable Block Public Access and server-side encryption.
3. Add a lifecycle rule that deletes staging résumé objects after the approved test retention period.
4. Create a least-privilege IAM principal limited to the required bucket prefix and upload, read-for-signing, and delete operations.
5. Store the following on Netlify as protected values:
   - `RESUME_STORAGE_PROVIDER=aws-s3`
   - `RESUME_STORAGE_BUCKET`
   - `RESUME_STORAGE_REGION`
   - `RESUME_STORAGE_ACCESS_KEY_ID`
   - `RESUME_STORAGE_SECRET_ACCESS_KEY`
   - `RESUME_SIGNED_URL_EXPIRATION_SECONDS`
   - `RESUME_RETENTION_DAYS`
6. Do not use an administrator key or a public bucket.

### Resend

1. Create a staging API key.
2. Verify a staging sender domain or approved test sender.
3. Use synthetic recipients controlled by the authorized tester.
4. Store the following on Netlify:
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
   - `RESEND_REPLY_TO_EMAIL`, when approved
   - `RECRUITMENT_NOTIFICATION_EMAILS`
   - `CONSULTATION_NOTIFICATION_EMAILS`
   - `CONTACT_NOTIFICATION_EMAILS`
5. Delete synthetic emails after validation where practical.

### Decap CMS GitHub OAuth

1. Create a GitHub OAuth application owned by the authorized account or organization.
2. Set the homepage to the protected staging site.
3. Set the callback URL to the exact server-side OAuth callback selected for the staging implementation.
4. Store the OAuth client secret only in Netlify environment variables.
5. Do not place the client secret in `public/admin/config.yml` or browser code.
6. Limit editor access and test with synthetic content only.
7. Do not add callback-path exemptions to the staging gate until the OAuth state validation and exact callback route are implemented and reviewed.
