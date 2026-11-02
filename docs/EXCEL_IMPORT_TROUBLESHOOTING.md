# BTC Web Portal — Excel Import Troubleshooting Guide

This guide addresses common questions, edge cases, error messages, and troubleshooting steps encountered when importing tender data via Excel file upload or clipboard copy-paste.

---

## 1. Column Mapping & Header Detection Issues

### Issue 1.1: Column is Not Auto-Mapped
- **Symptom:** In Step 2 of the import modal, a destination column (e.g. `Tender Id` or `APP Estimate Cost Tk.`) shows `(Ignore / Leave Blank)` instead of auto-matching your Excel column.
- **Root Cause:** The Excel header string deviates significantly from recognized alias patterns (e.g., using abbreviations like `T_NO` or non-standard Bengali titles like `আইডি`).
- **Resolution:**
  1. Click the dropdown corresponding to the missing destination column.
  2. Select your Excel column from the list.
  3. If importing repeatedly, rename your Excel header to match the official template header (e.g. `Tender Id`, `APP Estimate Cost Tk.`).

### Issue 1.2: One Excel Column Mapped to Multiple Destination Fields
- **Symptom:** You accidentally selected the same Excel column for two different table fields.
- **System Defense:** The portal automatically prevents duplicate mapping. Selecting an Excel column for field B immediately clears it from field A to prevent data overwrites.

### Issue 1.3: "Required field 'Tender Id' is missing" Error
- **Symptom:** An alert warns that the required Tender ID field is unmapped or empty.
- **Resolution:**
  - Ensure your Excel sheet has a dedicated column containing numeric or alphanumeric tender IDs.
  - Verify that the `Tender Id` dropdown in the mapping step points to this column.
  - Rows with empty tender IDs are automatically ignored during import.

---

## 2. Date Format Parsing & Time Normalization

### Issue 2.1: Schedule Date Converts to an Unexpected Date
- **Symptom:** A date like `05/11/2026` is parsed as May 11 instead of November 5 (or vice-versa).
- **Supported Formats:**
  - Day-first formats: `DD-MM-YYYY` (e.g. `15-11-2026`), `DD/MM/YYYY` (e.g. `15/11/2026`)
  - ISO format: `YYYY-MM-DD` (e.g. `2026-11-15`)
  - Excel Serial Numbers: (e.g. `46341` $\rightarrow$ automatically converted)
- **Time Rule:** In Bangladesh e-GP notices, tender submissions conventionally close at `05:00 PM`. If your Excel cell contains only a date without a time, the portal automatically attaches `05:00 PM`.
- **Best Practice:** Format your Excel date cells as `DD-MM-YYYY` or `DD-MM-YYYY hh:mm AM/PM` prior to import.

---

## 3. Currency & Bangladeshi Number Notation (`Lac`, `Cr`)

### Issue 3.1: Large Numbers Missing Bangladeshi Commas
- **Symptom:** A cost of `4126000` is pasted without separators.
- **Resolution:** The BTC table engine automatically applies the Bangladeshi/Indian grouping pattern:
  - `4126000` $\rightarrow$ `41,26,000`
  - `1550000` $\rightarrow$ `15,50,000`
- **Word Notation Preservation:**
  - If a cell contains textual units such as `44 Lac`, `2.2 Cr`, `1.5 Crore`, or `75 Lakh`, the engine **preserves the text as-is** without coercing it to zero or stripping the suffix.
  - Currency symbols like `Tk.` or `BDT` are safely handled.

---

## 4. Bengali Script & Legacy Bijoy Font Encoding

### Issue 4.1: Bengali Text Appears as Gibberish or Unreadable Characters (Juktakkhor)
- **Symptom:** Descriptions copied from older MS Word / Excel tender circulars appear as corrupted characters like `Avwidw` or `weRq`.
- **Root Cause:** The text was typed using legacy ASCII Bijoy / SutonnyMJ fonts rather than UTF-8 Unicode.
- **Resolution:**
  - The BTC Web Portal includes an automated Bijoy-to-Unicode conversion layer. When legacy Bijoy text is detected during import, it is translated to standardized Unicode Bengali.
  - If manual correction is needed in Excel prior to upload, convert the text using an online Unicode converter or re-enter using Avro / standard Bengali Unicode layout.

---

## 5. Security & Formula Handling

### Issue 5.1: Excel Formulas Show Blank or Syntax Errors
- **Symptom:** Calculated cells (e.g. `=SUM(C2:D2)` or `=A2&" - "&B2`) fail to import properly.
- **Safety Rule:**
  - Raw Excel formulas are evaluated to their calculated scalar results during parsing.
  - If a formula cannot be resolved or references external workbooks, the cell may resolve to blank.
  - **Mitigation:** In Excel, select your cells, click **Copy**, and choose **Paste as Values** before saving or copying to clipboard.
- **Formula Injection Neutralization:**
  - Cells starting with special characters (`=`, `+`, `-`, `@`) that mimic formula injection attacks are safely escaped into text strings to protect administrators and visitors.

---

## 6. File Limits & Performance

### Issue 6.1: "File exceeds the 10 MB limit" Error
- **Symptom:** Uploading an `.xlsx` or `.xls` file fails immediately with a file size error.
- **Limit:** Maximum allowed file upload size is **10 MB**.
- **Causes:**
  - Embedded high-resolution images or company logos inside Excel.
  - Unused formatted empty cells stretching across thousands of rows.
- **Resolution:**
  - In Excel, press <kbd>Ctrl + End</kbd> to see the last used cell. Delete blank rows and columns beyond your data.
  - Remove embedded images.
  - Save as a clean `.xlsx` or `.csv`.

### Issue 6.2: "Worksheet exceeds the 1,000 row limit"
- **Limit:** Worksheets containing more than **1,000 rows** are rejected to prevent browser thread locking and memory crashes.
- **Resolution:** Split large notices into separate phases or sub-notices (e.g., Package 01–500 in Notice A, Package 501–1000 in Notice B).

---

## 7. Clipboard Copy & Paste (Ctrl + V) Edge Cases

### Issue 7.1: Pressing Ctrl+V into Notice Title Triggers Import Modal
- **Status:** **Fixed & Prevented**. The global paste listener explicitly excludes `INPUT`, `TEXTAREA`, and contenteditable fields. Pressing Ctrl+V while typing in the Notice Title or Description will paste normal text as expected.
- **How to Trigger Clipboard Import:** Click anywhere in the tender table area (or click the "+ Row" / "Import Excel" bar) before pressing <kbd>Ctrl + V</kbd>.

### Issue 7.2: Clipboard Data Copies with Missing Columns
- **Resolution:** Ensure you select the complete tabular range in Excel (including header row if available) before pressing <kbd>Ctrl + C</kbd>. In the import modal, verify the preview before clicking Import.

---

## 8. Winner List Handling in LOTTERY_RESULT

### Issue 8.1: Winner Name Doesn't Highlight or Assign Winner Status
- **Resolution:**
  - Ensure the Excel column mapped to `WINNER LIST NAME` contains the exact winning company/contractor name.
  - Non-winning rows must have their `WINNER LIST NAME` cell left blank.
  - In the public notice view, rows with a non-empty `WINNER LIST NAME` are automatically highlighted with the winner badge.

