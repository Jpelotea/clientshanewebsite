# GitHub Workflow

## Standard validation

`.github/workflows/validate.yml` runs on pushes to `main`, `chore/**`, `feat/**`, and `fix/**`, and on pull requests into `main`. It installs from the committed lockfile and runs source validation, unit tests, Astro/TypeScript checks, the controlled build, built-output audit, and Netlify local smoke test.

## Staging deployment

`.github/workflows/deploy-staging.yml` is manual and requires the protected `staging` environment. It refuses to deploy any branch except `chore/technical-validation-and-staging` and verifies the existing Netlify site ID.

The workflow:

1. Repeats validation because deployment follows a new branch commit.
2. Builds with indexing, draft content, profile claims, forms, analytics, Meta Pixel, and Turnstile disabled.
3. Synchronizes safe staging values and the password hash to Netlify.
4. Deploys with the pinned Netlify CLI in `package-lock.json`.
5. Captures the deploy ID and URL.
6. Runs authenticated post-deployment smoke tests.
7. Writes a non-secret GitHub Actions summary and uploads deployment metadata.

The workflow supports `draft` and `staging-primary`. It does not configure a final domain, set `PUBLIC_SITE_READY=true`, merge PR #1, or enable live intake.


## Staging deployment trigger

`.github/workflows/deploy-staging.yml` runs on pushes to `chore/technical-validation-and-staging` and supports manual `workflow_dispatch`. The push trigger is necessary while the deployment workflow exists only on the unmerged working branch. The job is still restricted to the approved repository and exact branch and uses the protected `staging` environment.
