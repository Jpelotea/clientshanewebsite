from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
import os
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
READY = os.environ.get("PUBLIC_SITE_READY", "false").lower() == "true"
errors: list[str] = []
warnings: list[str] = []

class AuditParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.h1 = 0
        self.title = 0
        self.lang = False
        self.noindex = False
        self.links: list[str] = []
        self.images_without_alt = 0
        self.ids: set[str] = set()
        self.label_for: set[str] = set()
        self.controls: list[tuple[str, str, bool]] = []
        self.label_depth = 0

    def handle_starttag(self, tag: str, attrs_list: list[tuple[str, str | None]]) -> None:
        attrs = dict(attrs_list)
        if tag == "html" and attrs.get("lang"):
            self.lang = True
        if tag == "title":
            self.title += 1
        if tag == "h1":
            self.h1 += 1
        if tag == "meta" and attrs.get("name", "").lower() == "robots" and "noindex" in attrs.get("content", "").lower():
            self.noindex = True
        if tag == "a" and attrs.get("href"):
            self.links.append(attrs["href"] or "")
        if tag == "img" and "alt" not in attrs:
            self.images_without_alt += 1
        if attrs.get("id"):
            self.ids.add(attrs["id"] or "")
        if tag == "label":
            self.label_depth += 1
            if attrs.get("for"):
                self.label_for.add(attrs["for"] or "")
        if tag in {"input", "select", "textarea"}:
            control_type = attrs.get("type", "") or ""
            if control_type != "hidden":
                self.controls.append((tag, attrs.get("id", "") or "", self.label_depth > 0))

    def handle_endtag(self, tag: str) -> None:
        if tag == "label" and self.label_depth:
            self.label_depth -= 1


def route_for_file(path: Path) -> str:
    relative = path.relative_to(DIST)
    if relative.name == "index.html":
        parent = str(relative.parent).replace("\\", "/").strip(".")
        return "/" if parent in {"", "."} else f"/{parent.strip('/')}/"
    return f"/{str(relative).replace('\\', '/')}"


def target_exists(href: str) -> bool:
    parsed = urlparse(href)
    if parsed.scheme or parsed.netloc or href.startswith(("mailto:", "tel:", "#")):
        return True
    path = parsed.path
    if not path or path.startswith("/api/"):
        return True
    candidate = DIST / path.lstrip("/")
    if path.endswith("/"):
        candidate = candidate / "index.html"
    elif not candidate.suffix:
        candidate = candidate / "index.html"
    return candidate.is_file()

if not DIST.is_dir():
    print("dist/ does not exist. Run the production build first.")
    sys.exit(1)

html_files = sorted(DIST.rglob("*.html"))
if len(html_files) < 18:
    errors.append(f"Expected at least 18 HTML files, found {len(html_files)}.")

placeholder_patterns = [
    r"\[APPROVED ", r"\[PUBLIC ", r"\[BRANCH ", r"\[COMPLIANCE-APPROVED",
    r"\[TESTIMONIAL", r"\[LEADER ", r"\[VERIFIED ", r"\[SHANE", r"\[MANULIFE",
    r"REQUIRES FINAL VERIFICATION", r"PENDING WRITTEN PERMISSION"
]

seen_titles: dict[str, str] = {}
for html_file in html_files:
    text = html_file.read_text(encoding="utf-8")
    parser = AuditParser()
    parser.feed(text)
    route = route_for_file(html_file)

    if not parser.lang:
        errors.append(f"{route}: missing html lang attribute")
    if parser.title != 1:
        errors.append(f"{route}: expected one title element, found {parser.title}")
    if parser.h1 != 1:
        errors.append(f"{route}: expected one h1, found {parser.h1}")
    if parser.images_without_alt:
        errors.append(f"{route}: {parser.images_without_alt} image(s) missing alt attributes")
    if not READY and not parser.noindex:
        errors.append(f"{route}: staging build is missing noindex")

    title_match = re.search(r"<title>(.*?)</title>", text, re.I | re.S)
    if title_match:
        title = re.sub(r"\s+", " ", title_match.group(1)).strip()
        if title in seen_titles and route != seen_titles[title]:
            warnings.append(f"Duplicate title: {route} and {seen_titles[title]} use {title!r}")
        else:
            seen_titles[title] = route

    for tag, control_id, nested in parser.controls:
        if not control_id:
            errors.append(f"{route}: {tag} control is missing an id")
        elif not nested and control_id not in parser.label_for:
            errors.append(f"{route}: control #{control_id} has no associated label")

    for href in parser.links:
        if not target_exists(href):
            errors.append(f"{route}: unresolved built link {href}")

    if READY:
        upper = text.upper()
        for pattern in placeholder_patterns:
            if re.search(pattern, upper):
                errors.append(f"{route}: launch-blocking placeholder or verification marker matched {pattern}")
                break

robots = DIST / "robots.txt"
if not robots.is_file():
    errors.append("robots.txt was not generated")
else:
    robots_text = robots.read_text(encoding="utf-8")
    if READY and "Allow: /" not in robots_text:
        errors.append("production robots.txt does not allow crawling")
    if not READY and "Disallow: /" not in robots_text:
        errors.append("staging robots.txt does not disallow crawling")
    if not READY and "Sitemap:" in robots_text:
        errors.append("staging robots.txt must not advertise a sitemap")

for asset in DIST.rglob("*"):
    if not asset.is_file():
        continue
    size = asset.stat().st_size
    if asset.suffix in {".js", ".css"} and size > 300_000:
        warnings.append(f"Large asset: {asset.relative_to(DIST)} is {size / 1024:.1f} KiB")

print(f"Audited {len(html_files)} HTML files. Site ready: {READY}.")
for warning in warnings:
    print(f"WARNING: {warning}")
if errors:
    print("\nErrors:")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)
print("Distribution audit passed.")
