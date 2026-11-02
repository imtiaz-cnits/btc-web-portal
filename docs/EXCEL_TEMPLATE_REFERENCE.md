# BTC Web Portal — Official Excel Template Technical Reference

This document serves as the authoritative technical reference for the official Excel import templates and schema specifications used in the Bangladesh Tender Notice Management Portal (BTC Web Portal).

All templates are located in:
- Public download directory: `public/templates/`
- Documentation repository: `docs/templates/`

---

## 1. Category Overview & Schema Summary

| Category Key | Category Display Name | Total Columns | Required Identifier | Special Columns | Primary Use Case |
|---|---|---|---|---|---|
| `OTM` | Open Tendering Method | 11 | `Tender Id` | Turn Over (5 Yrs), Similar Work (5 Yrs) | High-value major public civil/electrical works with turnover and qualification criteria. |
| `LTM` | Limited Tendering Method | 9 | `Tender Id` | None | Enlisted contractor works under threshold limits. |
| `LOTTERY_PENDING` | Lottery Pending | 9 | `Tender Id` | Auto method "Lottery Pending" | Tenders awaiting lottery draw event. |
| `LOTTERY_RESULT` | Lottery Result | 10 | `Tender Id` | `WINNER LIST NAME` | Completed lottery draws indicating winning contractors. |

*Note: The frontend table displays a synthetic sequence column (`SL No`) dynamically computed at runtime. In imported Excel workbooks and official templates, `SL No` is omitted, and columns start with `Tender Id`.*

---

## 2. Category 1: Open Tendering Method (OTM)

- **Template Files:**
  - Blank: `public/templates/otm_template_blank.xlsx`
  - Sample: `public/templates/otm_template_sample.xlsx`
- **Total Columns:** 11
- **Table Theme:** Forest Emerald (`#059669`)

### Column Specification

| Index | Column Header | Data Type | Requirement | Auto-Fill / Transform | Sample Value | Description & Constraints |
|:---:|---|---|---|---|---|---|
| **0** | `Tender Id` | String / Integer | **Required** | Leading/trailing whitespace trimmed | `1326177` | Unique tender identifier or e-GP Tender ID. Row skipped if blank. |
| **1** | `Brief Description of Works` | String (Unicode Bengali/Eng) | Optional | Preserved as-is (Bijoy converted) | `মৌলভীবাজার আর.সি.সি রাস্তা নির্মাণ` | Scope or title of the procurement package. Supports Bengali script. |
| **2** | `Work Location` | String (Unicode Bengali/Eng) | Optional | Preserved as-is (Bijoy converted) | `মৌলভীবাজার সদর` | Administrative district or site location. |
| **3** | `Type of Method` | String | Optional | Auto-defaults to `OTM` if blank | `OTM` | Procurement method code. |
| **4** | `APP Estimate Cost Tk.` | Currency / Number | Optional | Formatted with BD comma notation | `41,26,000` | Estimated package cost in BDT. Accepts numbers or formatted strings. |
| **5** | `Bank Credit Line` | String / Amount | Optional | Preserved as-is (e.g. `44 Lac`) | `44 Lac` | Liquid asset or credit facility requirement. Accepts text notation (`Lac`, `Cr`). |
| **6** | `TURN OVER 05 Years` | String / Amount | Optional | Preserved as-is (e.g. `2.2 Cr`) | `2.2 Cr` | Minimum average annual construction turnover over past 5 years. |
| **7** | `Similar Work 05 Years` | String / Amount | Optional | Preserved as-is (e.g. `28 Lac`) | `28 Lac` | Minimum specific experience in similar nature works over past 5 years. |
| **8** | `Tender Security (BD)` | String / Amount | Optional | Formatted with BD commas if numeric | `1,25,000` | Earnest money or tender security amount in BDT. |
| **9** | `Document Price. Tk` | String / Number | Optional | Formatted with BD commas if numeric | `2,000` | Tender document purchase fee in BDT. |
| **10** | `Schedule & BD Last Selling Date` | Date / Time String | Optional | Normalizes to `DD-MM-YYYY 05:00 PM` | `15-11-2026 05:00 PM` | Last date and time for document sale/closing. Auto-defaults time if omitted. |

---

## 3. Category 2: Limited Tendering Method (LTM)

- **Template Files:**
  - Blank: `public/templates/ltm_template_blank.xlsx`
  - Sample: `public/templates/ltm_template_sample.xlsx`
