# BTC Web Portal — Excel Data Import User Guide
## Tender Notice Table Data Ingestion Guide

This guide explains how administrators can rapidly import tender data into notice tables using **Excel File Upload** or **Direct Clipboard Copy & Paste (Ctrl + V)**.

---

### 1. Supported File Formats & System Limits

| Format | Extensions | Maximum File Size | Maximum Rows Per Sheet |
|---|---|---|---|
| Microsoft Excel OpenXML | `.xlsx` | 10 MB | 1,000 rows |
| Microsoft Excel 97-2004 | `.xls` | 10 MB | 1,000 rows |
| Comma-Separated Values | `.csv` | 10 MB | 1,000 rows |
| Clipboard Tabular Data | Plain text (`\t`) | Browser limit | 1,000 rows |

*Note: Files exceeding 10 MB or worksheets containing more than 1,000 data rows are automatically blocked to maintain browser performance and prevent UI freezing.*

---

### 2. Method 1: Uploading an Excel File (Primary)

1. Open the **Admin Dashboard** and navigate to **Add Notice** or **Edit Notice**.
2. Select your desired tender category:
   - **OTM** (11 columns)
   - **LTM** (9 columns)
   - **LOTTERY_PENDING** (9 columns)
   - **LOTTERY_RESULT** (10 columns, with Winner List Name)
3. Ensure the **Tables Module** is enabled.
4. In the table toolbar header (beside `+ Row`), click the green **"Import Excel"** button:
   - An intuitive, two-step modal will appear.
5. Drag and drop your `.xlsx`, `.xls`, or `.csv` file into the upload area, or click to browse.

---

### 3. Selecting a Worksheet

If your Excel workbook contains multiple worksheets (e.g. `ReadMe`, `Civil_Works`, `Electrical`):
- A **"Select Worksheet"** dropdown will appear at the top of Step 2.
- The dropdown displays the sheet name, total rows, and total columns.
- Switch sheets with one click. Column mapping and live preview instantly update.

---

### 4. Reviewing and Adjusting Column Mapping

The import engine automatically compares Excel column headers with the official BTC Web Portal category schema:
- **Auto-Mapped Columns:** Marked with a green checkmark (`Mapped`).
- **Required Columns:** Columns like `Tender Id` and `Brief Description of Works` are flagged with a red `Required` badge.
- **Manual Adjustment:** 
  - To change a mapped column, click its dropdown and select the matching Excel header.
  - To leave a column blank or skip it, select `(Ignore / Leave Blank)`.
  - Selecting an Excel column for a destination field automatically clears it from any other field to prevent duplicate data overwrites.

---

### 5. Live Preview & Data Formatting

Before applying data to the notice, review the **Live Preview Table**:
- **Automatic Bangladeshi Currency Formatting:** Numeric values (e.g., `4126000`) are automatically formatted with Bangladeshi/Indian commas (`41,26,000`). Text quantities like `44 Lac` or `2.2 Cr` are preserved as-is.
- **Automatic Date Normalization:** Dates in `YYYY-MM-DD`, `DD/MM/YYYY`, or Excel serial formats are converted to standard `DD-MM-YYYY` with `05:00 PM` default submission time.
- **Bengali Unicode Preservation:** Existing Bengali Unicode descriptions and locations are completely preserved without corruption.
- **Method Assignment:** The `Type of Method` column is automatically filled according to the active category.
- **Invalid Rows:** Any rows missing a required Tender ID are excluded, and summary counters indicate how many valid rows are ready to be imported.

---

### 6. Difference Between Append and Replace

At the bottom of the import modal, choose your import operation:

| Operation | Behavior | When to Use |
|---|---|---|
| **Append to Table (Default)** | Adds the imported rows after any existing rows in the table. Existing rows are preserved. | Adding new groups/packages to an existing notice. |
| **Replace Table Rows** | Completely replaces existing data rows with the new imported rows. | Updating an entire tender schedule with a revised file. |

*Safety Notice: Selecting "Replace" requires double-confirmation on a red warning prompt to prevent accidental data loss.*

---

### 7. Method 2: Direct Clipboard Copy & Paste (Ctrl + V)

You can copy rows directly from Microsoft Excel or Google Sheets and paste them into the portal without saving or uploading a file:
1. Open your Excel workbook or Google Sheet.
2. Select the cells/rows (with or without headers) and press <kbd>Ctrl + C</kbd>.
3. Return to the BTC Notice Form and click inside the table area.
4. Press <kbd>Ctrl + V</kbd>.
5. The **Excel Import Modal** will instantly open pre-populated with your clipboard data.
6. Verify the mapping, preview the rows, and click **Import & Append** or **Replace**.

*Normal Text Paste Safety: Normal Ctrl+V pasting into the Notice Title, Description textarea, date inputs, and contact fields is preserved untouched and will never trigger the import modal.*

---

### 8. Common Errors & Solutions

| Issue | Cause | Solution |
|---|---|---|
| **"File exceeds the 10 MB limit"** | File size is larger than 10 MB. | Split the workbook or remove high-resolution embedded images. |
| **"Required field 'Tender Id' is missing"** | The Excel column containing tender IDs was unmapped or left blank. | In the column mapping table, select the column that holds your Tender ID numbers. |
| **"No valid rows available to import"** | All rows in the worksheet were empty or lacked required fields. | Ensure your sheet has non-empty rows with valid Tender IDs. |
| **Wrong worksheet loaded** | The workbook defaulted to the first tab (e.g. cover page). | Use the "Select Worksheet" dropdown in Step 2 to choose your data tab. |

