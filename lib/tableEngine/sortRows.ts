export function sortRowsByTenderIdAsc(
  rows: string[][],
  headers: string[],
): string[][] {
  if (!Array.isArray(rows) || rows.length <= 1 || !Array.isArray(headers)) {
    return rows;
  }

  const tenderIdColIdx = headers.findIndex((h: string) => {
    const norm = (h || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    return norm === "tenderid" || norm.includes("tenderid");
  });

  if (tenderIdColIdx === -1) {
    return rows;
  }

  const slColIdx = headers.findIndex((h: string) => {
    const norm = (h || "").toLowerCase().replace(/\./g, "").trim();
    return norm === "slno" || norm === "sl no" || norm === "sl";
  });

  const toAsciiDigits = (str: string) =>
    str.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)));

  const extractSortKey = (val: string) => {
    const cleaned = toAsciiDigits(String(val ?? "")).trim();
    if (!cleaned || cleaned.toUpperCase() === "N/A") {
      return { empty: true, num: Infinity, text: "" };
    }
    const numericOnly = cleaned.replace(/,/g, "");
    if (/^\d+(\.\d+)?$/.test(numericOnly)) {
      return { empty: false, num: Number(numericOnly), text: numericOnly };
    }
    return { empty: false, num: NaN, text: cleaned };
  };

  const sorted = [...rows].sort((rowA, rowB) => {
    const a = extractSortKey(rowA?.[tenderIdColIdx] ?? "");
    const b = extractSortKey(rowB?.[tenderIdColIdx] ?? "");

    if (a.empty && b.empty) return 0;
    if (a.empty) return 1;
    if (b.empty) return -1;

    if (!isNaN(a.num) && !isNaN(b.num)) {
      return a.num - b.num;
    }

    return a.text.localeCompare(b.text, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });

  if (slColIdx !== -1) {
    return sorted.map((row, idx) => {
      const copy = [...row];
      copy[slColIdx] = String(idx + 1);
      return copy;
    });
  }

  return sorted;
}
