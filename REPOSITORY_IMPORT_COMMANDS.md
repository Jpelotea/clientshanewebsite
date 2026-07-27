# Exact Repository Import and Pull-Request Commands

These commands initialize the reviewed local project in the existing working branch without rewriting `main` history.

```bash
git clone https://github.com/Jpelotea/clientshanewebsite.git
cd clientshanewebsite
git fetch origin
git switch chore/technical-validation-and-staging

# Remove the branch's placeholder repository files only after reviewing the diff.
find . -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +

# Copy the contents of the extracted validated package into this directory.
# Example when the package is extracted beside the repository:
cp -a ../shane-perez-website-validated/. .

# Confirm no credentials, submissions, or private uploads are present.
git status --short
git diff -- . ':!package-lock.json'

npm install --no-audit --no-fund
npm run validate:source
npm test
npm run check
npm run build
npm run netlify:dev

# Stop netlify:dev after completing the smoke tests in TESTING_CHECKLIST.md.

git add -A
git commit -m "chore: initialize Shane Perez website project"
git push -u origin chore/technical-validation-and-staging

# PR #1 already exists as a draft. Review it at:
# https://github.com/Jpelotea/clientshanewebsite/pull/1
```

After the first successful `npm install`, commit `package-lock.json`. Subsequent local and CI runs should use `npm ci`.

Do not merge the draft pull request or connect the production Netlify context until the validation report has been updated with successful evidence.
