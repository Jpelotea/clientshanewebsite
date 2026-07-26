from __future__ import annotations

import shutil
import tempfile
from pathlib import Path

import fitz

from validate_pdf import PdfValidationError, validate_matching_artifacts, validate_pdf

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public" / "documents" / "financial-advisor-career-fit-guide-draft.pdf"


def expect_failure(path: Path, label: str, expected_message: str | None = None) -> None:
    try:
        validate_pdf(path)
    except PdfValidationError as error:
        if expected_message and expected_message not in str(error):
            raise AssertionError(f"The {label} fixture failed for the wrong reason: {error}") from error
        return
    raise AssertionError(f"The PDF validator incorrectly accepted the {label} fixture.")


def main() -> None:
    valid = validate_pdf(SOURCE)
    assert valid.pages == 4
    assert valid.text_characters >= 1_500

    with tempfile.TemporaryDirectory(prefix="career-guide-regression-") as temporary:
        folder = Path(temporary)

        wrong_extension = folder / "career-guide.txt"
        shutil.copy2(SOURCE, wrong_extension)
        expect_failure(wrong_extension, "wrong extension", "Expected a .pdf extension")

        wrong_header = folder / "wrong-header.pdf"
        wrong_header.write_bytes(b"NOT-A-PDF" + b" controlled invalid header" * 500)
        expect_failure(wrong_header, "wrong header", "does not begin with a PDF header")

        truncated = folder / "truncated.pdf"
        data = SOURCE.read_bytes()
        truncated.write_bytes(data[: max(100, len(data) // 2)])
        expect_failure(truncated, "truncated")

        wrong_count = folder / "wrong-page-count.pdf"
        document = fitz.open()
        document.new_page()
        document.set_metadata({"title": valid.title, "author": valid.author, "subject": valid.subject})
        document.save(wrong_count)
        document.close()
        with wrong_count.open("ab") as handle:
            handle.write(b"\n%" + b" controlled wrong-page-count fixture" * 300)
        expect_failure(wrong_count, "wrong-page-count", "Expected 4 pages")

        blank = folder / "blank-pages.pdf"
        document = fitz.open()
        invisible_text = "Controlled invisible text fixture " * 20
        for _ in range(4):
            page = document.new_page()
            page.insert_textbox(
                fitz.Rect(36, 36, 560, 800),
                invisible_text,
                fontsize=10,
                color=(1, 1, 1),
            )
        document.set_metadata({"title": valid.title, "author": valid.author, "subject": valid.subject})
        document.save(blank)
        document.close()
        with blank.open("ab") as handle:
            handle.write(b"\n%" + b" controlled visually blank fixture" * 300)
        expect_failure(blank, "visually blank page", "appears blank")


        missing_metadata = folder / "missing-metadata.pdf"
        document = fitz.open(SOURCE)
        document.set_metadata({})
        document.save(missing_metadata, garbage=4, deflate=True)
        document.close()
        expect_failure(missing_metadata, "missing metadata", "Unexpected PDF title metadata")

        mismatch = folder / "mismatch.pdf"
        shutil.copy2(SOURCE, mismatch)
        with mismatch.open("ab") as handle:
            handle.write(b"\n% controlled mismatch fixture\n")
        try:
            validate_matching_artifacts(SOURCE, mismatch)
        except PdfValidationError as error:
            assert "does not exactly match" in str(error)
        else:
            raise AssertionError("The PDF validator incorrectly accepted mismatched source and built artifacts.")

    print("PDF validator regression tests passed: valid, extension, header, truncated, page-count, visually blank, metadata, and mismatch fixtures.")


if __name__ == "__main__":
    main()