- **Total Columns:** 9
- **Table Theme:** Forest Emerald (`#059669`)

### Column Specification

| Index | Column Header | Data Type | Requirement | Auto-Fill / Transform | Sample Value | Description & Constraints |
|:---:|---|---|---|---|---|---|
| **0** | `Tender Id` | String / Integer | **Required** | Whitespace trimmed | `1428010` | Unique tender identifier. Rows missing this field are skipped. |
| **1** | `Brief Description of Works` | String (Unicode Bengali/Eng) | Optional | Preserved (Bijoy auto-converted) | `সিলেট আরএইচডি ভবন সংস্কার কাজ` | Procurement package name or brief description. |
| **2** | `Work Location` | String (Unicode Bengali/Eng) | Optional | Preserved (Bijoy auto-converted) | `সিলেট সদর` | District or work site location. |
| **3** | `Type of Method` | String | Optional | Auto-defaults to `LTM` if blank | `LTM` | Procurement method code. |
| **4** | `APP Estimate Cost Tk.` | Currency / Number | Optional | Formatted with BD comma notation | `15,50,000` | Estimated tender cost in BDT. |
| **5** | `Bank Credit Line` | String / Amount | Optional | Preserved as-is (e.g. `12 Lac`) | `12 Lac` | Minimum credit line commitment required. |
| **6** | `Tender Security (BD)` | String / Amount | Optional | Formatted with BD commas if numeric | `45,000` | Tender security deposit. |
| **7** | `Document Price. Tk` | String / Number | Optional | Formatted with BD commas if numeric | `1,000` | Tender document selling fee. |
| **8** | `Schedule & BD Last Selling Date` | Date / Time String | Optional | Normalizes to `DD-MM-YYYY 05:00 PM` | `18-11-2026 05:00 PM` | Last date and time for schedule acquisition. |

---

## 4. Category 3: Lottery Pending (LOTTERY_PENDING)

- **Template Files:**
  - Blank: `public/templates/lottery_pending_template_blank.xlsx`
  - Sample: `public/templates/lottery_pending_template_sample.xlsx`
- **Total Columns:** 9
- **Table Theme:** Ocean Cyan (`#0891b2`)

### Column Specification

| Index | Column Header | Data Type | Requirement | Auto-Fill / Transform | Sample Value | Description & Constraints |
|:---:|---|---|---|---|---|---|
| **0** | `Tender Id` | String / Integer | **Required** | Whitespace trimmed | `1529011` | Unique tender identifier awaiting lottery draw. |
| **1** | `Brief Description of Works` | String (Unicode Bengali/Eng) | Optional | Preserved (Bijoy auto-converted) | `হবিগঞ্জ মডেল স্কুল প্রাচীর নির্মাণ` | Work description. |
| **2** | `Work Location` | String (Unicode Bengali/Eng) | Optional | Preserved (Bijoy auto-converted) | `হবিগঞ্জ` | Location where work is to be executed. |
| **3** | `Type of Method` | String | Optional | Auto-defaults to `Lottery Pending` | `Lottery Pending` | Identifies notice status in tabular list. |
| **4** | `APP Estimate Cost Tk.` | Currency / Number | Optional | Formatted with BD comma notation | `18,75,000` | Estimated cost in BDT. |
| **5** | `Bank Credit Line` | String / Amount | Optional | Preserved as-is (e.g. `15 Lac`) | `15 Lac` | Required liquid asset / credit facility. |
| **6** | `Tender Security (BD)` | String / Amount | Optional | Formatted with BD commas if numeric | `55,000` | Tender security deposit. |
| **7** | `Document Price. Tk` | String / Number | Optional | Formatted with BD commas if numeric | `1,000` | Schedule price in BDT. |
| **8** | `Schedule & BD Last Selling Date` | Date / Time String | Optional | Normalizes to `DD-MM-YYYY 05:00 PM` | `20-11-2026 05:00 PM` | Schedule closing date or lottery draw date. |

---

## 5. Category 4: Lottery Result (LOTTERY_RESULT)

- **Template Files:**
  - Blank: `public/templates/lottery_result_template_blank.xlsx`
  - Sample: `public/templates/lottery_result_template_sample.xlsx`
- **Total Columns:** 10
- **Table Theme:** Sky Blue (`#0284c7`)

### Column Specification

