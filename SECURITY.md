# Security and Privacy Notes

This is a public source repository for a website that may receive recruitment and consultation information. Do not report security issues by opening a public issue containing secrets, personal data, or exploitation details.

## Repository boundaries

The repository contains application code and public approved assets only. It must not contain:

- Credentials or tokens
- Real `.env` files
- Résumés or applicant data
- Consultation/contact submissions
- Identity documents
- Private photographs
- Confidential business or compliance records

## Form-data boundary

Form information is processed at runtime. Résumés are stored in a private external bucket and are never written to the repository or public website directory.

## Operational requirements

- Use least-privilege credentials.
- Rotate exposed credentials immediately.
- Keep storage private and enforce lifecycle deletion.
- Restrict recipient mailboxes and CMS access.
- Review logs for accidental personal-data exposure.
- Complete an authorized staging security review before accepting live data.
