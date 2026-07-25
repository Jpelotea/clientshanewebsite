# GitHub Workflow

## Branch model

```text
main
-> chore/technical-validation-and-staging
-> logical commits
-> draft pull request
-> automated validation
-> review and content/compliance follow-up
```

Do not perform major validation work directly on `main`. Do not force-push or merge without explicit authorization.

## Commit guidance

Use focused messages such as:

- `chore: initialize Shane Perez website project`
- `fix: resolve Astro build and content validation errors`
- `security: harden public forms and resume upload handling`
- `test: add locked automated project validation`
- `docs: update deployment and environment setup`

## Pull-request requirements

The pull request should include:

- Scope and architecture confirmation
- File and security changes
- Actual test and build results
- GitHub Actions result
- Staging status
- Pending credentials, content, and approvals
- Confirmation that production was not merged or deployed

## Public-repository rules

Never commit credentials, real environment files, résumés, submissions, private contact data, identity documents, private compliance material, or unapproved photographs.
