# GitHub Workflow

## Standard validation

`.github/workflows/validate.yml` runs on pushes to `main`, `chore/**`, `feat/**`, and `fix/**`, and on pull requests into `main`. It installs from the committed lockfile and runs source validation, unit tests, Astro/TypeScript checks, the controlled build, built-output audit, and Netlify local smoke test.

Run #43 passed for commit `7aa4d50141586638d090942928aa78d6fd8b330e` after normalizing the local Netlify Dev origin used by the form-security smoke test.

## Staging deployment

`.github/workflows/deploy-staging.yml` runs on pushes to `chore/technical-validation-and-staging` and supports manual `workflow_dispatch`. It requires the protected `staging` environment and refuses to deploy any branch except `chore/technical-validation-and-staging`; it also verifies the existing Netlify site ID.

The workflow:

1. Repeats validation because deployment follows a new branch commit.
2. Builds with indexing, draft content, profile claims, forms, analytics, Meta Pixel, and Turnstile disabled.
3. Synchronizes safe staging values and the password hash to Netlify.
4. Deploys with the pinned Netlify CLI in `package-lock.json`.
5. Captures the deploy ID and URL.
6. Runs authenticated post-deployment smoke tests.
7. Writes a non-secret GitHub Actions summary and uploads deployment metadata.

The workflow supports `draft` and `staging-primary`. It does not configure a final domain, set `PUBLIC_SITE_READY=true`, merge PR #1, or enable live intake.

## Trigger behavior while PR #1 is unmerged

The branch push trigger permits the workflow to execute before the workflow file reaches `main`. Configure the `staging` GitHub environment secrets before approving the job. When secrets are added after an initial blocked or failed run, re-run the job from the Actions interface.

GitHub normally exposes the **Run workflow** selector for workflow files on the default branch. Until PR #1 is merged—which is not authorized during this phase—the branch-triggered run and re-run controls are the dependable path.
