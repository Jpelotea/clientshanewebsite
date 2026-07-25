from pathlib import Path
import json, tomllib, re, sys
import yaml
root = Path(__file__).resolve().parents[1]
errors = []
checks = []
for path in root.rglob('*.json'):
    try:
        json.loads(path.read_text(encoding='utf-8')); checks.append(path)
    except Exception as exc: errors.append(f'{path.relative_to(root)}: invalid JSON: {exc}')
for path in root.rglob('*.yml'):
    try:
        yaml.safe_load(path.read_text(encoding='utf-8')); checks.append(path)
    except Exception as exc: errors.append(f'{path.relative_to(root)}: invalid YAML: {exc}')
for path in root.rglob('*.toml'):
    try:
        tomllib.loads(path.read_text(encoding='utf-8')); checks.append(path)
    except Exception as exc: errors.append(f'{path.relative_to(root)}: invalid TOML: {exc}')
for path in root.rglob('*.md'):
    text = path.read_text(encoding='utf-8')
    if text.startswith('---\n'):
        try:
            _, frontmatter, _ = text.split('---', 2); yaml.safe_load(frontmatter); checks.append(path)
        except Exception as exc: errors.append(f'{path.relative_to(root)}: invalid frontmatter: {exc}')
page_routes = {'/'}
for path in (root / 'src/pages').rglob('*.astro'):
    relative = path.relative_to(root / 'src/pages')
    if relative.name == 'index.astro': route = '/' + str(relative.parent).replace('\\', '/').strip('/') + '/'
    elif relative.name.startswith('['): continue
    else: route = '/' + str(relative.with_suffix('')).replace('\\', '/').strip('/') + '/'
    page_routes.add(route.replace('//', '/'))
public_paths = {'/' + str(path.relative_to(root / 'public')).replace('\\', '/') for path in (root / 'public').rglob('*') if path.is_file()}
for path in list((root / 'src').rglob('*.astro')) + list((root / 'src/content').rglob('*.md')):
    text = path.read_text(encoding='utf-8')
    for match in re.findall(r'(?:href=|href:|\]\()(["\']?)(/[^"\')\s#?]+)', text):
        target = match[1]
        if target.startswith(('/api/', '/images/uploads/', '/icons/')): continue
        normalized = target if target.endswith('/') or '.' in target.rsplit('/', 1)[-1] else target + '/'
        if normalized not in page_routes and target not in public_paths: errors.append(f'{path.relative_to(root)}: unresolved local target {target}')
print(f'Validated {len(checks)} structured files, {len(page_routes)} static routes, and {len(public_paths)} public files.')
if errors:
    print('\nErrors:')
    for error in errors: print(f'- {error}')
    sys.exit(1)
print('No structural validation errors found.')
