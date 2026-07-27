# Staging Deployment Pipeline

## Purpose

The `Deploy staging` GitHub Actions workflow deploys only the controlled branch `chore/technical-validation-and-staging` to the existing Netlify project:

- Site name: `shane-perez-personal-brand-staging`
- Site ID: `dd1bcef7-8547-4492-b0d4-46bae30f8582`
- Reserved address: `https://shane-perez-personal-brand-staging.netlify.app`

The workflow uses the protected GitHub environment `staging`. It supports an exact-branch push trigger and manual `workflow_dispatch`; it does not deploy the final production website or a custom domain.

## Deployment targets

- `draft` — default; creates an immutable deploy-specific review URL.
- `staging-primary` — publishes to the dedicated staging project's primary `.netlify.app` address. In this repository, this remains a staging deployment and keeps all launch controls disabled.

## Required GitHub environment secrets

Configure these under **Repository → Settings → Environments → staging → Environment secrets**:

- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`
- `STAGING_ACCESS_USERNAME`
- `STAGING_ACCESS_PASSWORD`

Set `NETLIFY_SITE_ID` to `dd1bcef7-8547-4492-b0d4-46bae30f8582`.

The workflow derives a SHA-256 password hash and stores only the hash on Netlify. It masks the username, plaintext password, and derived hash in GitHub Actions logs.

## GitHub environment controls

Configure the `staging` environment to:

1. Allow deployments only from `chore/technical-validation-and-staging`.
2. Require a reviewer before deployment where the GitHub plan supports it.
3. Keep secrets unavailable to forked pull requests.
4. Restrict the environment deployment branch to `chore/technical-validation-and-staging`.

## Trigger a draft deployment

The first branch deployment is triggered automatically by a push to `chore/technical-validation-and-staging`. Configure the `staging` environment secrets before approving that run. When the run started before secrets were added, use **Re-run all jobs** after configuration.

The workflow also supports `workflow_dispatch` with `draft` and `staging-primary` targets. GitHub normally exposes the standard **Run workflow** button only when the workflow file exists on the default branch. Because PR #1 must remain unmerged, use the branch-triggered run and its re-run control until a separately authorized workflow-promotion decision is made.

## Workflow evidence

The job summary records the branch, commit, target, site ID, deploy ID, deploy URL, primary staging URL, access-gate state, indexing state, forms state, and remaining Milestone B integrations. The workflow uploads only non-secret Netlify deployment metadata.

## Guardrails

Every deployment uses:

- `PUBLIC_SITE_READY=false`
- `PUBLIC_SHOW_DRAFT_CONTENT=false`
- `PUBLIC_PROFILE_CLAIMS_VERIFIED=false`
- `PUBLIC_FORMS_ENABLED=false`
- empty analytics, Meta Pixel, and Turnstile public IDs

The workflow fails before deployment when the approved branch, site ID, lockfile, or required GitHub environment secrets are missing.
