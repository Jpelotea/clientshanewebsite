from __future__ import annotations

from pathlib import Path
import hashlib

import reportlab

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas as canvas_module
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
    PageBreak,
)

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "documents" / "financial-advisor-career-fit-guide-draft.pdf"
PAGE_W, PAGE_H = A4
GREEN = colors.HexColor("#0B3A2B")
GREEN_2 = colors.HexColor("#155944")
GOLD = colors.HexColor("#C59B51")
INK = colors.HexColor("#1F2925")
MUTED = colors.HexColor("#5B6560")
PALE = colors.HexColor("#F3F6F4")
WARM = colors.HexColor("#FBF7EF")
LINE = colors.HexColor("#D7DFDA")
ERROR = colors.HexColor("#8E352E")

REPORTLAB_FONT_DIR = Path(reportlab.__file__).resolve().parent / "fonts"
FONT_REGULAR_PATH = REPORTLAB_FONT_DIR / "Vera.ttf"
FONT_BOLD_PATH = REPORTLAB_FONT_DIR / "VeraBd.ttf"
FONT_REGULAR = "GuideSans"
FONT_BOLD = "GuideSans-Bold"

for font_path in (FONT_REGULAR_PATH, FONT_BOLD_PATH):
    if not font_path.is_file():
        raise FileNotFoundError(f"Required embedded font is unavailable: {font_path}")

pdfmetrics.registerFont(TTFont(FONT_REGULAR, str(FONT_REGULAR_PATH)))
pdfmetrics.registerFont(TTFont(FONT_BOLD, str(FONT_BOLD_PATH)))

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="GuideTitle", parent=styles["Title"], fontName=FONT_BOLD, fontSize=27, leading=31, textColor=GREEN, spaceAfter=8 * mm, alignment=TA_LEFT))
styles.add(ParagraphStyle(name="GuideSubtitle", parent=styles["Normal"], fontName=FONT_REGULAR, fontSize=13, leading=18, textColor=INK, spaceAfter=7 * mm))
styles.add(ParagraphStyle(name="SectionHeading", parent=styles["Heading2"], fontName=FONT_BOLD, fontSize=17, leading=21, textColor=GREEN, spaceBefore=3 * mm, spaceAfter=4 * mm))
styles.add(ParagraphStyle(name="Subheading", parent=styles["Heading3"], fontName=FONT_BOLD, fontSize=11.5, leading=15, textColor=GREEN_2, spaceAfter=1.5 * mm))
styles.add(ParagraphStyle(name="BodyGuide", parent=styles["BodyText"], fontName=FONT_REGULAR, fontSize=10, leading=14.2, textColor=INK, spaceAfter=3.5 * mm))
styles.add(ParagraphStyle(name="SmallGuide", parent=styles["BodyText"], fontName=FONT_REGULAR, fontSize=8.5, leading=11.5, textColor=MUTED))
styles.add(ParagraphStyle(name="DraftNotice", parent=styles["BodyText"], fontName=FONT_BOLD, fontSize=9.2, leading=13, textColor=ERROR))
styles.add(ParagraphStyle(name="Checklist", parent=styles["BodyText"], fontName=FONT_REGULAR, fontSize=8.7, leading=11.5, textColor=INK))
styles.add(ParagraphStyle(name="TableHead", parent=styles["BodyText"], fontName=FONT_BOLD, fontSize=8.2, leading=10, textColor=colors.white, alignment=TA_CENTER))
styles.add(ParagraphStyle(name="BulletGuide", parent=styles["BodyText"], fontName=FONT_REGULAR, fontSize=10, leading=14, leftIndent=5 * mm, firstLineIndent=-3.5 * mm, bulletIndent=1.5 * mm, textColor=INK, spaceAfter=2.2 * mm))

def para(text: str, style: str = "BodyGuide") -> Paragraph:
    return Paragraph(text, styles[style])

def callout(text: str, background=PALE, color=INK) -> Table:
    content = Paragraph(text, ParagraphStyle(name=f"Callout{abs(hash(text))}", parent=styles["BodyGuide"], fontName=FONT_REGULAR, fontSize=9.4, leading=13.2, textColor=color, spaceAfter=0))
    table = Table([[content]], colWidths=[PAGE_W - 40 * mm])
    table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), background), ("BOX", (0, 0), (-1, -1), 0.8, LINE), ("LEFTPADDING", (0, 0), (-1, -1), 5 * mm), ("RIGHTPADDING", (0, 0), (-1, -1), 5 * mm), ("TOPPADDING", (0, 0), (-1, -1), 4 * mm), ("BOTTOMPADDING", (0, 0), (-1, -1), 4 * mm)]))
    return table

