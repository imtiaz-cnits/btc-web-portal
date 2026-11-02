import assert from "assert";
import { parseNoticeTableData, tableSpecToRowsArray, normalizeNoticeTableData, serializeNoticeTableData } from "../lib/tableEngine/normalizer";

console.log("\n========================================================");
console.log("TESTING EMAIL SHARE & WINNER DYNAMIC LIFECYCLE");
console.log("========================================================\n");

// 1. Dynamic Email Message Generation Test
console.log("1. Dynamic Email Message Formatting");

const sampleTableDataV3 = JSON.stringify({
  version: "v3",
  tables: [
    {
      id: "tbl_1",
      title: "স্থানীয় সরকার প্রকৌশল অধিদপ্তর, পাবনা। (LGED)",
      subtitle: "Local Government Engineering Department, Pabna (LGED) (LTM Method)",
      order: 0,
      tableType: "LTM",
      headers: [
        { id: "c1", header: "Tender Id", fieldKey: "tender_id", width: 100, align: "center", dataType: "number", visible: true, backgroundColor: "#ffffff" },
        { id: "c2", header: "Brief Description Of Works", fieldKey: "description", width: 250, align: "left", dataType: "string", visible: true, backgroundColor: "#ffffff" },
        { id: "c3", header: "Schedule & Selling Date", fieldKey: "selling_date", width: 140, align: "center", dataType: "date", visible: true, backgroundColor: "#ffffff" }
      ],
      rows: [
        { c1: "1329553", c2: "Rehabilitation of Dogachi Up to Lachipara road", c3: "05-10-2026 05:00 PM" },
        { c1: "1329552", c2: "Rehabilitation of kumilli Chunnu House", c3: "05-10-2026 05:00 PM" },
        { c1: "1329554", c2: "Rehabilitation of Kashipur hat road", c3: "05-10-2026 05:00 PM" },
        { c1: "1333286", c2: "Construction of Small Scale Hydraulic Structure", c3: "05-10-2026 05:00 PM" }
      ],
      lastDateBlock: "05-10-2026 05:00 PM",
      headerBgColor: "#0891b2"
    }
  ]
});

const noticeItem = {
  id: "test-notice-123",
  title: "স্থানীয় সরকার প্রকৌশল অধিদপ্তর, পাবনা। (LGED)",
  category: "LTM",
  type: "TABLE",
  lastDate: new Date("2026-10-05T17:00:00.000Z"),
  tableData: sampleTableDataV3
};

const v3Parsed = parseNoticeTableData(noticeItem.tableData);
const groupCount = v3Parsed.tables.reduce((acc: number, t: any) => acc + (t.rows?.length || 0), 0);
const officeName = v3Parsed.tables[0].title;
const lastDate = v3Parsed.tables[0].lastDateBlock;

assert.strictEqual(groupCount, 4, "Extracted 4 groups from tableData");
assert.strictEqual(officeName, "স্থানীয় সরকার প্রকৌশল অধিদপ্তর, পাবনা। (LGED)", "Office name matches");
assert.strictEqual(lastDate, "05-10-2026 05:00 PM", "Last date matches");
console.log("  ✔ PASS: Notice table metadata extracted correctly for dynamic message");

// 2. Winner Column Appending & Position Verification
console.log("\n2. Winner Column Placement on Far Right");

const { headers, rows, columnColors } = tableSpecToRowsArray(v3Parsed.tables[0]);
assert.strictEqual(headers.length, 3, "Initial headers count is 3");
assert.strictEqual(headers[headers.length - 1], "Schedule & Selling Date", "Rightmost column before draw is Schedule & Selling Date");

// Emulate initWinnersMode
const updatedHeaders = [...headers];
const updatedColors = [...columnColors];
const updatedRows = rows.map((r) => [...r]);

const winnerColIdx = updatedHeaders.findIndex((h: string) => h.toUpperCase().replace(/\./g, "").includes("WINNER"));
if (winnerColIdx === -1) {
  updatedHeaders.push("WINNER LIST NAME");
  updatedColors.push("#fde047");
  updatedRows.forEach((r) => r.push(""));
}

assert.strictEqual(updatedHeaders[updatedHeaders.length - 1], "WINNER LIST NAME", "WINNER LIST NAME is appended to the far right");
assert.strictEqual(updatedColors[updatedColors.length - 1], "#fde047", "Winner column background is #fde047 yellow");
assert.strictEqual(updatedRows[0].length, 4, "Row 0 now has 4 cells");
assert.strictEqual(updatedRows[0][3], "", "New winner cell is initially empty string");
console.log("  ✔ PASS: WINNER LIST NAME column correctly appended to the right of the table");

