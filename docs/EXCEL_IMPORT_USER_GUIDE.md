# BTC Web Portal — Excel Data Import User Guide
## Comprehensive Manual for Tender Notice Table Ingestion

This guide provides end-to-end instructions for administrators of the Bangladesh Tender Notice Management Portal (BTC Web Portal) on importing tender schedules from Microsoft Excel, Google Sheets, or CSV files into notice tables.

---

## 1. Quick Start & Official Template Downloads

Pre-formatted Excel templates matching the exact column structures, headers, and data formats for all tender categories are available directly from the portal:

### 1.1 Download Locations
All templates are accessible in the application repository:
- **Public Assets Directory:** `public/templates/` (Available for direct browser download)
- **Documentation Directory:** `docs/templates/`

### 1.2 Available Templates

| Category | Blank Template (For Data Entry) | Sample Template (With Realistic Data) | Column Count |
|---|---|---|:---:|
| **OTM** (Open Tendering Method) | [`otm_template_blank.xlsx`](/templates/otm_template_blank.xlsx) | [`otm_template_sample.xlsx`](/templates/otm_template_sample.xlsx) | 11 |
| **LTM** (Limited Tendering Method) | [`ltm_template_blank.xlsx`](/templates/ltm_template_blank.xlsx) | [`ltm_template_sample.xlsx`](/templates/ltm_template_sample.xlsx) | 9 |
| **LOTTERY_PENDING** (Lottery Pending) | [`lottery_pending_template_blank.xlsx`](/templates/lottery_pending_template_blank.xlsx) | [`lottery_pending_template_sample.xlsx`](/templates/lottery_pending_template_sample.xlsx) | 9 |
| **LOTTERY_RESULT** (Lottery Result) | [`lottery_result_template_blank.xlsx`](/templates/lottery_result_template_blank.xlsx) | [`lottery_result_template_sample.xlsx`](/templates/lottery_result_template_sample.xlsx) | 10 |

---

## 2. Supported File Formats & Technical Limits

| Format | File Extension | Max Size | Max Rows Per Sheet | Character Encoding |
|---|---|:---:|:---:|---|
| Microsoft Excel OpenXML | `.xlsx` | **10 MB** | 1,000 | UTF-8 / Standard |
| Microsoft Excel Legacy | `.xls` (97-2004) | **10 MB** | 1,000 | UTF-8 / Standard |
| Comma-Separated Values | `.csv` | **10 MB** | 1,000 | UTF-8 / ANSI |
| Direct Clipboard Paste | Plain Text / TSV | Browser Buffer | 1,000 | UTF-8 |

> **Performance Guard:** Files exceeding 10 MB or sheets with more than 1,000 data rows are automatically blocked to ensure smooth rendering and avoid freezing administrative sessions.

---

## 3. Workflow 1: File Upload (Step-by-Step)

### Step 1: Open the Notice Editor
1. Log in to the BTC Web Portal Admin Dashboard (`/dashboard`).
2. Click **Add Notice** to create a new tender, or click **Edit** on an existing notice.
3. Select your desired tender category:
   - **OTM** (11 columns)
   - **LTM** (9 columns)
   - **LOTTERY_PENDING** (9 columns)
   - **LOTTERY_RESULT** (10 columns)
4. Ensure the **Tables Module** toggle is switched **ON**.

### Step 2: Open the Import Dialog
1. In the table toolbar header (beside the `+ Row` button), click the green **"Import Excel"** button.
2. The **Import Excel Data** modal dialog will appear.

### Step 3: Choose or Drag-and-Drop Your File
1. Drag and drop your `.xlsx`, `.xls`, or `.csv` file into the upload dropzone.
2. Alternatively, click the browse button to select a file from your computer.
3. The engine parses the file in memory without uploading any raw files to disk.

### Step 4: Multi-Sheet Selection (If Applicable)
If your workbook contains multiple worksheets (e.g. `Summary`, `Package_01`, `Package_02`):
- A **"Select Worksheet"** dropdown will appear at the top.
- The dropdown indicates the sheet name, detected column count, and total rows.
- Select your target sheet; column mapping and live preview update instantaneously.

