/**
 * BTC Web Portal - Category-Aware Column Mapping Engine
 * Maps Excel source headers to existing destination tender table headers
 * for OTM, LTM, LOTTERY_PENDING, and LOTTERY_RESULT.
 */

export interface ColumnMappingItem {
  destinationHeader: string;
  sourceHeader: string | null;
  isAutoMatched: boolean;
  isRequired: boolean;
  confidence: number; // 0 to 1
}

export interface MappingResult {
  mappings: ColumnMappingItem[];
  unmappedSourceHeaders: string[];
  unmappedDestinationHeaders: string[];
  missingRequiredHeaders: string[];
}

/**
 * Standard known aliases for tender table columns
 */
const ALIAS_MAP: Record<string, string[]> = {
  "Tender Id": [
    "tender id",
    "tender no",
    "tender_id",
    "tenderid",
    "tender ref",
    "tender ref.",
    "tender reference",
    "ref no",
    "package",
    "package no",
    "package no.",
    "pkg no",
    "id",
    "tender code",
    "টেন্ডার আইডি",
    "টেন্ডার নং",
  ],
  "Brief Description of Works": [
    "brief description of works",
    "work description",
    "description",
    "description of work",
    "package name",
    "name of work",
    "work details",
    "কাজের বিবরণ",
    "কাজের নাম",
  ],
  "Work Location": [
    "work location",
    "location",
    "project location",
    "project site",
    "work site",
    "site location",
    "site",
    "project area",
    "district",
    "place",
    "উপজেলা",
    "জেলা",
    "স্থান",
    "লোকেশন",
  ],
  "Type of Method": [
    "type of method",
    "method",
    "procurement method",
    "bidding method",
    "পদ্ধতি",
  ],
  "APP Estimate Cost Tk.": [
    "app estimate cost tk.",
    "app estimate cost",
    "estimated cost",
    "estimate cost",
    "app cost",
    "estimated amount",
    "estimated value",
    "contract value",
    "cost (tk)",
    "প্রাক্কলিত মূল্য",
    "আনুমানিক মূল্য",
  ],
  "Bank Credit Line": [
    "bank credit line",
    "credit line",
    "liquid asset",
    "liquid assets",
    "credit commitment",
    "solvency",
    "financial resource",
    "ক্রেডিট লাইন",
    "লিকুইড এসেট",
  ],
  "TURN OVER 05 Years": [
    "turn over 05 years",
    "turn over",
    "turnover",
    "annual turnover",
    "turn over 5 years",
    "টার্ন ওভার",
  ],
  "Similar Work 05 Years": [
    "similar work 05 years",
    "similar work",
    "similar experience",
    "specific experience",
    "সমজাতীয় কাজ",
  ],
  "Tender Security (BD)": [
    "tender security (bd)",
    "tender security",
    "security (bd)",
    "security bd",
    "security",
    "security amount",
    "emd",
    "emd security",
    "tender emd",
    "earnest money",
    "bid security",
    "টেন্ডার সিকিউরিটি",
    "জামানত",
  ],
  "Document Price. Tk": [
    "document price. tk",
    "document price",
    "document fee",
    "document fees",
    "doc price",
    "doc fees (tk)",
    "doc fees",
    "doc fee",
    "tender document price",
    "price of tender document",
    "tender fee",
    "দরপত্র মূল্য",
    "ডকুমেন্ট ফি",
  ],
  "Schedule & BD Last Selling Date": [
    "schedule & bd last selling date",
    "last selling date",
    "last date",
    "selling date",
    "closing date",
    "submission date",
    "submission deadline",
    "selling deadline",
    "closing deadline",
    "last date of submission",
    "bid submission",
    "deadline",
    "last date & time",
    "শেষ তারিখ",
    "বিক্রয়ের শেষ তারিখ",
  ],
  "WINNER LIST NAME": [
    "winner list name",
    "winner name",
    "winner",
    "winner list",
    "awardee",
    "awarded to",
    "selected bidder",
    "বিজয়ীর নাম",
    "লটারী বিজয়ী",
  ],
};

const REQUIRED_COLUMNS = ["Tender Id", "Brief Description of Works"];

/**
 * Normalizes text for comparison by stripping punctuation, whitespace, and lowercasing.
 */
function cleanNormalize(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[.\s_\-()\/]/g, "")
    .trim();
}

/**
 * Computes automatic mapping between destination headers and Excel source headers.
 */