def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.5)
    canvas.line(20 * mm, 17 * mm, PAGE_W - 20 * mm, 17 * mm)
    canvas.setFont(FONT_REGULAR, 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(20 * mm, 11.5 * mm, "Shane Perez - Builder of Builders | REVIEW DRAFT")
    canvas.drawRightString(PAGE_W - 20 * mm, 11.5 * mm, f"Page {doc.page}")
    canvas.restoreState()

PAGE_BOOKMARKS = {
    1: ("cover", "Career-Fit Guide"),
    2: ("career-overview", "Career overview"),
    3: ("self-assessment", "Career-fit self-assessment"),
    4: ("next-steps", "Questions and next steps"),
}

def add_doc_metadata(canvas, doc):
    footer(canvas, doc)
    canvas.setTitle("Is a Financial Advisor Career Right for You? - Review Draft")
    canvas.setAuthor("JC Pelotea")
    canvas.setSubject("Draft career-fit guide for review and compliance approval")
    canvas.setCreator("Shane Perez website career-guide generator")
    canvas.setKeywords("career fit, financial advisor, review draft, Shane Perez")
    bookmark, label = PAGE_BOOKMARKS.get(doc.page, (f"page-{doc.page}", f"Page {doc.page}"))
    canvas.bookmarkPage(bookmark)
    canvas.addOutlineEntry(label, bookmark, level=0, closed=False)

def deterministic_canvas(filename, *args, **kwargs):
    kwargs["invariant"] = 1
    kwargs["pageCompression"] = 1
    kwargs["initialFontName"] = FONT_REGULAR
    kwargs["initialFontSize"] = 10
    kwargs["lang"] = "en-PH"
    return canvas_module.Canvas(filename, *args, **kwargs)

def make_document() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    frame = Frame(20 * mm, 22 * mm, PAGE_W - 40 * mm, PAGE_H - 42 * mm, id="normal")
    template = PageTemplate(id="guide", frames=[frame], onPage=add_doc_metadata)
    doc = BaseDocTemplate(str(OUTPUT), pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm, topMargin=20 * mm, bottomMargin=22 * mm, title="Is a Financial Advisor Career Right for You? - Review Draft", author="JC Pelotea", subject="Draft career-fit guide for review and compliance approval")
    doc.addPageTemplates([template])
    story = [Spacer(1, 13 * mm), para("REVIEW DRAFT", "DraftNotice"), Spacer(1, 3 * mm), para("Is a Financial Advisor Career<br/>Right for You?", "GuideTitle"), para("A Practical Career-Fit Guide for Young and Experienced Professionals", "GuideSubtitle"), Table([[Paragraph("Prepared for", styles["SmallGuide"]), Paragraph("Shane Perez - Builder of Builders", styles["Subheading"])]], colWidths=[32 * mm, 130 * mm], style=TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LINEABOVE", (0, 0), (-1, 0), 1, GOLD), ("TOPPADDING", (0, 0), (-1, -1), 4 * mm), ("BOTTOMPADDING", (0, 0), (-1, -1), 4 * mm)])), Spacer(1, 10 * mm), callout("<b>Important review notice.</b> Company-specific content, candidate criteria, opportunity details, and disclaimers require Shane's verification and compliance approval before public distribution.", background=WARM, color=ERROR), Spacer(1, 10 * mm), para("How to use this guide", "SectionHeading"), para("Use this draft as a reflection tool before applying. It is not an eligibility decision, employment offer, appointment, financial recommendation, income promise, or guarantee of career success."), para("The final approved version should be read together with the authorized role description, recruitment process, and required disclosures."), PageBreak()]
    story += [para("1. Start with the work, not only the title", "SectionHeading"), para("A Financial Advisor career may involve relationship building, continuous learning, prospecting, responsible client conversations, follow-through, documentation, professional standards, and self-management. The exact role description and authorized process must be confirmed before this guide is published."), callout("[COMPLIANCE-APPROVED ROLE DESCRIPTION REQUIRED]", background=WARM, color=ERROR), Spacer(1, 5 * mm), para("2. Experience that may transfer", "SectionHeading")]
    transferable = [("Sales and relationship management", "Experience starting conversations, understanding needs, explaining options, and maintaining professional relationships."), ("Customer service", "Experience listening carefully, resolving concerns, documenting information, and communicating with empathy."), ("Banking or financial services", "Familiarity with regulated environments, client trust, confidentiality, and financial concepts."), ("Leadership or entrepreneurship", "Experience setting goals, managing responsibilities, mentoring people, and creating opportunities.")]
    rows = [[para(title, "Subheading"), para(body, "BodyGuide")] for title, body in transferable]
    table = Table(rows, colWidths=[52 * mm, 110 * mm])
    table.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("BACKGROUND", (0, 0), (-1, -1), PALE), ("ROWBACKGROUNDS", (0, 0), (-1, -1), [PALE, colors.white]), ("LINEBELOW", (0, 0), (-1, -2), 0.5, LINE), ("LEFTPADDING", (0, 0), (-1, -1), 4 * mm), ("RIGHTPADDING", (0, 0), (-1, -1), 4 * mm), ("TOPPADDING", (0, 0), (-1, -1), 3.5 * mm), ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5 * mm)]))
    story += [table, PageBreak(), para("3. Career-fit self-assessment", "SectionHeading"), para("Use this checklist as a reflection tool. It is not an eligibility decision or guarantee of success.", "SmallGuide"), Spacer(1, 3 * mm)]
    checks = ["I am comfortable meeting and building relationships with people.", "I am willing to learn continuously and complete required development activities.", "I can communicate clearly, accurately, and responsibly.", "I can manage goals, follow-through, and personal accountability.", "I am prepared to handle rejection and remain professional.", "I want to develop leadership and mentorship skills over time.", "I understand that application, appointment, income, promotion, and career success are not guaranteed."]
    table_data = [[para("Reflection statement", "TableHead"), para("Not yet", "TableHead"), para("Developing", "TableHead"), para("Strong", "TableHead")]]
    table_data.extend([[para(item, "Checklist"), para("[ ]", "Checklist"), para("[ ]", "Checklist"), para("[ ]", "Checklist")] for item in checks])
    checklist = Table(table_data, colWidths=[96 * mm, 20 * mm, 26 * mm, 20 * mm], repeatRows=1)
    checklist.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), GREEN), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("ALIGN", (1, 1), (-1, -1), "CENTER"), ("GRID", (0, 0), (-1, -1), 0.5, LINE), ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, PALE]), ("LEFTPADDING", (0, 0), (-1, -1), 2.8 * mm), ("RIGHTPADDING", (0, 0), (-1, -1), 2.8 * mm), ("TOPPADDING", (0, 0), (-1, -1), 2.7 * mm), ("BOTTOMPADDING", (0, 0), (-1, -1), 2.7 * mm)]))
    story += [checklist, Spacer(1, 5 * mm), para("4. Candidate profiles for review", "SectionHeading"), para("Young professionals may generally be around 25-40 years old, hold a college or university degree, and have at least two years of sales-related or customer-facing experience. Experienced professionals may generally be around 35-55 years old and have extensive experience in sales, banking, financial services, relationship management, or client service."), callout("[FINAL CANDIDATE CRITERIA REQUIRE SHANE'S AND COMPLIANCE APPROVAL]", background=WARM, color=ERROR), PageBreak(), para("5. Questions to discuss before applying", "SectionHeading")]
    questions = ["What does the authorized role involve day to day?", "What qualifications and approvals are required?", "How are training, mentorship, and development structured?", "What costs, responsibilities, performance expectations, and risks should I understand?", "How are income and career outcomes determined, and what is not guaranteed?", "What does the recruitment and selection process involve?"]
    story.extend(Paragraph(f"- {question}", styles["BulletGuide"]) for question in questions)
    story += [Spacer(1, 3 * mm), para("6. Responsible next steps", "SectionHeading"), para("Review Shane's professional background, Builder of Builders philosophy, career information, team stories, and disclaimers. Submit an application only when the approved opportunity information is available and you are ready for a manual review."), KeepTogether([para("Website paths planned for launch", "Subheading"), para("Career Opportunities: /join-my-team/<br/>Recruitment Application: /recruitment-application/<br/>Consultation Request: /book-consultation/", "SmallGuide")]), Spacer(1, 5 * mm), callout("<b>Important disclaimer.</b> This review draft is general educational material. It is not an offer, appointment, employment agreement, income promise, financial advice, or guarantee. Application does not guarantee selection, employment, appointment, program admission, income, earnings, promotion, or career success. Final information must come from the authorized process and approved documents.<br/><br/><b>[MANULIFE-PROVIDED AND COMPLIANCE-APPROVED DISCLAIMER REQUIRED]</b>", background=WARM, color=ERROR)]
    doc.build(story, canvasmaker=deterministic_canvas)
    digest = hashlib.sha256(OUTPUT.read_bytes()).hexdigest()
    print(f"Generated {OUTPUT} ({digest})")

if __name__ == "__main__":
    make_document()