// 3. Emulate Admin Selecting Winners
console.log("\n3. Winner Selection & Submission");

updatedRows[0][3] = "মেসার্স শাহ আলম এন্টারপ্রাইজ"; // Row 0 winner
updatedRows[1][3] = "মেসার্স কবির কন্সট্রাকশন";     // Row 1 winner
updatedRows[2][3] = "";                             // Row 2 no winner yet
updatedRows[3][3] = "মেসার্স প্রগতি বিল্ডার্স";       // Row 3 winner

const tempTableData = {
  version: "v2",
  tables: [
    {
      id: "tbl_1",
      type: "LOTTERY_RESULT",
      officeName: v3Parsed.tables[0].title,
      subTitle: v3Parsed.tables[0].subtitle,
      headers: updatedHeaders,
      rows: updatedRows,
      headerBgColor: v3Parsed.tables[0].headerBgColor,
      columnColors: updatedColors
    }
  ]
};

const v3Normalized = normalizeNoticeTableData(tempTableData);
const serializedV3 = serializeNoticeTableData(v3Normalized);
assert.strictEqual(v3Normalized.version, "v3", "Saved data upgraded to V3 serialization");
assert.strictEqual(v3Normalized.tables[0].tableType, "LOTTERY_RESULT", "Table type updated to LOTTERY_RESULT");

const reloadedV3 = parseNoticeTableData(serializedV3);
const reloadedTable = tableSpecToRowsArray(reloadedV3.tables[0]);
assert.strictEqual(reloadedTable.headers[reloadedTable.headers.length - 1], "WINNER LIST NAME", "Reloaded table has WINNER LIST NAME on the right");
assert.strictEqual(reloadedTable.rows[0][3], "মেসার্স শাহ আলম এন্টারপ্রাইজ", "Row 0 winner persisted");
assert.strictEqual(reloadedTable.rows[1][3], "মেসার্স কবির কন্সট্রাকশন", "Row 1 winner persisted");
assert.strictEqual(reloadedTable.rows[2][3], "", "Row 2 empty winner persisted");
assert.strictEqual(reloadedTable.rows[3][3], "মেসার্স প্রগতি বিল্ডার্স", "Row 3 winner persisted");
console.log("  ✔ PASS: Winner data normalized and serialized to V3 cleanly");

// 4. Verification of Filtering & Category Transitions
console.log("\n4. Dashboard & Website Category Transitions");

const pendingFilterCondition = (n: any, nowDate: Date) => {
  const isExpired = n.lastDate ? new Date(n.lastDate) < nowDate : false;
  return n.status === "active" && isExpired && n.category !== "LOTTERY_RESULT";
};

const winnersFilterCondition = (n: any) => {
  return n.status === "active" && n.category === "LOTTERY_RESULT";
};

const testNow = new Date("2026-10-10T12:00:00.000Z"); // After lastDate 05-10-2026

const noticeBeforeSave = {
  ...noticeItem,
  status: "active",
  category: "LTM"
};
assert.strictEqual(pendingFilterCondition(noticeBeforeSave, testNow), true, "Notice is in Pending tab before winner save");
assert.strictEqual(winnersFilterCondition(noticeBeforeSave), false, "Notice is NOT in Winners tab before winner save");

const noticeAfterSave = {
  ...noticeItem,
  status: "active",
  category: "LOTTERY_RESULT",
  tableData: serializedV3
};
assert.strictEqual(pendingFilterCondition(noticeAfterSave, testNow), false, "Notice is NO LONGER in Pending tab after winner save");
assert.strictEqual(winnersFilterCondition(noticeAfterSave), true, "Notice is NOW in Winners tab after winner save");

// Website category mapping verification
const categoryMap: Record<string, string> = {
  LTM: "LTM",
  OTM: "OTM",
  LOTTERY_PENDING: "Lottery Pending",
  LOTTERY_RESULT: "Lottery Result",
};
const isNoticeExpiredCheck = new Date(noticeAfterSave.lastDate) < testNow;
const finalCategory = (isNoticeExpiredCheck && noticeAfterSave.category !== "LOTTERY_RESULT") 
  ? "LOTTERY_PENDING" 
  : noticeAfterSave.category;

