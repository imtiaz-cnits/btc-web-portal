/**
 * Script: generate_category_templates.ts
 * Generates the official Category-Based Excel Notice Entry Templates:
 * 1. BTC_OTM_Notice_Template.xlsx (12 Columns, 2 Sheets: Tender Data & Footer Details)
 * 2. BTC_LTM_Notice_Template.xlsx (10 Columns, 2 Sheets: Tender Data & Footer Details)
 */

import * as fs from "fs";
import * as path from "path";
import {
  generateCategoryWorkbookBuffer,
  CATEGORY_TEMPLATE_CONFIGS,
} from "../lib/categoryExcelImport/templateGenerator";

const TARGET_DIRS = [
  path.join(process.cwd(), "public", "templates", "category-import"),
  path.join(process.cwd(), "docs", "templates", "category-import"),
];

TARGET_DIRS.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const CATEGORIES = ["OTM", "LTM"] as const;

console.log("Generating Category-Based Excel Notice Templates (OTM & LTM)...\n");

CATEGORIES.forEach((cat) => {
  const config = CATEGORY_TEMPLATE_CONFIGS[cat];
  const buffer = generateCategoryWorkbookBuffer(cat, true);

  TARGET_DIRS.forEach((dir) => {
    const filePath = path.join(dir, config.fileName);
    fs.writeFileSync(filePath, buffer);
    console.log(`  ✓ Created: ${filePath} (${buffer.length} bytes)`);
  });
});

// Remove deprecated lottery templates from category-import directory if present
const DEPRECATED_FILES = [
  "BTC_LOTTERY_PENDING_Notice_Template.xlsx",
  "BTC_LOTTERY_RESULT_Notice_Template.xlsx",
];

TARGET_DIRS.forEach((dir) => {
  DEPRECATED_FILES.forEach((f) => {
    const p = path.join(dir, f);
    if (fs.existsSync(p)) {
      fs.unlinkSync(p);
      console.log(`  ✓ Removed deprecated file: ${p}`);
    }
  });
});

console.log("\nAll Category-Based Excel Templates generated successfully!");
