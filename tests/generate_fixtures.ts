import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";

const fixturesDir = path.join(process.cwd(), "tests", "fixtures");
if (!fs.existsSync(fixturesDir)) {
  fs.mkdirSync(fixturesDir, { recursive: true });
}

// 1. OTM Real XLSX with Multiple Worksheets, Bengali Unicode, Currency, and Formulas
const otmWb = XLSX.utils.book_new();

// Sheet 1: Cover/Readme
const coverSheet = XLSX.utils.aoa_to_sheet([
  ["BTC Web Portal - Tender Import Instructions"],
  ["Please switch to 'OTM_Tenders' tab to view actual data rows."],
]);
XLSX.utils.book_append_sheet(otmWb, coverSheet, "ReadMe");

// Sheet 2: OTM Tenders
const otmData = [
  [
    "Tender Ref",
    "Work Details",
    "Project Site",
    "Method",
    "Estimated Cost",
    "Credit Line",
    "Annual Turnover",
    "Specific Experience",
    "EMD Security",
    "Document Fee",
    "Submission Deadline",
  ],
  [
    "1326177",
    "Construction of Internal R.C.C road-17 (আর.সি.সি রাস্তা নির্মাণ)",
    "Pabna Sadar (পাবনা সদর)",
    "OTM",
    4126000,
    "44 Lac",
    "2.2 Cr",
    "25 Lac",
    100000,
    1500,
    "21-09-2026 05:00 PM",
  ],
  [
    "1326180",
    "Construction of Internal R.C.C road-18",
    "Sujanagar (সুজানগর)",
    "OTM",
    1737000,
    "20 Lac",
    "1.25 Cr",
    "10 Lac",
    45000,
    1000,
    "2026-09-21",
  ],
  [
    "1326631",
    "Repair and Maintenance Works with Cost Adjustment",
    "Chatmohar (চাটমোহর)",
    "OTM",
    -2500,
    "10 Lac",
    "50 Lac",
    "5 Lac",
    5000,
    500,
    "21/09/2026",
  ],
  [
    "1326643",
    "Construction with Calculated Value",
    "Ishwardi (ঈশ্বরদী)",
    "OTM",
    { f: "E2+E3", v: 5863000 },
    "50 Lac",
    "3.0 Cr",
    "35 Lac",
    150000,
    2000,
    "2026-09-21 05:00 PM",
  ],
];
const otmSheet = XLSX.utils.aoa_to_sheet(otmData);
XLSX.utils.book_append_sheet(otmWb, otmSheet, "OTM_Tenders");
XLSX.writeFile(otmWb, path.join(fixturesDir, "sample_otm.xlsx"));
console.log("✓ Generated tests/fixtures/sample_otm.xlsx");

// 2. LTM Real XLS
const ltmWb = XLSX.utils.book_new();
const ltmData = [
  [
    "Tender ID",
    "Brief Description of Works",
    "Location",
    "Type of Method",
    "APP Cost",
    "Bank Solvency",
    "Security",
    "Doc Price",
    "Last Date",
  ],
  [
    "01-01-234234",
    "Emergency rehabilitation of road and culvert",
    "Sujanagar Pabna",
    "LTM",
    56456456,
    "54.65 Cr",
    456456456,
    "54.65 Cr",
    "2026-11-02 05:00 PM",
  ],
  [
    "01-01-234235",
    "Re-excavation of canal and bank protection",
    "", // Blank location to test fallback
    "LTM",
    1250000,
    "15 Lac",
    25000,
    1000,
    "02-11-2026",
  ],
];
const ltmSheet = XLSX.utils.aoa_to_sheet(ltmData);
XLSX.utils.book_append_sheet(ltmWb, ltmSheet, "LTM_Data");
// Write as binary XLS
XLSX.writeFile(ltmWb, path.join(fixturesDir, "sample_ltm.xls"), { bookType: "biff8" });
console.log("✓ Generated tests/fixtures/sample_ltm.xls");

// 3. LOTTERY_RESULT Real CSV
const lotteryResultCsv = [
  `Tender ID,Brief Description of Works,Work Location,Method,APP Cost,Credit Line,Tender Security,Doc Price,Last Date,Winner List Name`,
  `1328010,"Construction of Internal R.C.C road-22","Anywhere in Project Area",Lottery Result,1530000,20 Lac,40000,1000,21-09-2026 05:00 PM,"মেসার্স শাহ আলম এন্টারপ্রাইজ"`,
  `1328167,"Construction of Internal R.C.C road-23","Anywhere in Project Area",Lottery Result,2171000,20 Lac,55000,1000,21-09-2026 05:00 PM,""`,
].join("\n");
fs.writeFileSync(path.join(fixturesDir, "sample_lottery_result.csv"), lotteryResultCsv, "utf8");
console.log("✓ Generated tests/fixtures/sample_lottery_result.csv");

// 4. LOTTERY_PENDING Real XLSX
const pendingWb = XLSX.utils.book_new();
const pendingData = [
  [
    "Tender ID",
    "Work Description",
    "Site Location",
    "Method",
    "Estimated Amount",
    "Liquid Asset",
    "Bid Security",
    "Tender Document Price",
    "Selling Date",
  ],
  [
    "1328226",
    "Construction of Internal R.C.C road-26",
    "Pabna Division",
    "Lottery Pending",
    2171000,
    "20 Lac",
    55000,
    1000,
    "21-09-2026 05:00 PM",
  ],
];
const pendingSheet = XLSX.utils.aoa_to_sheet(pendingData);
XLSX.utils.book_append_sheet(pendingWb, pendingSheet, "Pending_Tenders");
XLSX.writeFile(pendingWb, path.join(fixturesDir, "sample_lottery_pending.xlsx"));
console.log("✓ Generated tests/fixtures/sample_lottery_pending.xlsx");

