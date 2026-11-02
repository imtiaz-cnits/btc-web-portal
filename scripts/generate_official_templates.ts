import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";

const TARGET_DIRS = [
  path.join(process.cwd(), "public", "templates"),
  path.join(process.cwd(), "docs", "templates"),
];

TARGET_DIRS.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Column specifications matching NoticeForm.tsx HEADERS_MAP
const TEMPLATE_SPECS = {
  OTM: {
    name: "otm",
    headers: [
      "Tender Id",
      "Brief Description of Works",
      "Work Location",
      "Type of Method",
      "APP Estimate Cost Tk.",
      "Bank Credit Line",
      "TURN OVER 05 Years",
      "Similar Work 05 Years",
      "Tender Security (BD)",
      "Document Price. Tk",
      "Schedule & BD Last Selling Date",
    ],
    widths: [14, 45, 25, 16, 22, 20, 20, 22, 22, 18, 28],
    sampleRows: [
      [
        "1326177",
        "Construction of Internal R.C.C road-17 (আর.সি.সি রাস্তা নির্মাণ)",
        "Pabna Sadar (পাবনা সদর)",
        "OTM",
        "41,26,000",
        "44 Lac",
        "2.2 Cr",
        "25 Lac",
        "1,00,000",
        "1,500",
        "21-09-2026 05:00 PM",
      ],
      [
        "1326180",
        "Construction of Internal R.C.C road-18 (কালভার্ট ও ড্রেন নির্মাণ)",
        "Sujanagar, Pabna (সুজানগর)",
        "OTM",
        "17,37,000",
        "20 Lac",
        "1.25 Cr",
        "10 Lac",
        "45,000",
        "1,000",
        "21-09-2026 05:00 PM",
      ],
      [
        "1326631",
        "Widening & Strengthening of Pabna-Paksey Highway (পাবনা-পাকশী মহাসড়ক প্রশস্তকরণ)",
        "Ishwardi, Pabna (ঈশ্বরদী)",
        "OTM",
        "2,17,10,000",
        "1.50 Cr",
        "3.5 Cr",
        "1.2 Cr",
        "5,50,000",
        "3,000",
        "25-09-2026 05:00 PM",
      ],
      [
        "1326643",
        "Installation of Deep Tube-well & Solar Pump System (সৌরচালিত গভীর নলকূপ স্থাপন)",
        "Chatmohar, Pabna (চাটমোহর)",
        "OTM",
        "58,63,000",
        "50 Lac",
        "1.8 Cr",
        "35 Lac",
        "1,50,000",
        "2,000",
        "28-09-2026 05:00 PM",
      ],
      [
        "1326655",
        "Construction of 4-Storied Upazila Complex Extension (উপজেলা পরিষদ সম্প্রসারণ)",
        "Bera, Pabna (বেড়া উপজেলা)",
        "OTM",
        "4,85,50,000",
        "2.5 Cr",
        "6.0 Cr",
        "2.5 Cr",
        "12,00,000",
        "4,000",
        "30-09-2026 05:00 PM",
      ],
    ],
  },
  LTM: {
    name: "ltm",
    headers: [
      "Tender Id",
      "Brief Description of Works",
      "Work Location",
      "Type of Method",
      "APP Estimate Cost Tk.",
      "Bank Credit Line",
      "Tender Security (BD)",
      "Document Price. Tk",
      "Schedule & BD Last Selling Date",
    ],
    widths: [14, 45, 25, 16, 22, 20, 22, 18, 28],
    sampleRows: [
      [
        "1428010",
        "Periodic Maintenance of RHD Office Complex Building (আরএইচডি ভবন সংস্কার)",
        "Pabna Road Division (সওজ পাবনা)",
        "LTM",
        "15,50,000",
        "20 Lac",
        "40,000",
        "1,000",
        "21-09-2026 05:00 PM",
      ],
      [
        "1428167",
        "Repair and Painting of Inspection Bungalow (ডাকবাংলো মেরামত ও রঙকরণ)",
        "Paksey, Pabna (পাকশী)",
        "LTM",
        "21,71,000",
        "20 Lac",
        "55,000",
        "1,000",
        "22-09-2026 05:00 PM",
      ],
      [
        "1428189",
        "Routine Carpeting & Seal Coat on Regional Highway (সিলকোট ও কার্পেটিং কাজ)",
        "Pabna-Kashinathpur Road",
        "LTM",
        "43,82,000",
        "45 Lac",
        "1,00,000",
        "1,500",
        "25-09-2026 05:00 PM",
      ],
      [
        "1428194",
        "Construction of Boundary Wall & Main Gate (সীমানা প্রাচীর ও গেইট নির্মাণ)",
        "Atgharia Upazila (আটঘরিয়া)",
        "LTM",
        "18,20,000",
        "20 Lac",
        "45,000",
        "1,000",
        "26-09-2026 05:00 PM",
      ],
      [
        "1428205",
        "Tree Plantation & Turf Sodding on Embankment (বাঁধ সংরক্ষণ ও বৃক্ষরোপণ)",
        "Bera Polder Area (বেড়া)",
        "LTM",
        "12,40,000",
        "15 Lac",
        "30,000",
        "1,000",
        "28-09-2026 05:00 PM",
      ],
    ],
  },
  LOTTERY_PENDING: {
    name: "lottery_pending",
    headers: [
      "Tender Id",
      "Brief Description of Works",
      "Work Location",
      "Type of Method",
      "APP Estimate Cost Tk.",
      "Bank Credit Line",
      "Tender Security (BD)",
      "Document Price. Tk",
      "Schedule & BD Last Selling Date",
    ],
    widths: [14, 45, 25, 18, 22, 20, 22, 18, 28],
    sampleRows: [
      [
        "1529011",
        "Rehabilitation of Rural Road Network (পল্লী সড়ক পুনর্বাসন প্রকল্প)",
        "Sujanagar, Pabna (সুজানগর)",
        "Lottery Pending",
        "28,05,000",
        "30 Lac",
        "70,000",
        "1,000",
        "18-09-2026 05:00 PM",
      ],
      [
        "1529022",
        "Construction of Box Culvert on Feeder Road (কালভার্ট নির্মাণ)",
        "Santhia, Pabna (সাঁথিয়া)",
        "Lottery Pending",
        "19,50,000",
        "20 Lac",
        "50,000",
        "1,000",
        "19-09-2026 05:00 PM",
      ],
      [
        "1529033",
        "Development of Rural Growth Center Market (গ্রোথ সেন্টার হাট বাজার উন্নয়ন)",
        "Faridpur, Pabna (ফরিদপুর)",
        "Lottery Pending",
        "32,40,000",
        "35 Lac",
        "80,000",
        "1,000",
        "22-09-2026 05:00 PM",
      ],
      [
        "1529044",
        "Installation of Solar Street Lights (সৌর সড়ক বাতি স্থাপন প্রকল্প)",
        "Pabna Sadar (পাবনা সদর)",
        "Lottery Pending",
        "22,15,000",
        "25 Lac",
        "55,000",
        "1,000",
        "24-09-2026 05:00 PM",
      ],
      [
        "1529055",
        "Excavation and Re-excavation of Drainage Canal (খাল পুনঃখনন কাজ)",
        "Bhangura, Pabna (ভাঙ্গুড়া)",
        "Lottery Pending",
        "16,75,000",
        "20 Lac",
        "40,000",
        "1,000",
        "26-09-2026 05:00 PM",
      ],
    ],
  },
  LOTTERY_RESULT: {
    name: "lottery_result",
    headers: [
      "Tender Id",
      "Brief Description of Works",
      "Work Location",
      "Type of Method",
      "APP Estimate Cost Tk.",
      "Bank Credit Line",
      "Tender Security (BD)",
      "Document Price. Tk",
      "Schedule & BD Last Selling Date",
      "WINNER LIST NAME",
    ],
    widths: [14, 45, 25, 18, 22, 20, 22, 18, 28, 35],
    sampleRows: [
      [
        "1629101",
        "Construction of Union Parishad Complex (ইউনিয়ন পরিষদ কমপ্লেক্স ভবন নির্মাণ)",
        "Pabna Sadar (পাবনা সদর)",
        "Lottery Result",
        "1,15,30,000",
        "50 Lac",
        "3,00,000",
        "2,000",
        "15-09-2026 05:00 PM",
        "মেসার্স শাহ আলম এন্টারপ্রাইজ",
      ],
      [
        "1629102",
        "Supply of Laboratory Equipment & Furniture (ল্যাবরেটরি সরঞ্জাম সরবরাহ)",
        "Pabna Polytechnic Institute",
        "Lottery Result",
        "45,20,000",
        "30 Lac",
        "1,10,000",
        "1,500",
        "16-09-2026 05:00 PM",
        "মেসার্স কবির কন্সট্রাকশন",
      ],
      [
        "1629103",
        "Maintenance & Renovation of District Auditorium (জেলা শিল্পকলা মিলনায়তন সংস্কার)",
        "Pabna Town (পাবনা শহর)",
        "Lottery Result",
        "38,90,000",
        "30 Lac",
        "95,000",
        "1,000",
        "18-09-2026 05:00 PM",
        "", // Non-winner / pending evaluation row
      ],
      [
        "1629104",
        "Installation of Rainwater Harvesting System (বৃষ্টির পানি সংরক্ষণ প্রকল্প)",
        "Ishwardi, Pabna (ঈশ্বরদী)",
        "Lottery Result",
        "24,60,000",
        "20 Lac",
        "60,000",
        "1,000",
        "20-09-2026 05:00 PM",
        "মেসার্স প্রগতি বিল্ডার্স",
      ],
      [
        "1629105",
        "Construction of Public Sanitation Complex (পাবলিক স্যানিটেশন কমপ্লেক্স নির্মাণ)",
        "Chatmohar Rail Station",
        "Lottery Result",
        "18,75,000",
        "15 Lac",
        "45,000",
        "1,000",
        "22-09-2026 05:00 PM",
        "", // Non-winner row
      ],
    ],
  },
};

