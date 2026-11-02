# BTC Web Portal — Phase 6.3: Human Visual Acceptance & Final Release Authorization

**Repository:** `https://github.com/imtiaz-cnits/btc-web-portal`  
**Execution Date:** November 2, 2026  
**Audit Scope:** Human Visual Acceptance, Final Git Audit & Controlled Release Package  
**Final Status:** **CONDITIONAL PASS**  
*(All 490 automated tests and 68 release readiness checks [558 combined checks], TypeScript compilation, Next.js production build, and `git diff --check` PASSED. Headless visual screenshots are designated as **NOT VERIFIED** due to absence of browser automation binaries; visual sign-off requires standard human browser check).*

---

## 1. Executive Summary & Verification Scorecard

Phase 6.3 concludes the development, testing, and release auditing cycle for the BTC Web Portal's Excel Data Import System. All technical, functional, architectural, performance, and security requirements have been validated.

### 1.1 Multi-Tier Verification Breakdown

| Verification Tier | Focus / Scope | Executed | Passed | Failed | Status |
|---|---|:---:|:---:|:---:|:---:|
| **Automated Unit & Integration Tests** | Table engine, Excel parser, V3 serialization, smoke tests | 490 | 490 | 0 | **PASS (100%)** |
| **Release Readiness Checks** | Template hashes, HTTP 200, formula safety, DB isolation | 68 | 68 | 0 | **PASS (100%)** |
| **Combined Verification Checks** | Total verified system specifications | **558** | **558** | **0** | **PASS (100%)** |
| **TypeScript Strict Compilation** | `npx tsc --noEmit` across entire repository | Whole Repo | 0 Errors | 0 | **PASS** |
| **Next.js Production Build** | `npm run build` (15/15 static and dynamic pages) | 15 Routes | Compiled | 0 | **PASS (Code 0)** |
| **Git Diff Whitespace Integrity** | `git diff --check` | Working Tree | 0 Errors | 0 | **PASS** |
| **Database Preservation** | `prisma.notice.count()` baseline comparison | 5 Baseline | 5 Preserved | 0 | **PASS (0 Mutated)** |
| **Visual Browser Screenshots** | Automated headless browser capture | 6 Items | N/A | N/A | **NOT VERIFIED** |

---

## 2. Visual Acceptance Results & Evidence Status

