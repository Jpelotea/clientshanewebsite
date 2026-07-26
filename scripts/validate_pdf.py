from __future__ import annotations

import argparse
import hashlib
import json
import math
import shutil
import subprocess
import sys
import tempfile
from dataclasses import asdict, dataclass
from pathlib import Path

import fitz
from pypdf import PdfReader

EXPECTED_TITLE = "Is a Financial Advisor Career Right for You? - Review Draft"
EXPECTED_AUTHOR = "JC Pelotea"
EXPECTED_SUBJECT_FRAGMENT = "career-fit guide"
EXPECTED_LANGUAGE = "en-PH"
EXPECTED_PAGES = 4
MIN_PAGE_TEXT = 120
MIN_TOTAL_TEXT = 1_500
MIN_NONWHITE_RATIO = 0.01
MIN_PAGE_STDDEV = 4.0


class PdfValidationError(RuntimeError):
    pass


@dataclass
class PageResult:
    page: int
    text_characters: int
    nonwhite_ratio: float
    grayscale_stddev: float
    width: int
    height: int


@dataclass
class PdfResult:
    path: str
    sha256: str
    bytes: int
    pages: int
    title: str
    author: str
    subject: str
    language: str
    outline_entries: int
    embedded_fonts: list[str]
    page_results: list[PageResult]
    text_characters: int
    external_checks: dict[str, str]


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def require(condition: bool, message: str) -> None:
    if not condition:
        raise PdfValidationError(message)


def run_tool(command: list[str], label: str) -> str:
    executable = shutil.which(command[0])
    require(executable is not None, f"Required PDF tool is unavailable: {command[0]}")
    completed = subprocess.run(
        [executable, *command[1:]],
        check=False,
        capture_output=True,
        text=True,
        timeout=90,
    )
    combined = "\n".join(part.strip() for part in (completed.stdout, completed.stderr) if part.strip())
    require(completed.returncode == 0, f"{label} failed with exit code {completed.returncode}: {combined[-800:]}")
    return combined[-800:]


def count_outline_entries(items: list[object]) -> int:
    total = 0
    for item in items:
        if isinstance(item, list):
            total += count_outline_entries(item)
        else:
            total += 1
    return total


def grayscale_metrics(samples: bytes) -> tuple[float, float]:
    require(bool(samples), "Rendered page produced no pixel data.")
    count = len(samples)
    nonwhite = sum(value < 250 for value in samples) / count
    mean = sum(samples) / count
    variance = sum((value - mean) ** 2 for value in samples) / count
    return nonwhite, math.sqrt(variance)


