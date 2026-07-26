import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('targeted technical remediation regressions', () => {
  it('wires structural and rendered PDF validation into local and CI commands', () => {
    const packageFile = JSON.parse(read('package.json')) as { scripts: Record<string, string> };
    const validateWorkflow = read('.github/workflows/validate.yml');
    const deployWorkflow = read('.github/workflows/deploy-staging.yml');
    expect(packageFile.scripts['validate:pdf']).toContain('scripts/validate_pdf.py');
    expect(packageFile.scripts['test:pdf']).toContain('scripts/test_pdf_validation.py');
    expect(packageFile.scripts.build).toContain('--built dist/documents/financial-advisor-career-fit-guide-draft.pdf');
    expect(validateWorkflow).toContain('career-guide-pdf-validation');
    expect(validateWorkflow).toContain('npm run test:pdf');
    expect(deployWorkflow).toContain('npm run validate:pdf');
    expect(deployWorkflow).toContain('npm run test:pdf');
  });

  it('keeps the skip-link target programmatically focusable and moves focus after activation', () => {
    const layout = read('src/layouts/BaseLayout.astro');
    expect(layout).toContain('<main id="main-content" tabindex="-1">');
    expect(layout).toContain("skipLink?.addEventListener('click'");
    expect(layout).toContain("mainContent.focus({ preventScroll: true })");
  });

  it('uses coherent modal semantics and focus containment for cookie choices', () => {
    const cookie = read('src/components/global/CookieConsent.astro');
    expect(cookie).toContain('aria-modal="true"');
    expect(cookie).toContain("event.key !== 'Tab'");
    expect(cookie).toContain('element.inert = true');
    expect(cookie).toContain('setBackgroundInactive(false)');
    expect(cookie).toContain('returnFocus.focus()');
  });

  it('renders event cards at h2 on the events page while preserving reusable h3 defaults', () => {
    const card = read('src/components/cards/EventCard.astro');
    const page = read('src/pages/events-achievements.astro');
    expect(card).toContain("headingLevel?: 'h2' | 'h3'");
    expect(card).toContain("headingLevel = 'h3'");
    expect(page).toContain('headingLevel="h2"');
  });

  it('uses a two-layer high-contrast focus treatment and forced-colors fallback', () => {
    const css = read('src/styles/global.css');
    expect(css).toContain('--focus-ring-dark:#063b2b');
    expect(css).toContain('--focus-ring-light:#fff');
    expect(css).toContain('outline:3px solid var(--focus-ring-light)');
    expect(css).toContain('box-shadow:0 0 0 5px var(--focus-ring-dark)');
    expect(css).toContain('@media(forced-colors:active)');

    const luminance = (hex: string) => {
      const value = hex.replace('#', '');
      const normalized = value.length === 3 ? value.split('').map((item) => item + item).join('') : value;
      const channels = [0, 2, 4].map((offset) => Number.parseInt(normalized.slice(offset, offset + 2), 16) / 255);
      const [red, green, blue] = channels.map((channel) => channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4);
      return (0.2126 * red) + (0.7152 * green) + (0.0722 * blue);
    };
    const contrast = (first: string, second: string) => {
      const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
      return (values[0] + 0.05) / (values[1] + 0.05);
    };

    expect(contrast('#063b2b', '#ffffff')).toBeGreaterThanOrEqual(3);
    expect(contrast('#ffffff', '#06261c')).toBeGreaterThanOrEqual(3);
  });

  it('limits the staging CSP to active self-hosted resources', () => {
    const config = read('netlify.toml');
    expect(config).toContain("object-src 'none'");
    expect(config).toContain("base-uri 'self'");
    expect(config).toContain("frame-ancestors 'none'");
    expect(config).toContain("connect-src 'self'");
    expect(config).not.toMatch(/googletagmanager|facebook\.net|google-analytics|challenges\.cloudflare|unpkg\.com|api\.github\.com|api\.netlify\.com/);
  });

  it('keeps the admin route staging-safe without executing third-party CMS code', () => {
    const admin = read('public/admin/index.html');
    expect(admin).toContain('<h1>Shane Perez Content Editor</h1>');
    expect(admin).toContain('intentionally unavailable in technical staging');
    expect(admin).not.toContain('<script');
    expect(admin).not.toMatch(/unpkg|jsdelivr|decap-cms\.js/);
  });

  it('preserves core post-deployment smoke assertions and the exact custom 404 heading', () => {
    const smoke = read('scripts/post_deploy_smoke.mjs');
    const helper = read('scripts/post_deploy_smoke_support.mjs');
    expect(smoke).toContain("['/admin/', 'Shane Perez Content Editor']");
    expect(smoke).toContain("['/recruitment-application/', 'Submit your application']");
    expect(smoke).toContain("['/book-consultation/', 'Request a consultation']");
    expect(smoke).toContain("['/contact/', 'Send an inquiry']");
    expect(smoke).toContain("!/<script[^>]+src=[\"'][^\"']*googletagmanager/i");
    expect(smoke).toContain("!/<script[^>]+src=[\"'][^\"']*connect\\.facebook\\.net/i");
    expect(helper).toContain('This page could not be found\\.');
  });
});
