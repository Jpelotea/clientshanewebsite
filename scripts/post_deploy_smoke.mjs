import process from 'node:process';
import {
  createRequestClient,
  hasExpectedCustom404Heading,
  waitForDeploymentReady
} from './post_deploy_smoke_support.mjs';

const deployUrl = required('DEPLOY_URL').replace(/\/$/, '');
const primaryUrl = required('PRIMARY_STAGING_URL').replace(/\/$/, '');
const username = required('STAGING_ACCESS_USERNAME');
const password = required('STAGING_ACCESS_PASSWORD');
const authorization = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

const routes = [
  ['/', 'Building Careers'],
  ['/about-shane/', 'About Shane'],
  ['/leadership-journey/', 'Leadership Journey'],
  ['/builder-of-builders/', 'Builder of Builders'],
  ['/join-my-team/', 'Career Opportunities'],
  ['/team-leadership-community/', 'Leadership Community'],
  ['/financial-education/', 'Financial Education'],
  ['/insights/', 'Insights'],
  ['/success-stories/', 'Success Stories'],
  ['/events-achievements/', 'Events'],
  ['/book-consultation/', 'Request a consultation'],
  ['/recruitment-application/', 'Submit your application'],
  ['/contact/', 'Send an inquiry'],
  ['/privacy-policy/', 'Privacy Policy'],
  ['/cookie-notice/', 'Cookie Notice'],
  ['/terms-disclosures/', 'Terms'],
  ['/admin/', 'Shane Perez Content Editor']
];

const findings = [];
let checked = 0;

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function record(condition, message) {
  checked += 1;
  if (!condition) findings.push(message);
}

const { request, metrics } = createRequestClient({
  baseUrl: deployUrl,
  authorization
});

const readiness = await waitForDeploymentReady({ request });
const unauthorized = readiness.response;
record(unauthorized.status === 401, `Expected unauthenticated / to return 401, received ${unauthorized.status}.`);
record((unauthorized.headers.get('www-authenticate') || '').startsWith('Basic '), 'Missing Basic authentication challenge.');
record((unauthorized.headers.get('cache-control') || '').includes('no-store'), 'Unauthorized response is missing no-store cache control.');

for (const [path, expectedText] of routes) {
  const response = await request(path);
  const body = await response.text();
  record(response.status === 200, `${path} returned ${response.status}, expected 200.`);
  record(body.toLowerCase().includes(expectedText.toLowerCase()), `${path} is missing expected text: ${expectedText}.`);
  record(/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(body) || /<meta[^>]+content=["'][^"']*noindex/i.test(body), `${path} is missing page-level noindex metadata.`);
}

const insights = await request('/insights/');
const insightsBody = await insights.text();
const articleLinks = [...insightsBody.matchAll(/href=["'](\/insights\/[^"'#?]+\/?)['"]/g)].map(match => match[1]);
for (const articlePath of [...new Set(articleLinks)]) {
  const response = await request(articlePath);
  record(response.status === 200, `${articlePath} returned ${response.status}, expected 200.`);
}

const robots = await request('/robots.txt');
const robotsBody = await robots.text();
record(robots.status === 200, `/robots.txt returned ${robots.status}, expected 200.`);
record(/User-agent:\s*\*/i.test(robotsBody), 'robots.txt is missing the wildcard user agent.');
record(/Disallow:\s*\//i.test(robotsBody), 'robots.txt does not disallow crawling.');

const pdf = await request('/documents/financial-advisor-career-fit-guide-draft.pdf');
record(pdf.status === 200, `Draft PDF returned ${pdf.status}, expected 200.`);
record((pdf.headers.get('content-type') || '').includes('application/pdf'), 'Draft PDF has an unexpected Content-Type.');
record((pdf.headers.get('x-robots-tag') || '').includes('noindex'), 'Draft PDF is missing X-Robots-Tag noindex.');

const missing = await request('/technical-staging-missing-route/');
record(missing.status === 404, `Custom missing route returned ${missing.status}, expected 404.`);
const missingBody = await missing.text();
record(hasExpectedCustom404Heading(missingBody), 'Custom 404 response is missing its main message.');

for (const path of ['/recruitment-application/', '/book-consultation/', '/contact/']) {
  const response = await request(path);
  const body = await response.text();
  record(body.includes('temporarily disabled in the technical staging environment'), `${path} does not show the staging-disabled form notice.`);
  record(/<fieldset[^>]*disabled/i.test(body), `${path} does not render a disabled form fieldset.`);
}

const formResponse = await request('/api/forms/contact', {
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded',
    Origin: new URL(deployUrl).origin
  },
  body: new URLSearchParams({
    fullName: 'Synthetic Test',
    email: 'synthetic@example.invalid',
    subject: 'Technical smoke test',
    message: 'Synthetic technical test; no personal information.',
    dataConsent: 'yes',
    website: ''
  })
});
record([400, 503].includes(formResponse.status), `Protected contact function returned ${formResponse.status}; expected safe 400 or 503 while integrations are disabled.`);

const home = await request('/');
const homeBody = await home.text();
record(!/<script[^>]+src=["'][^"']*googletagmanager/i.test(homeBody), 'Google Analytics loaded before approval or consent.');
record(!/<script[^>]+src=["'][^"']*connect\.facebook\.net/i.test(homeBody), 'Meta Pixel loaded before approval or consent.');

if (findings.length) {
  console.error(`Post-deployment smoke test failed (${findings.length} finding(s) across ${checked} checks).`);
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

const totalRetries = metrics.retryEvents + readiness.retryEvents;
console.log(
  `Post-deployment smoke test passed: ${checked} checks against ${deployUrl}. ` +
  `Readiness attempts: ${readiness.attempts}. Retry events: ${totalRetries}. Primary staging URL: ${primaryUrl}.`
);