| Index | Column Header | Data Type | Requirement | Auto-Fill / Transform | Sample Value | Description & Constraints |
|:---:|---|---|---|---|---|---|
| **0** | `Tender Id` | String / Integer | **Required** | Whitespace trimmed | `1630122` | Unique tender identifier. |
| **1** | `Brief Description of Works` | String (Unicode Bengali/Eng) | Optional | Preserved (Bijoy auto-converted) | `সুনামগঞ্জ ড্রেনেজ ও কালভার্ট নির্মাণ` | Procurement work title. |
| **2** | `Work Location` | String (Unicode Bengali/Eng) | Optional | Preserved (Bijoy auto-converted) | `সুনামগঞ্জ সদর` | Project location. |
| **3** | `Type of Method` | String | Optional | Auto-defaults to `Lottery Result` | `Lottery Result` | Procurement status code. |
| **4** | `APP Estimate Cost Tk.` | Currency / Number | Optional | Formatted with BD comma notation | `25,40,000` | Package cost in BDT. |
| **5** | `Bank Credit Line` | String / Amount | Optional | Preserved as-is (e.g. `20 Lac`) | `20 Lac` | Financial qualification requirement. |
| **6** | `Tender Security (BD)` | String / Amount | Optional | Formatted with BD commas if numeric | `75,000` | Tender security deposit. |
| **7** | `Document Price. Tk` | String / Number | Optional | Formatted with BD commas if numeric | `1,500` | Document cost. |
| **8** | `Schedule & BD Last Selling Date` | Date / Time String | Optional | Normalizes to `DD-MM-YYYY 05:00 PM` | `22-11-2026 05:00 PM` | Date of award / lottery completion. |
| **9** | `WINNER LIST NAME` | String (Unicode Bengali/Eng) | Optional | Preserved (Bijoy auto-converted) | `মেসার্স শাহ আলম এন্টারপ্রাইজ` | **Crucial:** Name of winning contractor. If non-winner, leave empty. |

### Special Winner List Behavior
- If `WINNER LIST NAME` contains a contractor name:
  - The public notice table renders the row with a highlighted winner badge / status.
  - Linked `WinnerList` associations in the database are established when synced.
- If `WINNER LIST NAME` is empty or omitted:
  - The package is marked as unawarded, re-tendered, or pending evaluation.
  - The cell renders cleanly as blank without error.

---

## 6. Data Parsing, Sanitization & Formatting Rules

### 6.1 Currency & Number Formatting (Bangladeshi Comma Standard)
- Numeric inputs are parsed and formatted using the Bangladeshi/Indian grouping convention:
  - `4126000` $\rightarrow$ `41,26,000`
  - `1550000` $\rightarrow$ `15,50,000`
- Word notations (`Lac`, `Lakh`, `Cr`, `Crore`) are recognized and preserved untouched:
  - `44 Lac` $\rightarrow$ `44 Lac`
  - `2.2 Cr` $\rightarrow$ `2.2 Cr`

### 6.2 Date & Time Normalization
- The portal standardizes all schedule dates into:
  - Format: `DD-MM-YYYY 05:00 PM` (Bangladesh standard tender submission deadline)
- Accepted input variants:
  - ISO: `2026-11-15` $\rightarrow$ `15-11-2026 05:00 PM`
  - Slashed: `15/11/2026` $\rightarrow$ `15-11-2026 05:00 PM`
  - Excel Serial Numbers (e.g. `46341`) $\rightarrow$ properly converted to calendar date.
  - Explicit times (e.g. `15-11-2026 02:30 PM`) $\rightarrow$ user time preserved.

### 6.3 Bengali Script Handling (Unicode & Bijoy)
- Existing Unicode Bengali (e.g. `আর.সি.সি রাস্তা নির্মাণ`) is preserved verbatim.
- Legacy Bijoy / SutonnyMJ encoded text copied from older government documents is automatically detected and converted to clean Unicode on ingestion.

### 6.4 Security & Formula Neutralization
- Any cell value beginning with `=`, `+`, `-`, or `@` that could trigger formula execution or CSV injection is neutralized and converted to static text values during parsing.
- Raw Excel formulas are evaluated to their computed scalar results before being transferred to notice data.

---

## 7. Version Compatibility & Data Serialization
- All notices saved with imported data are automatically serialized to **V3 Data Architecture** (`version: "v3"`).
- V2 notices and legacy PWD/Standard records loaded from production are non-destructively normalized into V3 structures in memory.
- Public renderers and print stylesheets utilize standard responsive table containers with zero layout shift or styling breakage.

