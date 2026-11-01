import { autoConvertBijoy, isUnicodeBengali, isBijoy } from "../lib/bijoyToUnicode";
import { formatCurrencyBD, normalizeDateToDmy } from "../lib/tableEngine/dataValidator";

const unicodeSamples = [
  "গণপূর্ত বিভাগ, পাবনা।",
  "সড়ক ও জনপথ বিভাগ, পাবনা। (RHD)",
  "স্থানীয় সরকার প্রকৌশল অধিদপ্তর, পাবনা। (LGED)",
  "Pabna Sadar, Pabna (পাবনা সদর)",
  "কাজের বিবরণ: আর.সি.সি রাস্তা নির্মাণ",
  "",
];

console.log("--- Testing Unicode Bengali Preservation ---");
for (const sample of unicodeSamples) {
  const converted = autoConvertBijoy(sample);
  const match = converted === sample;
  console.log(`Input: "${sample}" -> Converted: "${converted}" | Preserved: ${match}`);
  if (!match) {
    throw new Error(`Unicode Bengali corrupted: "${sample}" -> "${converted}"`);
  }
}

console.log("\n--- Testing Numeric and Currency Safety ---");
const currencySamples = [
  { in: "-2500", expected: "-2,500" },
  { in: "-2500.75", expected: "-2,500.75" },
  { in: "-0.50", expected: "-0.50" },
  { in: "4126000", expected: "41,26,000" },
  { in: "44 Lac", expected: "44 Lac" },
  { in: "2.2 Cr", expected: "2.2 Cr" },
  { in: "1.25 Crore", expected: "1.25 Crore" },
  { in: "+2500", expected: "2,500" },
];

for (const c of currencySamples) {
  const res = formatCurrencyBD(c.in);
  console.log(`Currency: "${c.in}" -> "${res}" | Matches: ${res === c.expected}`);
  if (res !== c.expected) {
    console.warn(`Mismatch on ${c.in}: got ${res}, expected ${c.expected}`);
  }
}

console.log("\n--- Testing Date Normalization ---");
const dateSamples = [
  { in: "2026-09-21", expected: "21-09-2026" },
  { in: "2026-09-21 05:00 PM", expected: "21-09-2026 05:00 PM" },
  { in: "21/09/2026", expected: "21-09-2026" },
  { in: "21-09-2026", expected: "21-09-2026" },
  { in: "", expected: "" },
];

for (const d of dateSamples) {
  const res = normalizeDateToDmy(d.in);
  console.log(`Date: "${d.in}" -> "${res}" | Matches: ${res === d.expected}`);
}