def validate_pdf(path: Path, expected_pages: int = EXPECTED_PAGES, render_dir: Path | None = None) -> PdfResult:
    path = path.resolve()
    require(path.is_file(), f"Expected PDF is missing: {path}")
    require(path.suffix.lower() == ".pdf", f"Expected a .pdf extension: {path}")
    require(path.stat().st_size > 8_000, f"PDF is unexpectedly small: {path.stat().st_size} bytes")
    require(path.read_bytes()[:5] == b"%PDF-", "File does not begin with a PDF header.")

    try:
        reader = PdfReader(str(path), strict=True)
        page_count = len(reader.pages)
        require(page_count == expected_pages, f"Expected {expected_pages} pages, found {page_count}.")
        metadata = reader.metadata or {}
        title = str(metadata.get("/Title") or "")
        author = str(metadata.get("/Author") or "")
        subject = str(metadata.get("/Subject") or "")
        language = str(reader.trailer["/Root"].get("/Lang") or "")
        outline_entries = count_outline_entries(list(reader.outline or []))
        # Force strict content-stream parsing on every page.
        for page in reader.pages:
            page.get_contents()
            page.extract_text()
    except PdfValidationError:
        raise
    except Exception as error:
        raise PdfValidationError(f"Strict PDF parsing failed: {type(error).__name__}: {error}") from error

    if render_dir:
        render_dir.mkdir(parents=True, exist_ok=True)

    page_results: list[PageResult] = []
    text_total = 0
    embedded_fonts: set[str] = set()
    try:
        document = fitz.open(path)
        require(document.page_count == expected_pages, f"PyMuPDF found {document.page_count} pages; expected {expected_pages}.")
        for index, page in enumerate(document):
            text = page.get_text("text").strip()
            text_total += len(text)
            require(len(text) >= MIN_PAGE_TEXT, f"Page {index + 1} has too little extractable text ({len(text)} characters).")

            pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2), colorspace=fitz.csGRAY, alpha=False)
            nonwhite, stddev = grayscale_metrics(pixmap.samples)
            require(nonwhite >= MIN_NONWHITE_RATIO, f"Page {index + 1} appears blank (non-white ratio {nonwhite:.4f}).")
            require(stddev >= MIN_PAGE_STDDEV, f"Page {index + 1} appears visually empty (grayscale standard deviation {stddev:.2f}).")
            if render_dir:
                pixmap.save(render_dir / f"page-{index + 1}.png")

            for font in page.get_fonts(full=True):
                xref, extension, _font_type, base_font, *_rest = font
                if xref > 0 and extension.lower() in {"ttf", "otf", "cff", "cid"}:
                    embedded_fonts.add(base_font)

            page_results.append(
                PageResult(
                    page=index + 1,
                    text_characters=len(text),
                    nonwhite_ratio=round(nonwhite, 6),
                    grayscale_stddev=round(stddev, 3),
                    width=pixmap.width,
                    height=pixmap.height,
                )
            )
        document.close()
    except PdfValidationError:
        raise
    except Exception as error:
        raise PdfValidationError(f"PDF rendering failed: {type(error).__name__}: {error}") from error

    require(text_total >= MIN_TOTAL_TEXT, f"PDF contains too little extractable text ({text_total} characters).")
    require(bool(embedded_fonts), "No embedded TrueType/OpenType fonts were detected.")

    require(title == EXPECTED_TITLE, f"Unexpected PDF title metadata: {title!r}")
    require(author == EXPECTED_AUTHOR, f"Unexpected PDF author metadata: {author!r}")
    require(EXPECTED_SUBJECT_FRAGMENT.lower() in subject.lower(), f"PDF subject metadata is incomplete: {subject!r}")
    require(language == EXPECTED_LANGUAGE, f"Expected PDF language {EXPECTED_LANGUAGE!r}, found {language!r}")
    require(outline_entries >= expected_pages, f"Expected at least {expected_pages} outline entries, found {outline_entries}.")

    external_checks: dict[str, str] = {}
    external_checks["pdfinfo"] = run_tool(["pdfinfo", str(path)], "pdfinfo")
    external_checks["ghostscript"] = run_tool(
        ["gs", "-q", "-dSAFER", "-dBATCH", "-dNOPAUSE", "-sDEVICE=nullpage", str(path)],
        "Ghostscript structural check",
    )
    external_checks["pdffonts"] = run_tool(["pdffonts", str(path)], "pdffonts")
    with tempfile.TemporaryDirectory(prefix="career-guide-pdftotext-") as temporary:
        extracted = Path(temporary) / "guide.txt"
        external_checks["pdftotext"] = run_tool(["pdftotext", "-layout", str(path), str(extracted)], "pdftotext")
        extracted_text = extracted.read_text(errors="replace").strip()
        require(len(extracted_text) >= MIN_TOTAL_TEXT, f"Poppler extracted too little text ({len(extracted_text)} characters).")

    return PdfResult(
        path=str(path),
        sha256=sha256(path),
        bytes=path.stat().st_size,
        pages=expected_pages,
        title=title,
        author=author,
        subject=subject,
        language=language,
        outline_entries=outline_entries,
        embedded_fonts=sorted(embedded_fonts),
        page_results=page_results,
        text_characters=text_total,
        external_checks=external_checks,
    )


def validate_matching_artifacts(source: Path, built: Path, expected_pages: int = EXPECTED_PAGES) -> tuple[PdfResult, PdfResult]:
    source_result = validate_pdf(source, expected_pages)
    built_result = validate_pdf(built, expected_pages)
    require(source_result.sha256 == built_result.sha256, "Built PDF does not exactly match the approved source PDF.")
    return source_result, built_result


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate structural, visual, textual, and metadata quality of the career guide PDF.")
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--built", type=Path)
    parser.add_argument("--expected-pages", type=int, default=EXPECTED_PAGES)
    parser.add_argument("--render-dir", type=Path)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        source_result = validate_pdf(args.source, args.expected_pages, args.render_dir)
        result: dict[str, object] = {"source": asdict(source_result)}
        if args.built:
            _, built_result = validate_matching_artifacts(args.source, args.built, args.expected_pages)
            result["built"] = asdict(built_result)
        print(json.dumps(result, indent=2, sort_keys=True))
        return 0
    except PdfValidationError as error:
        print(f"PDF validation failed: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
