from __future__ import annotations

from pathlib import Path
import json
import re
import sys
import tomllib

import yaml

ROOT = Path(__file__).resolve().parents[1]
EXCLUDED_PARTS = {
    '.git',
    '.astro',
    '.netlify',
    'coverage',
    'dist',
    'node_modules',
    'private-uploads',
    'test-uploads',
}
errors: list[str] = []
checks: list[Path] = []


def project_files(pattern: str):
    for path in ROOT.rglob(pattern):
        if any(part in EXCLUDED_PARTS for part in path.relative_to(ROOT).parts):
            continue
        if path.is_file():
            yield path


for path in project_files('*.json'):
    try:
        json.loads(path.read_text(encoding='utf-8'))
        checks.append(path)
    except Exception as exc:
        errors.append(f'{path.relative_to(ROOT)}: invalid JSON: {exc}')

for path in project_files('*.yml'):
    try:
        yaml.safe_load(path.read_text(encoding='utf-8'))
        checks.append(path)
    except Exception as exc:
        errors.append(f'{path.relative_to(ROOT)}: invalid YAML: {exc}')

for path in project_files('*.toml'):
    try:
        tomllib.loads(path.read_text(encoding='utf-8'))
        checks.append(path)
    except Exception as exc:
        errors.append(f'{path.relative_to(ROOT)}: invalid TOML: {exc}')

for path in project_files('*.md'):
    text = path.read_text(encoding='utf-8')
    if text.startswith('---\n'):
        try:
            _, frontmatter, _ = text.split('---', 2)
            yaml.safe_load(frontmatter)
            checks.append(path)
        except Exception as exc:
            errors.append(f'{path.relative_to(ROOT)}: invalid frontmatter: {exc}')

page_routes = {'/'}
for path in (ROOT / 'src/pages').rglob('*.astro'):
    relative = path.relative_to(ROOT / 'src/pages')
    if relative.name == 'index.astro':
        route = '/' + str(relative.parent).replace('\\', '/').strip('/') + '/'
    elif relative.name.startswith('['):
        continue
    else:
        route = '/' + str(relative.with_suffix('')).replace('\\', '/').strip('/') + '/'
    page_routes.add(route.replace('//', '/'))

public_paths = {
    '/' + str(path.relative_to(ROOT / 'public')).replace('\\', '/')
    for path in (ROOT / 'public').rglob('*')
    if path.is_file()
}

source_files = list((ROOT / 'src').rglob('*.astro')) + list((ROOT / 'src/content').rglob('*.md'))
for path in source_files:
    text = path.read_text(encoding='utf-8')
    for match in re.findall(r'(?:href=|href:|\]\()(["\']?)(/[^"\')\s#?]+)', text):
        target = match[1]
        if target.startswith(('/api/', '/images/uploads/', '/icons/')):
            continue
        normalized = target if target.endswith('/') or '.' in target.rsplit('/', 1)[-1] else target + '/'
        if normalized not in page_routes and target not in public_paths:
            errors.append(f'{path.relative_to(ROOT)}: unresolved local target {target}')

print(f'Validated {len(checks)} structured files, {len(page_routes)} static routes, and {len(public_paths)} public files.')
if errors:
    print('\nErrors:')
    for error in errors:
        print(f'- {error}')
    sys.exit(1)
print('No structural validation errors found.')
