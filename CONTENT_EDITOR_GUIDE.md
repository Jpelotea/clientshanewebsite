# Decap CMS Editor Guide

## Repository configuration

The committed CMS configuration uses:

```yaml
backend:
  name: github
  repo: Jpelotea/clientshanewebsite
  branch: main
  use_graphql: true
publish_mode: editorial_workflow
```

No GitHub token or OAuth secret belongs in `config.yml`.

## Technical-staging runtime status

The `/admin/` route intentionally does not execute Decap CMS during the current technical-remediation phase. This removes the previous third-party `unpkg` runtime dependency without activating OAuth or publishing. When Milestone B is approved, the CMS bundle must be pinned and self-hosted (or delivered through another integrity-controlled method) before the login and editorial workflow are enabled.

## Authentication setup

1. Connect the repository to the authorized Netlify site.
2. Create the approved GitHub OAuth application.
3. Configure the Netlify OAuth provider and callback for the final Netlify domain.
4. Grant repository access only to approved editors.
5. Test authentication through `/admin/` on a controlled staging site.

The project does not use deprecated Git Gateway configuration.

## Editorial workflow

1. Create or edit an entry.
2. Keep incomplete content in draft.
3. Move it to review for Shane and compliance/legal review where required.
4. Record written permission and approval outside the public repository when it contains private evidence.
5. Set the content `status` field to `approved` only after approval.
6. Publish the CMS editorial change through its auditable branch and pull-request workflow.

The CMS workflow and the content `status` field serve different purposes: editorial workflow manages repository changes, while `status` controls whether site code lists an item publicly.

## Editable content

- Insights articles
- Testimonials and team success stories
- Leadership profiles
- Events
- Achievements
- Downloadable resources
- Selected homepage headings and copy
- Career and consultation FAQs

## Developer-managed content

- Navigation and footer structure
- Page layouts and section order
- Forms and server validation
- Legal-page structure
- Security, analytics, and consent code
- Design tokens and global styles
- Environment variables
- New integrations or content models

## Media rules

- Upload only content approved for public repository storage.
- Never upload résumés, applicant records, identity documents, private compliance material, or confidential business files.
- Use descriptive alternative text.
- Keep temporary or unapproved photographs outside the public repository.
- The CMS media folder is public website media, not secure storage.