function createWorkbook(headers: string[], dataRows: string[][], colWidths: number[]): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  const wsData = [headers, ...dataRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws["!cols"] = colWidths.map((w) => ({ wch: w }));

  XLSX.utils.book_append_sheet(wb, ws, "Tenders");
  return wb;
}

console.log("Generating Official Excel Import Templates for BTC Web Portal...");

Object.entries(TEMPLATE_SPECS).forEach(([catKey, spec]) => {
  // 1. Blank Template
  const blankWb = createWorkbook(spec.headers, [], spec.widths);
  const blankFileName = `${spec.name}_template_blank.xlsx`;

  // 2. Sample Filled Template
  const sampleWb = createWorkbook(spec.headers, spec.sampleRows, spec.widths);
  const sampleFileName = `${spec.name}_template_sample.xlsx`;

  TARGET_DIRS.forEach((dir) => {
    const blankPath = path.join(dir, blankFileName);
    const samplePath = path.join(dir, sampleFileName);

    XLSX.writeFile(blankWb, blankPath);
    XLSX.writeFile(sampleWb, samplePath);
    console.log(`  ✓ Generated ${blankFileName} -> ${dir}`);
    console.log(`  ✓ Generated ${sampleFileName} -> ${dir}`);
  });
});

console.log("\nAll official templates successfully generated in public/templates and docs/templates!");