In accordance with strict prompt instructions (*"Do not fabricate screenshots. If browser access is unavailable, explicitly mark the relevant item NOT VERIFIED"*), the visual acceptance items are evaluated below and cataloged in [`docs/phase-6-3-evidence/README.md`](file:///d:/Shanto/runing-work/btc-web-portal/docs/phase-6-3-evidence/README.md):

| Item # | Verification Target | Status | Reason & Technical Context |
|:---:|---|:---:|---|
| **1** | Excel Import Modal (Upload/Dropzone) | **NOT VERIFIED** | Interactive component located in authenticated admin route (`/admin/egp-notices/add`). Automated browser test drivers (Playwright/Puppeteer) are not installed. |
| **2** | Column Mapping & Live Preview Table | **NOT VERIFIED** | Requires client-side file selection / clipboard paste into DOM to populate Step 2 state in the browser. |
| **3** | Public OTM / LTM Notice Display | **NOT VERIFIED** | CSS theme `#059669` and `font-bangla` verified in source; pending human desktop browser viewing. |
| **4** | Lottery Pending Notice Display | **NOT VERIFIED** | Requires publishing a new `LOTTERY_PENDING` notice to the database (prohibited by strict read-only audit policy). |
| **5** | Lottery Result with Winner Highlighting | **NOT VERIFIED** | Requires publishing a new `LOTTERY_RESULT` notice with winner contractor data (prohibited by strict read-only audit policy). |
| **6** | Print & PDF Layout Preview | **NOT VERIFIED** | Requires browser print engine rendering (`@media print` stylesheet verified in code). |

### 2.1 Recommended Human Visual Acceptance Checklist

Portal administrators should perform visual sign-off using the following verification steps upon deployment to a staging or production instance:

1. **Notice Form Import Modal (`/admin/egp-notices/add` & `/admin/egp-notices/edit/[id]`):**
   - [ ] Log into `/admin/auth`, toggle **Tables Module** ON, select **OTM**.
   - [ ] Click the green **"Import Excel"** button $\rightarrow$ Confirm two-step modal opens smoothly.
   - [ ] Drag & drop `public/templates/otm_template_sample.xlsx` $\rightarrow$ Confirm multi-sheet selector appears if workbook contains multiple tabs.
   - [ ] Inspect Step 2 Column Mapping $\rightarrow$ Confirm required fields (`Tender Id`, `Brief Description of Works`) display red badges, while mapped fields display green `Mapped` badges.
   - [ ] Inspect Live Preview Table $\rightarrow$ Confirm Bangladeshi currency comma formatting (`41,26,000`), word notations (`44 Lac`, `2.2 Cr`), and date formatting (`DD-MM-YYYY 05:00 PM`).
   - [ ] Test Append vs. Replace modes $\rightarrow$ Confirm confirmation prompt appears when selecting Replace.
   - [ ] Test Clipboard Paste (Ctrl+V) inside the table area $\rightarrow$ Confirm modal pre-populates with clipboard data.
   - [ ] Test standard typing inside Notice Title / Description inputs $\rightarrow$ Confirm normal text paste works without triggering the modal.
2. **Public Notice Display (`/egp-notice/[id]` & `/view-egp-notice/[id]`):**
   - [ ] Open an OTM / LTM notice $\rightarrow$ Verify Forest Emerald (`#059669`) header.
   - [ ] Open a LOTTERY_PENDING notice $\rightarrow$ Verify Ocean Cyan (`#0891b2`) header.
   - [ ] Open a LOTTERY_RESULT notice $\rightarrow$ Verify Sky Blue (`#0284c7`) header and yellow (`#fde047`) winner badge on non-empty `WINNER LIST NAME` rows.
   - [ ] Verify Bengali text rendering $\rightarrow$ Confirm clean `font-bangla` glyphs without broken ligatures.
3. **Print & PDF Layout Preview (`/notice/[id]` & Print Button):**
   - [ ] Click Print / Save as PDF $\rightarrow$ Verify table does not clip horizontally and clean page breaks occur.

---

## 3. Final Git Audit Results

### 3.1 Command Outputs

#### `git status --short`
```text
 M docs/EXCEL_IMPORT_USER_GUIDE.md
?? docs/EXCEL_IMPORT_TROUBLESHOOTING.md
?? docs/EXCEL_TEMPLATE_REFERENCE.md
?? docs/PHASE_5_2_PRODUCTION_SMOKE_TEST_REPORT.md
?? docs/PHASE_6_1_FINAL_RELEASE_READINESS_REPORT.md
?? docs/PHASE_6_2_FINAL_RELEASE_HANDOVER_REPORT.md
?? docs/PHASE_6_3_VISUAL_ACCEPTANCE_AND_RELEASE_AUTHORIZATION_REPORT.md
?? docs/PHASE_6_EXCEL_TEMPLATES_AND_DOCUMENTATION_REPORT.md
?? docs/phase-6-3-evidence/
?? docs/templates/
?? public/templates/
?? scripts/
?? tests/smokeTest.ts
?? tests/templateVerification.test.ts
```

#### `git diff --stat`
```text
 docs/EXCEL_IMPORT_USER_GUIDE.md | 170 +++++++++++++++++++++++-----------------
 1 file changed, 100 insertions(+), 70 deletions(-)
```

#### `git diff --check`
```text
(Exit code 0 — 0 whitespace errors or merge conflict markers)
```

#### `git branch --show-current`
```text
main
```

#### `git status -sb`
```text
## main...origin/main
 M docs/EXCEL_IMPORT_USER_GUIDE.md
?? docs/EXCEL_IMPORT_TROUBLESHOOTING.md
?? docs/EXCEL_TEMPLATE_REFERENCE.md
?? docs/PHASE_5_2_PRODUCTION_SMOKE_TEST_REPORT.md
?? docs/PHASE_6_1_FINAL_RELEASE_READINESS_REPORT.md
?? docs/PHASE_6_2_FINAL_RELEASE_HANDOVER_REPORT.md
?? docs/PHASE_6_3_VISUAL_ACCEPTANCE_AND_RELEASE_AUTHORIZATION_REPORT.md
?? docs/PHASE_6_EXCEL_TEMPLATES_AND_DOCUMENTATION_REPORT.md
?? docs/phase-6-3-evidence/
?? docs/templates/
?? public/templates/
?? scripts/
?? tests/smokeTest.ts
?? tests/templateVerification.test.ts
```

---

## 4. Exact Intended Release File Inventory

The release package consists strictly of official templates, end-user and technical documentation, audit reports, automation scripts, and regression test suites:

### 4.1 Documentation Guides (3 Files)
- [`docs/EXCEL_IMPORT_USER_GUIDE.md`](file:///d:/Shanto/runing-work/btc-web-portal/docs/EXCEL_IMPORT_USER_GUIDE.md): End-user manual covering upload, sheet selection, column mapping, live preview, append/replace, and Ctrl+V.
- [`docs/EXCEL_IMPORT_TROUBLESHOOTING.md`](file:///d:/Shanto/runing-work/btc-web-portal/docs/EXCEL_IMPORT_TROUBLESHOOTING.md): Problem-solving guide for date formats, currency notation, Bengali encoding, formulas, and file limits.
- [`docs/EXCEL_TEMPLATE_REFERENCE.md`](file:///d:/Shanto/runing-work/btc-web-portal/docs/EXCEL_TEMPLATE_REFERENCE.md): Technical schema specifications for all 4 categories.

### 4.2 Official Excel Templates (16 Files: 8 Pairs)
- **Public Downloads:** `public/templates/` (8 `.xlsx` files: blank and sample for OTM, LTM, LOTTERY_PENDING, LOTTERY_RESULT).
- **Documentation Copies:** `docs/templates/` (8 mirrored `.xlsx` files with byte-identical SHA-256 hashes).

### 4.3 Audit & Handover Reports (5 Files)
- `docs/PHASE_5_2_PRODUCTION_SMOKE_TEST_REPORT.md`
- `docs/PHASE_6_EXCEL_TEMPLATES_AND_DOCUMENTATION_REPORT.md`
- `docs/PHASE_6_1_FINAL_RELEASE_READINESS_REPORT.md`
- `docs/PHASE_6_2_FINAL_RELEASE_HANDOVER_REPORT.md`
- `docs/PHASE_6_3_VISUAL_ACCEPTANCE_AND_RELEASE_AUTHORIZATION_REPORT.md`
- `docs/phase-6-3-evidence/README.md`

### 4.4 Automation & Audit Scripts (2 Files)
- `scripts/generate_official_templates.ts`: OpenXML Excel template generator script.
- `scripts/audit_release_readiness.ts`: 68-point release readiness validation script.

### 4.5 Automated Verification Suites (2 Files)
- `tests/smokeTest.ts`: 111-test database lifecycle & rendering smoke test.
- `tests/templateVerification.test.ts`: 137-test template structure & ingestion test suite.

---

## 5. Excluded Files & Exclusion Reasons

| Excluded Item | Reason for Exclusion |
|---|---|
| `.env` / `.env*` | Environment configuration containing database credentials and NextAuth secrets (strictly ignored by `.gitignore`). |
| `.next/` | Ephemeral production build cache and compiled server/client bundles (ignored by `.gitignore`). |
| `node_modules/` | Third-party npm dependencies managed via `package-lock.json` (ignored by `.gitignore`). |
| `btc.sql` / `egpbtcappdb.sql` | Pre-existing local database backup dumps; excluded to prevent database schema drift. |
| `info.txt` / `Task Notes.txt` | Pre-existing developer scratch notes unrelated to the Excel Import System. |

---

## 6. Remaining Risks & Mitigations

1. **Non-Standard User Excel Headers:**
   - *Risk:* Data entry operators may submit spreadsheets with non-standard column headers (e.g., abbreviations like `T_NO` or `Est. Cost`).
   - *Mitigation:* The system provides an interactive column mapping interface in Step 2 with fuzzy match alias detection, manual dropdown overrides, and automatic duplicate un-mapping.
2. **Older Windows ASCII Bijoy Text:**
   - *Risk:* Circular notices typed using legacy Bijoy fonts may contain irregular ligatures.
   - *Mitigation:* Built-in `autoConvertBijoy()` automatically detects and translates Bijoy text into clean UTF-8 Unicode.
3. **Visual Verification in Staging/Production Browser:**
   - *Risk:* Headless browser screenshot capture was unavailable in this non-interactive shell environment.
   - *Mitigation:* Human administrator will perform the documented one-time visual sanity check upon deployment.

---

## 7. Strict Execution Restrictions Compliance

In strict compliance with Phase 6.3 directives, **NONE of the following restricted actions were executed**:
- `git add` — **NOT EXECUTED**
- `git commit` — **NOT EXECUTED**
- `git push` — **NOT EXECUTED**
- Production deployment — **NOT EXECUTED**
- `prisma db push` / `prisma migrate` — **NOT EXECUTED**
- Production database modifications — **NOT EXECUTED** (5 baseline notices remain 100% intact).

All release files remain staged/untracked in the working tree awaiting explicit user authorization.

---

## 8. Final Release Recommendation & Status

- **Final Status:** **CONDITIONAL PASS**
- **Release Recommendation:** The Excel Data Import System is technically verified, robust, backward-compatible, secure, and ready for production deployment. Final release authorization is granted upon completion of the human visual acceptance checklist by the portal administrator.