export function mapColumns(
  destinationHeaders: string[],
  sourceHeaders: string[],
): MappingResult {
  const cleanSourceHeaders = sourceHeaders.map((s) => ({
    original: s,
    cleaned: cleanNormalize(s),
    lower: s.toLowerCase().trim(),
  }));

  const usedSourceIndices = new Set<number>();
  const mappings: ColumnMappingItem[] = [];

  for (const destHdr of destinationHeaders) {
    const isRequired = REQUIRED_COLUMNS.includes(destHdr);
    const cleanedDest = cleanNormalize(destHdr);
    const lowerDest = destHdr.toLowerCase().trim();
    const aliases = ALIAS_MAP[destHdr] || [];

    let matchedSourceHeader: string | null = null;
    let confidence = 0;
    let matchedSourceIdx = -1;

    // 1. Exact match
    for (let i = 0; i < cleanSourceHeaders.length; i++) {
      if (usedSourceIndices.has(i)) continue;
      if (cleanSourceHeaders[i].original === destHdr) {
        matchedSourceHeader = cleanSourceHeaders[i].original;
        confidence = 1.0;
        matchedSourceIdx = i;
        break;
      }
    }

    // 2. Case-insensitive exact match
    if (matchedSourceIdx === -1) {
      for (let i = 0; i < cleanSourceHeaders.length; i++) {
        if (usedSourceIndices.has(i)) continue;
        if (cleanSourceHeaders[i].lower === lowerDest) {
          matchedSourceHeader = cleanSourceHeaders[i].original;
          confidence = 0.95;
          matchedSourceIdx = i;
          break;
        }
      }
    }

    // 3. Cleaned match (whitespace/punctuation stripped)
    if (matchedSourceIdx === -1) {
      for (let i = 0; i < cleanSourceHeaders.length; i++) {
        if (usedSourceIndices.has(i)) continue;
        if (cleanSourceHeaders[i].cleaned === cleanedDest) {
          matchedSourceHeader = cleanSourceHeaders[i].original;
          confidence = 0.9;
          matchedSourceIdx = i;
          break;
        }
      }
    }

    // 4. Known aliases match
    if (matchedSourceIdx === -1) {
      for (let i = 0; i < cleanSourceHeaders.length; i++) {
        if (usedSourceIndices.has(i)) continue;
        const srcClean = cleanSourceHeaders[i].cleaned;
        const srcLower = cleanSourceHeaders[i].lower;

        for (const alias of aliases) {
          const aliasClean = cleanNormalize(alias);
          if (srcClean === aliasClean || srcLower === alias.toLowerCase()) {
            matchedSourceHeader = cleanSourceHeaders[i].original;
            confidence = 0.85;
            matchedSourceIdx = i;
            break;
          }
        }
        if (matchedSourceIdx !== -1) break;
      }
    }

    // 5. Partial substring match for robust fallback
    if (matchedSourceIdx === -1) {
      for (let i = 0; i < cleanSourceHeaders.length; i++) {
        if (usedSourceIndices.has(i)) continue;
        const srcClean = cleanSourceHeaders[i].cleaned;
        if (srcClean.length >= 4 && (cleanedDest.includes(srcClean) || srcClean.includes(cleanedDest))) {
          matchedSourceHeader = cleanSourceHeaders[i].original;
          confidence = 0.7;
          matchedSourceIdx = i;
          break;
        }
      }
    }

    if (matchedSourceIdx !== -1) {
      usedSourceIndices.add(matchedSourceIdx);
    }

    mappings.push({
      destinationHeader: destHdr,
      sourceHeader: matchedSourceHeader,
      isAutoMatched: matchedSourceHeader !== null,
      isRequired,
      confidence,
    });
  }

  // Unmapped source headers
  const unmappedSourceHeaders: string[] = [];
  sourceHeaders.forEach((srcHdr, idx) => {
    if (!usedSourceIndices.has(idx)) {
      unmappedSourceHeaders.push(srcHdr);
    }
  });

  // Unmapped destination headers
  const unmappedDestinationHeaders: string[] = [];
  const missingRequiredHeaders: string[] = [];

  mappings.forEach((m) => {
    if (!m.sourceHeader) {
      unmappedDestinationHeaders.push(m.destinationHeader);
      if (m.isRequired) {
        missingRequiredHeaders.push(m.destinationHeader);
      }
    }
  });

  return {
    mappings,
    unmappedSourceHeaders,
    unmappedDestinationHeaders,
    missingRequiredHeaders,
  };
}

