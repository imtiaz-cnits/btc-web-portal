# BTC Web Portal — Category-Based Excel Notice Entry System Implementation Report

**Date:** November 2, 2026  
**Repository:** https://github.com/imtiaz-cnits/btc-web-portal  
**Status:** COMPLETE & VERIFIED (Zero Regressions)

---

## 1. Executive Summary

A separate, isolated **Category-Based Excel Notice Entry System** has been successfully designed, implemented, and verified for the BTC Web Portal dashboard. 

The system provides four downloadable Excel workbooks corresponding to the four tender categories (`OTM`, `LTM`, `LOTTERY_PENDING`, `LOTTERY_RESULT`). Each workbook contains three distinct sheets:
1. **Sheet A: Notice Details** (Notice Title, Sub-title, Category, Tender Year, Publish Date, Last Submission Date, Lottery Date).
2. **Sheet B: Tender Data** (Category-specific columns matching the exact dashboard specification and order).
3. **Sheet C: Footer Details** (Pay Order To, Information / Notice Details).

Administrators can download the official workbook, fill out the three sheets, upload the file, view a validation and section preview, and click **"Apply to Notice Form"** to auto-populate the entire form state and V3 table structure in one step without manual column mapping. The existing Notice Form "Save Notice" / "Update Notice" button persists to the database as normal.

---

## 2. Preservation of Existing System & Strict Guardrails

All negative constraints specified by the user were strictly respected:
- **No Redesign of Notice Form**: The existing layout, styling, and fields remain intact.
- **No Changes to Existing Table Engine V3**: `lib/tableEngine/` (`normalizer.ts`, `dataValidator.ts`, `excelParser.ts`, `columnMapper.ts`) remains 100% untouched.
- **No Changes to Existing Import Excel Modal**: `components/dashboard/ExcelImportModal.tsx` and its row mapping workflow remain untouched.
- **No Database or Prisma Schema Changes**: Prisma schema was untouched; no migrations run.
- **No Direct Database Writes During Import**: The imported data only populates React form state.
- **No Modifications to Production Records**: Existing 5 baseline notices in MySQL remain identical.
- **No Git Commit / Push**: Repository remains uncommitted pending explicit authorization.

---

## 3. Four Category-Specific Excel Templates

All four official workbooks were generated and stored in `public/templates/category-import/` and `docs/templates/category-import/`:

| Workbook File | Category | Columns (Sheet B) | Column Names & Order |
|---|---|---|---|
| `BTC_OTM_Notice_Template.xlsx` | **OTM** | 11 Columns | 1. Tender Id<br>2. Brief Description of Works<br>3. Work Location<br>4. Type of Method<br>5. APP Estimate Cost Tk.<br>6. Bank Credit Line<br>7. TURN OVER 05 Years<br>8. Similar Work 05 Years<br>9. Tender Security (BD)<br>10. Document Price. Tk<br>11. Schedule & BD Last Selling Date |
| `BTC_LTM_Notice_Template.xlsx` | **LTM** | 9 Columns | 1. Tender Id<br>2. Brief Description of Works<br>3. Work Location<br>4. Type of Method<br>5. APP Estimate Cost Tk.<br>6. Bank Credit Line<br>7. Tender Security (BD)<br>8. Document Price. Tk<br>9. Schedule & BD Last Selling Date |
| `BTC_LOTTERY_PENDING_Notice_Template.xlsx` | **LOTTERY_PENDING** | 9 Columns | Exact LTM 9-column structure, preset to `Lottery Pending` |
| `BTC_LOTTERY_RESULT_Notice_Template.xlsx` | **LOTTERY_RESULT** | 10 Columns | Exact LTM 9 columns + 10. `WINNER LIST NAME` |

### Three Sheets in Every Workbook:
- **Sheet A (`Notice Details`)**: Contains Notice Title, Sub-title, Notice Category (preset), Tender Year, Publish Date, Last Submission Date, and Lottery Date.
- **Sheet B (`Tender Data`)**: Contains official category column headers, widths, and formatted sample rows.
- **Sheet C (`Footer Details`)**: Contains Pay Order To and Information / Notice Details.