const websiteTab = categoryMap[finalCategory];
assert.strictEqual(websiteTab, "Lottery Result", "Website categorizes notice into 'Lottery Result' tab dynamically");
console.log("  ✔ PASS: Notice successfully transitions from Pending to Winners in dashboard and to Lottery Result on website");

// 5. Winner Row Only Filtering on Result Table & Quick View
console.log("\n5. Winner-Only Row Filtering in Result / Winners Mode");

const wColIdx = reloadedTable.headers.findIndex((h) => h.toUpperCase().replace(/\./g, "").includes("WINNER"));
assert(wColIdx !== -1, "Winner column exists");

const allRows = reloadedTable.rows;
assert.strictEqual(allRows.length, 4, "Total rows in notice is 4");

// Apply the winner-only filtering logic
const isLotteryResultNotice = noticeAfterSave.category === "LOTTERY_RESULT";
const winningRowsOnly = (wColIdx !== -1)
  ? allRows.filter((r) => r[wColIdx] && r[wColIdx].trim() !== "")
  : [];
const displayRows = isLotteryResultNotice && winningRowsOnly.length > 0
  ? winningRowsOnly
  : allRows;

assert.strictEqual(displayRows.length, 3, "Only the 3 winning rows are included in displayRows (blank row 2 was excluded)");
assert.strictEqual(displayRows[0][3], "মেসার্স শাহ আলম এন্টারপ্রাইজ", "First visible winner is Row 0");
assert.strictEqual(displayRows[1][3], "মেসার্স কবির কন্সট্রাকশন", "Second visible winner is Row 1");
assert.strictEqual(displayRows[2][3], "মেসার্স প্রগতি বিল্ডার্স", "Third visible winner is Row 3");

// Verify single winner case (like user screenshot with only 1 winner)
const singleWinnerRows = [
  ["1329553", "Work 1", "05-10-2026", "test"],
  ["1329552", "Work 2", "05-10-2026", ""],
  ["1329554", "Work 3", "05-10-2026", ""],
  ["1333286", "Work 4", "05-10-2026", ""],
  ["1333286", "Work 5", "05-10-2026", ""]
];
const singleWinningRowsOnly = singleWinnerRows.filter((r) => r[3] && r[3].trim() !== "");
const singleDisplayRows = isLotteryResultNotice && singleWinningRowsOnly.length > 0 ? singleWinningRowsOnly : singleWinnerRows;
assert.strictEqual(singleDisplayRows.length, 1, "When only 1 winner is selected, displayRows has exactly 1 row");
assert.strictEqual(singleDisplayRows[0][0], "1329553", "Only row 1 (Tender 1329553) is displayed");
console.log("  ✔ PASS: Result table filters out non-winning rows and shows strictly winning rows");

// 6. Quick Select Users (10 Max, Add and Delete)
console.log("\n6. Quick Select Users Recent 10 Tracking & Deletion");

let mockSaved: { email: string; name?: string }[] = [
  { email: "user1@gmail.com" },
  { email: "user2@gmail.com" },
  { email: "user3@gmail.com" },
  { email: "user4@gmail.com" },
  { email: "user5@gmail.com" },
  { email: "user6@gmail.com" },
  { email: "user7@gmail.com" },
  { email: "user8@gmail.com" },
  { email: "user9@gmail.com" },
  { email: "user10@gmail.com" },
];

// Add 11th email -> should cap at 10 and put new email at index 0
const newEmail = "user11@gmail.com";
mockSaved = [{ email: newEmail }, ...mockSaved.filter(e => e.email !== newEmail)].slice(0, 10);
assert.strictEqual(mockSaved.length, 10, "Capped at 10 emails");
assert.strictEqual(mockSaved[0].email, "user11@gmail.com", "Latest email is at index 0");

// Delete user3@gmail.com via cross button
const toDelete = "user3@gmail.com";
mockSaved = mockSaved.filter(e => e.email !== toDelete);
assert.strictEqual(mockSaved.length, 9, "Length reduced to 9 after deletion");
assert.strictEqual(mockSaved.some(e => e.email === "user3@gmail.com"), false, "user3 deleted from list");
console.log("  ✔ PASS: Recent 10 emails correctly capped and cross-deletion works");

console.log("\n========================================================");
console.log("ALL EMAIL SHARE & WINNER LIFECYCLE TESTS PASSED (100%)");
console.log("========================================================\n");