### Step 5: Review & Adjust Column Mapping
The intelligent mapping engine matches Excel headers against portal requirements:
- **Auto-Mapped:** Columns matched by exact or fuzzy alias show a green `Mapped` badge.
- **Required Columns:** Fields like `Tender Id` and `Brief Description of Works` display a red `Required` badge.
- **Manual Mapping:**
  - If a column wasn't automatically recognized, click its dropdown and choose your Excel header.
  - To skip an unnecessary Excel column, select `(Ignore / Leave Blank)`.
  - **Duplicate Protection:** Assigning an Excel column to a destination field automatically un-assigns it from any previous field.

### Step 6: Verify with Live Preview
Inspect the parsed rows in the Live Preview table:
- **Tender IDs:** Checked for validity (empty IDs are flagged or skipped).
- **Bangladeshi Currency:** Formats large numbers using standard Bangladeshi comma groupings (`41,26,000`).
- **Word Notation:** Preserves amounts with `Lac` or `Cr` (e.g., `44 Lac`, `2.2 Cr`).
- **Date Standard:** Normalizes dates into `DD-MM-YYYY 05:00 PM`.
- **Bengali Text:** Preserves Unicode Bengali and converts legacy Bijoy encoding seamlessly.
- **Lottery Winner:** In `LOTTERY_RESULT`, verifies that winning contractors appear in `WINNER LIST NAME`.

### Step 7: Choose Ingestion Mode & Import
At the bottom of the modal, select:
- **Append to Table (Default):** Adds imported rows to the end of your existing rows.
- **Replace Table Rows:** Replaces all existing rows with the newly imported dataset. A confirmation prompt prevents accidental overwrites.
- Click **"Apply to Table"** to populate the notice editor.

---

## 4. Workflow 2: Direct Clipboard Paste (Ctrl + V)

For rapid entry directly from Microsoft Excel, Google Sheets, or LibreOffice Calc:

1. Open your spreadsheet software.
2. Highlight your data rows (with or without headers) and press <kbd>Ctrl + C</kbd> (or <kbd>Cmd + C</kbd> on Mac).
3. Switch back to the BTC Notice Form.
4. Click anywhere inside the table area (or click the table toolbar).
5. Press <kbd>Ctrl + V</kbd>.
6. The **Excel Import Modal** will instantly open pre-loaded with your copied data.
7. Verify mapping and preview, then click **Import & Append** or **Replace**.

> **Smart Form Protection:** Normal typing inside Notice Title, Description, Date pickers, and contact inputs is isolated. Pasting plain text inside input fields will never trigger the import dialog.

---

## 5. Saving, Serialization & Public Display

### 5.1 Automatic V3 Data Serialization
- When you click **Save Notice**, the portal validates the table structure and automatically serializes the data into **V3 Strongly Typed Architecture** (`version: "v3"`).
- Production notices created under V2 or legacy formats remain 100% compatible and are non-destructively loaded.

### 5.2 Public Rendering & Print View
- The public notice page renders the imported table with exact category colors:
  - **OTM & LTM:** Forest Emerald (`#059669`)
  - **LOTTERY_PENDING:** Ocean Cyan (`#0891b2`)
  - **LOTTERY_RESULT:** Sky Blue (`#0284c7`) with winner badge highlighting
- Print layouts and PDF exports (`/notices/[id]/print`) retain proper page breaks, crisp Bengali fonts (`font-bangla`), and full responsive readability.

---

## 6. Summary Checklist for Administrators

1. [ ] Download the official template matching your tender category.
2. [ ] Fill in `Tender Id` (mandatory) and procurement details.
3. [ ] If using Bengali, standard Unicode is recommended (Bijoy is also auto-converted).
4. [ ] For `LOTTERY_RESULT`, place winning contractor names in `WINNER LIST NAME` and leave non-winners blank.
5. [ ] In BTC Notice Form, click **Import Excel** or press **Ctrl + V**.
6. [ ] Review the Live Preview and verify mapped columns.
7. [ ] Click **Apply to Table** and click **Save Notice**.