---

## 4. Architecture & File Inventory

```
lib/categoryExcelImport/
├── types.ts                      # Intermediate model, NoticeDetails, TenderData, FooterDetails, validation types
├── templateGenerator.ts          # Generates official 3-sheet XLSX workbooks with styles and column widths
├── parser.ts                     # Robust 3-sheet parser with category verification & formula sanitization
└── adapter.ts                    # Adapts intermediate data into NoticeForm state and V3 table structure

components/dashboard/CategoryExcelImport/
└── CategoryExcelImportModal.tsx  # Modal dialog: Category Select, Template Download, Upload, Preview, Apply

public/templates/category-import/
├── BTC_OTM_Notice_Template.xlsx
├── BTC_LTM_Notice_Template.xlsx
├── BTC_LOTTERY_PENDING_Notice_Template.xlsx
└── BTC_LOTTERY_RESULT_Notice_Template.xlsx

docs/templates/category-import/
├── BTC_OTM_Notice_Template.xlsx
├── BTC_LTM_Notice_Template.xlsx
├── BTC_LOTTERY_PENDING_Notice_Template.xlsx
└── BTC_LOTTERY_RESULT_Notice_Template.xlsx

scripts/
└── generate_category_templates.ts # Script to build/regenerate the 4 template files

tests/categoryExcelImport/
└── categoryExcelImport.test.ts   # Comprehensive test suite covering all 4 categories & 8 test domains
```

### Modified Existing Files:
1. `components/dashboard/NoticeForm.tsx`:
   - Added isolated entry banner (`Category-Based Excel Notice Entry`) at top of form.
   - Added companion button (`Category Excel`) in table action bar.
   - Added modal state and `handleApplyCategoryExcel` handler.
   - Preserved all existing form fields, validation, and submission logic.

---

## 5. Security & Validation Features

1. **Category Mismatch Protection**: If a user uploads an `OTM` template while `LTM` is selected, the parser rejects it with an explicit error.
2. **Formula Injection Sanitization**: Any cell starting with `=cmd|`, `=SUM(A1:B10)`, or other formulas has the leading `=` stripped and converted to inert plain text.
3. **Bengali Unicode Preservation**: Complex Unicode characters and diacritics in titles, descriptions, locations, and winners are preserved 100%.
4. **Tender ID & Numeric Preservation**: Tender IDs are strictly parsed as text, preventing leading zero stripping or scientific notation.
5. **Currency Formatting**: Numbers like `4126000` are formatted to Bangladeshi Indian numbering `41,26,000`, while preserving text amounts like `44 Lac` and `2.2 Cr`.
6. **Row-Specific Error Reporting**: If a row has a missing `Tender Id` or required field, the exact row number and column name are flagged.

---

## 6. Verification Results

| Check / Test Suite | Result | Details |
|---|---|---|
| `tests/categoryExcelImport/categoryExcelImport.test.ts` | **PASS (100%)** | All 8 test suites passed (Template generation, 3-sheet parse, mismatch rejection, required fields, Bengali, formulas, currency, V3 roundtrip). |
| `tests/emailAndWinnerFeatures.test.ts` | **PASS (100%)** | 6/6 test suites passed. |
| `tests/smokeTest.ts` | **PASS (100%)** | 111/111 checks passed. Baseline 5 database notices preserved. |
| `tests/excelImport.test.ts` | **PASS (100%)** | 31/31 checks passed. |
| `tests/qaVerification.test.ts` | **PASS (100%)** | 43/43 checks passed. |
| `tests/tableEngine.test.ts` | **PASS (100%)** | 57/57 checks passed. |
| `npx tsc --noEmit` | **PASS** | 0 TypeScript errors. |
| `npm run build` | **PASS** | 15/15 Next.js static and dynamic routes compiled successfully. |

