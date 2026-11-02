# BTC Web Portal — Phase 6.3 Visual Acceptance Evidence & Status

This directory documents the human-browser visual acceptance evidence and status for the Excel Data Import System.

---

## 1. Visual Verification Status by Item

In strict accordance with Phase 6.3 instructions (*"Do not fabricate screenshots. If browser access is unavailable, explicitly mark the relevant item NOT VERIFIED"*), the items are evaluated as follows:

| Item # | Verification Target | Status | Reason & Technical Context |
|:---:|---|:---:|---|
| **1** | Excel Import Modal (Upload/Dropzone) | **NOT VERIFIED** | Requires authenticated Admin session (`/admin/egp-notices/add`) and DOM click event. Headless test frameworks (Playwright/Puppeteer) are not installed in dependencies. |
| **2** | Column Mapping & Live Preview Table | **NOT VERIFIED** | Requires interactive client-side Excel file upload / clipboard paste to populate Step 2 state in the browser. |
| **3** | Public OTM / LTM Notice Display | **NOT VERIFIED** | Static code and DOM verified (`#059669` header, `font-bangla`); pending human desktop browser viewing. |
| **4** | Lottery Pending Notice Display | **NOT VERIFIED** | Requires publishing a new `LOTTERY_PENDING` notice to the production database (prevented by strict read-only audit policy). |
| **5** | Lottery Result with Winner Highlighting | **NOT VERIFIED** | Requires publishing a new `LOTTERY_RESULT` notice with winner contractor data (prevented by strict read-only audit policy). |
| **6** | Print & PDF Layout Preview | **NOT VERIFIED** | Requires browser print engine rendering (`@media print` stylesheet verified in code). |

---

## 2. Human Operator Visual Acceptance Instructions

Portal administrators should perform visual sign-off using the following verification steps upon deploying to a staging or production instance:

### Step 1: Excel Import Modal & File Ingestion
1. Log into `/admin/auth` and navigate to **Add Notice** (`/admin/egp-notices/add`).
2. Toggle the **Tables Module** to ON and select category **OTM**.
3. Click the green **"Import Excel"** button in the table toolbar.
4. Verify the modal opens smoothly with drag-and-drop dropzone.
5. Upload `public/templates/otm_template_sample.xlsx`:
   - Verify Step 2 shows the Column Mapping table.
   - Confirm required fields (`Tender Id`, `Brief Description of Works`) display red badges.
   - Confirm detected columns display green `Mapped` badges.
   - Confirm Live Preview renders 5 rows with formatted currency (e.g. `41,26,000`, `44 Lac`, `2.2 Cr`).
6. Click **Apply to Table** (Append mode).
7. Test clipboard paste: copy 2 rows from Excel, click the table area, press <kbd>Ctrl + V</kbd>.
8. Confirm normal typing in Notice Title and Description textarea allows standard paste without triggering the modal.

### Step 2: Public Notice Category Styling
1. Open an **OTM** or **LTM** notice $\rightarrow$ verify Forest Emerald (`#059669`) header.
2. Open a **LOTTERY_PENDING** notice $\rightarrow$ verify Ocean Cyan (`#0891b2`) header.
3. Open a **LOTTERY_RESULT** notice $\rightarrow$ verify Sky Blue (`#0284c7`) header, and ensure rows with winning contractors display the yellow `#fde047` winner badge.
4. Verify Bengali text renders cleanly in `font-bangla` without broken glyphs.

### Step 3: Print & PDF Preview
1. On any notice page, click the **Print** button or visit `/notice/[id]`.
2. Inspect browser print preview:
   - Verify table does not horizontally clip.
   - Confirm clean page break handling.

