/**
 * BTC Web Portal - Table Data Normalization & Backward Compatibility Layer
 * Converts V2 and legacy tender tables into strongly-typed V3 format,
 * preserving all existing fields, formatting, footers, and winner lists.
 */

import {
  NoticeTableDataV3,
  TableSpecV3,
  ColumnSpecV3,
  NoticeTableDataV2,
  V2TableSpec,
  LegacyPWDTable,
  LegacyStandardTable,
  TableValidationResult,
  ColumnAlignment,
  ColumnDataType,
  SharedFooterV3,
} from "./types";

// ============================================================================
// Helper Utilities
// ============================================================================

/**
 * Deep clones any object or array to ensure inputs are never mutated.
 */
function deepClone<T>(obj: T): T {
  if (obj === undefined || obj === null) return obj;
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(obj);
    } catch {
      // Fallback if object has non-cloneable references
    }
  }
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Normalizes a header label into a clean alphanumeric slug.
 */
export function slugifyHeader(header: string, index: number): string {
  if (!header || typeof header !== "string") {
    return `col_${index}`;
  }
  const clean = header
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 30);
  return clean ? `col_${index}_${clean}` : `col_${index}`;
}

/**
 * Detects the semantic fieldKey from header text for mapping and template matching.
 */
export function detectFieldKey(header: string): string {
  if (!header) return "";
  const norm = header.toLowerCase().replace(/[.\s_-]/g, "");

  if (norm === "slno" || norm === "sl" || norm === "serialno" || norm === "serial") {
    return "sl_no";
  }
  if (norm.includes("tenderid") || norm.includes("tenderno") || norm === "tid") {
    return "tender_id";
  }
  if (norm.includes("description") || norm.includes("workdescription") || norm.includes("brief")) {
    return "description";
  }
  if (norm.includes("location") || norm.includes("worklocation") || norm.includes("স্থান") || norm.includes("লোকেশন")) {
    return "location";
  }
  if (norm.includes("method") || norm.includes("matho") || norm.includes("procurementmethod")) {
    return "method";
  }
  if (norm.includes("appestimate") || norm.includes("estimatecost") || norm.includes("appcost")) {
    return "app_estimate_cost";
  }
  if (norm.includes("creditline") || norm.includes("solvency") || norm.includes("liquidasset") || norm.includes("bankcredit")) {
    return "bank_credit_line";
  }
  if (norm.includes("turnover") || norm.includes("turn_over")) {
    return "turnover";
  }
  if (norm.includes("similarwork") || norm.includes("similar")) {
    return "similar_work";
  }
  if (norm.includes("security") || norm.includes("tendersecurity") || norm.includes("bdsecurity")) {
    return "tender_security";
  }
  if (norm.includes("docfees") || norm.includes("documentprice") || norm.includes("fees") || norm.includes("price")) {
    return "document_price";
  }
  if (norm.includes("sellingdate") || norm.includes("lastdate") || norm.includes("scheduledate") || norm.includes("selling")) {
    return "selling_date";
  }
  if (norm.includes("winner") || norm.includes("winnerlist") || norm.includes("winnername")) {
    return "winner_list_name";
  }
  if (norm.includes("lotterydate")) {
    return "lottery_date";
  }
  if (norm.includes("status")) {
    return "status";
  }
  if (norm.includes("remarks")) {
    return "remarks";
  }

  return norm.slice(0, 30);
}

/**
 * Infers data type based on column header and content.
 */
export function inferColumnDataType(header: string): ColumnDataType {
  if (!header) return "string";
  const lower = header.toLowerCase();

  if (
    lower.includes("cost") ||
    lower.includes("tk") ||
    lower.includes("taka") ||
    lower.includes("security") ||
    lower.includes("fees") ||
    lower.includes("fee") ||
    lower.includes("price") ||
    lower.includes("amount") ||
    lower.includes("turn over") ||
    lower.includes("turnover") ||
    lower.includes("similar work") ||
    lower.includes("credit") ||
    lower.includes("টাকা")
  ) {
    return "currency";
  }

  if (
    lower.includes("date") ||
    lower.includes("time") ||
    lower.includes("selling") ||
    lower.includes("তারিখ") ||
    lower.includes("সময়")
  ) {
    return "date";
  }

  const norm = lower.replace(/[.\s_-]/g, "");
  if (norm === "slno" || norm === "sl" || norm === "serial") {
    return "number";
  }

  return "string";
}

/**
 * Infers appropriate text alignment for the column.
 */
export function inferColumnAlignment(header: string): ColumnAlignment {
  const dataType = inferColumnDataType(header);
  if (dataType === "currency") return "right";

  const norm = (header || "").toLowerCase().replace(/[.\s_-]/g, "");
  if (
    norm === "slno" ||
    norm === "sl" ||
    norm === "serial" ||
    norm.includes("method") ||
    norm.includes("matho") ||
    dataType === "date"
  ) {
    return "center";
  }

  return "left";
}

/**
 * Infers default column width in pixels based on standard BTC layout specifications.
 */
export function inferColumnWidth(header: string): number {
  if (!header) return 110;
  const norm = header.toLowerCase().replace(/[.\s_-]/g, "");

  if (norm === "slno" || norm === "sl") return 50;
  if (norm.includes("tenderid") || norm.includes("tid")) return 95;
  if (norm.includes("description")) return 280;
  // Standard location width requested to prevent wrapping into 3 lines
  if (norm.includes("location") || norm.includes("স্থান") || norm.includes("লোকেশন")) return 140;
  if (norm.includes("method") || norm.includes("matho")) return 75;
  if (norm.includes("winner")) return 160;
  if (norm.includes("sellingdate") || norm.includes("lastdate") || norm.includes("schedule")) return 125;
  if (norm.includes("cost") || norm.includes("credit") || norm.includes("security") || norm.includes("price")) return 110;

  return 110;
}

// ============================================================================
// Core Normalization Functions
// ============================================================================

/**
 * Converts a list of string headers and colors into rich ColumnSpecV3 objects.
 */
export function headersToColumnSpecs(
  headers: string[],
  columnColors: string[] = []
): ColumnSpecV3[] {
  if (!Array.isArray(headers)) return [];

  const usedIds = new Set<string>();

  return headers.map((headerText, index) => {
    let baseId = slugifyHeader(headerText, index);
    let uniqueId = baseId;
    let counter = 1;
    while (usedIds.has(uniqueId)) {
      uniqueId = `${baseId}_${counter++}`;
    }
    usedIds.add(uniqueId);

    const isWinnerCol = (headerText || "")
      .toUpperCase()
      .replace(/\./g, "")
      .includes("WINNER");

    const defaultBg = columnColors[index] || (isWinnerCol ? "#fde047" : "#ffffff");

    return {
      id: uniqueId,
      header: (headerText ?? "").toString().trim(),
      fieldKey: detectFieldKey(headerText),
      width: inferColumnWidth(headerText),
      align: inferColumnAlignment(headerText),
      dataType: inferColumnDataType(headerText),
      visible: true,
      backgroundColor: defaultBg,
      required: index === 0 || isWinnerCol,
    };
  });
}

/**
 * Converts row data (arrays or objects) into Record<columnId, string> rows.
 * Also dynamically creates extra ColumnSpecV3 columns if any row has extra unmapped cells,
 * ensuring zero data loss during normalization.
 */
export function rowsToRecordObjects(
  rows: any[],
  columns: ColumnSpecV3[]
): { rows: Record<string, string>[]; updatedColumns: ColumnSpecV3[] } {
  if (!Array.isArray(rows)) return { rows: [], updatedColumns: columns };

  const mutableColumns = [...columns];
  const maxRowLength = rows.reduce((max, r) => {
    return Array.isArray(r) ? Math.max(max, r.length) : max;
  }, mutableColumns.length);

  // If some rows contain more cells than headers, dynamically add extra columns
  if (maxRowLength > mutableColumns.length) {
    for (let c = mutableColumns.length; c < maxRowLength; c++) {
      const extraHeader = `Extra Column ${c + 1}`;
      mutableColumns.push({
        id: `col_${c}_extra_${c + 1}`,
        header: extraHeader,
        fieldKey: `extra_${c + 1}`,
        width: 110,
        align: "left",
        dataType: "string",
        visible: true,
        backgroundColor: "#ffffff",
      });
    }
  }

  const normalizedRows: Record<string, string>[] = rows.map((rawRow) => {
    const rowObj: Record<string, string> = {};

    if (Array.isArray(rawRow)) {
      mutableColumns.forEach((col, cIdx) => {
        const val = rawRow[cIdx];
        rowObj[col.id] = val !== undefined && val !== null ? String(val) : "";
      });
    } else if (rawRow && typeof rawRow === "object") {
      // Map legacy PWD object fields or existing column-ID objects
      const isPwdObj =
        "tenderId" in rawRow ||
        "description" in rawRow ||
        "appCost" in rawRow ||
        "lastDateTime" in rawRow;

      if (isPwdObj) {
        const pwdMap: Record<string, any> = {
          tender_id: rawRow.tenderId,
          description: rawRow.description,
          location: rawRow.location,
          app_estimate_cost: rawRow.appCost,
          bank_credit_line: rawRow.solvency,
          tender_security: rawRow.security,
          document_price: rawRow.docFees,
          selling_date: rawRow.lastDateTime || rawRow.lastDate,
        };

        mutableColumns.forEach((col) => {
          if (col.fieldKey && pwdMap[col.fieldKey] !== undefined) {
            rowObj[col.id] = String(pwdMap[col.fieldKey] ?? "");
          } else if (rawRow[col.id] !== undefined) {
            rowObj[col.id] = String(rawRow[col.id] ?? "");
          } else {
            rowObj[col.id] = "";
          }
        });
      } else {
        // Direct object mapping: checks by column ID or header name
        mutableColumns.forEach((col) => {
          if (rawRow[col.id] !== undefined) {
            rowObj[col.id] = String(rawRow[col.id] ?? "");
          } else if (rawRow[col.header] !== undefined) {
            rowObj[col.id] = String(rawRow[col.header] ?? "");
          } else if (col.fieldKey && rawRow[col.fieldKey] !== undefined) {
            rowObj[col.id] = String(rawRow[col.fieldKey] ?? "");
          } else {
            rowObj[col.id] = "";
          }
        });
      }
    }

    return rowObj;
  });

  return { rows: normalizedRows, updatedColumns: mutableColumns };
}

/**
 * Converts existing V2 structure into V3 format.
 */
export function convertV2ToV3(v2Data: NoticeTableDataV2): NoticeTableDataV3 {
  const cloned = deepClone(v2Data);
  const v2Tables = Array.isArray(cloned?.tables) ? cloned.tables : [];

  const tablesV3: TableSpecV3[] = v2Tables.map((t: V2TableSpec, index: number) => {
    const rawHeaders: string[] = Array.isArray(t.headers) ? t.headers : [];
    const rawColors: string[] = Array.isArray(t.columnColors) ? t.columnColors : [];

    // Convert headers to rich column specifications
    const baseColumns = headersToColumnSpecs(rawHeaders, rawColors);

    // Convert rows and preserve any extra cell data
    const { rows: normalizedRows, updatedColumns } = rowsToRecordObjects(
      t.rows || [],
      baseColumns
    );

    // Collect any extra unmapped properties safely into extra
    const knownKeys = new Set([
      "id",
      "type",
      "officeName",
      "subTitle",
      "workLocation",
      "noticeDateBlock",
      "lastDateBlock",
      "lotteryDateBlock",
      "payOrderTo",
      "moreInfo",
      "bottomWarning",
      "headers",
      "rows",
      "columnColors",
      "headerBgColor",
    ]);

    const extraProps: Record<string, any> = {};
    Object.keys(t).forEach((key) => {
      if (!knownKeys.has(key)) {
        extraProps[key] = t[key];
      }
    });

    return {
      id: t.id || `tbl_${index + 1}`,
      title: t.officeName || "",
      subtitle: t.subTitle || "",
      order: index,
      tableType: t.type || "LTM",
      headers: updatedColumns,
      rows: normalizedRows,
      headerBgColor: t.headerBgColor || "#0891b2",
      columnColors: rawColors,
      workLocation: t.workLocation || "",
      noticeDateBlock: t.noticeDateBlock || "",
      lastDateBlock: t.lastDateBlock || "",
      lotteryDateBlock: t.lotteryDateBlock || "",
      payOrderTo: t.payOrderTo || "",
      moreInfo: t.moreInfo || "",
      bottomWarning: t.bottomWarning || "",
      extra: Object.keys(extraProps).length > 0 ? extraProps : undefined,
    };
  });

  // Extract shared footer if all tables share identical values
  let sharedFooter: SharedFooterV3 | undefined = undefined;
  if (tablesV3.length > 0) {
    const first = tablesV3[0];
    const isShared = tablesV3.every(
      (t) =>
        t.payOrderTo === first.payOrderTo &&
        t.moreInfo === first.moreInfo &&
        t.bottomWarning === first.bottomWarning
    );

    if (isShared && (first.payOrderTo || first.moreInfo || first.bottomWarning)) {
      sharedFooter = {
        payOrderTo: first.payOrderTo,
        moreInfo: first.moreInfo,
        bottomWarning: first.bottomWarning,
      };
    }
  }

  return {
    version: "v3",
    tables: tablesV3,
    sharedFooter,
    metadata: {
      migratedFrom: "v2",
      migratedAt: new Date().toISOString(),
    },
  };
}

/**
 * Converts legacy single-table formats (isPwdTemplate or standard headers/rows) into V3 format.
 */
export function convertLegacyToV3(
  legacy: LegacyPWDTable | LegacyStandardTable,
  kind: "pwd" | "standard" = "pwd"
): NoticeTableDataV3 {
  const cloned = deepClone(legacy);

  if (kind === "pwd" || (cloned as LegacyPWDTable).isPwdTemplate) {
    const pwd = cloned as LegacyPWDTable;
    const defaultHeaders = [
      "Tender ID",
      "Brief Description of Works",
      "Work Location",
      "Type of Method",
      "APP Estimate Cost Tk.",
      "Bank Credit Line",
      "Tender Security (BD)",
      "Document Price. Tk",
      "Schedule & BD Last Selling Date",
    ];

    const rawHeaders = Array.isArray(pwd.headers) && pwd.headers.length > 0
      ? pwd.headers
      : defaultHeaders;

    const baseColumns = headersToColumnSpecs(rawHeaders, pwd.columnColors || []);
    const { rows: normalizedRows, updatedColumns } = rowsToRecordObjects(
      pwd.rows || [],
      baseColumns
    );

    const tableV3: TableSpecV3 = {
      id: "tbl_legacy_pwd_1",
      title: pwd.officeName || "",
      subtitle: "",
      order: 0,
      tableType: "LTM",
      headers: updatedColumns,
      rows: normalizedRows,
      headerBgColor: pwd.headerBgColor || "#0891b2",
      columnColors: pwd.columnColors || [],
      noticeDateBlock: pwd.noticeDateBlock || "",
      lastDateBlock: pwd.lastDateBlock || "",
      lotteryDateBlock: pwd.lotteryDateBlock || "",
      payOrderTo: pwd.payOrderTo || "",
      moreInfo: pwd.moreInfo || "",
      bottomWarning: pwd.bottomWarning || "",
    };

    return {
      version: "v3",
      tables: [tableV3],
      sharedFooter: {
        payOrderTo: pwd.payOrderTo,
        moreInfo: pwd.moreInfo,
        bottomWarning: pwd.bottomWarning,
      },
      metadata: {
        migratedFrom: "pwd_legacy",
        migratedAt: new Date().toISOString(),
      },
    };
  } else {
    const std = cloned as LegacyStandardTable;
    const rawHeaders = Array.isArray(std.headers) ? std.headers : [];
    const baseColumns = headersToColumnSpecs(rawHeaders, std.columnColors || []);
    const { rows: normalizedRows, updatedColumns } = rowsToRecordObjects(
      std.rows || [],
      baseColumns
    );

    const tableV3: TableSpecV3 = {
      id: "tbl_legacy_std_1",
      title: std.officeName || "",
      subtitle: std.subTitle || "",
      order: 0,
      tableType: "CUSTOM",
      headers: updatedColumns,
      rows: normalizedRows,
      headerBgColor: std.headerBgColor || "#0891b2",
      columnColors: std.columnColors || [],
    };

    return {
      version: "v3",
      tables: [tableV3],
      metadata: {
        migratedFrom: "standard_legacy",
        migratedAt: new Date().toISOString(),
      },
    };
  }
}

/**
 * Universal normalizer: accepts any format (V3, V2, Legacy PWD, Legacy Standard, or raw JSON string)
 * and safely transforms it into a standard NoticeTableDataV3 structure without mutating the original input.
 */
export function normalizeNoticeTableData(data: any): NoticeTableDataV3 {
  if (!data) {
    return { version: "v3", tables: [] };
  }

  const cloned = deepClone(data);

  // 1. If already V3 format
  if (cloned.version === "v3" && Array.isArray(cloned.tables)) {
    // Validate table integrity: ensure each column has valid ID and rows are record objects
    cloned.tables.forEach((t: TableSpecV3, tIdx: number) => {
      t.id = t.id || `tbl_${tIdx + 1}`;
      t.order = typeof t.order === "number" ? t.order : tIdx;

      // Ensure headers are ColumnSpecV3
      if (Array.isArray(t.headers)) {
        t.headers = t.headers.map((col: any, cIdx: number) => {
          if (typeof col === "string") {
            return {
              id: slugifyHeader(col, cIdx),
              header: col,
              fieldKey: detectFieldKey(col),
              width: inferColumnWidth(col),
              align: inferColumnAlignment(col),
              dataType: inferColumnDataType(col),
              visible: true,
            };
          }
          return {
            id: col.id || `col_${cIdx}`,
            header: col.header || `Column ${cIdx + 1}`,
            fieldKey: col.fieldKey || detectFieldKey(col.header),
            width: col.width || inferColumnWidth(col.header),
            align: col.align || inferColumnAlignment(col.header),
            dataType: col.dataType || inferColumnDataType(col.header),
            visible: col.visible !== false,
            backgroundColor: col.backgroundColor,
            required: col.required,
          };
        });
      } else {
        t.headers = [];
      }

      // Ensure rows are Record<string, string>
      if (Array.isArray(t.rows)) {
        const { rows: validatedRows } = rowsToRecordObjects(t.rows, t.headers);
        t.rows = validatedRows;
      } else {
        t.rows = [];
      }
    });

    return cloned as NoticeTableDataV3;
  }

  // 2. V2 format: { version: "v2", tables: [...] }
  if (cloned.version === "v2" && Array.isArray(cloned.tables)) {
    return convertV2ToV3(cloned as NoticeTableDataV2);
  }

  // 3. Array of tables without root version wrapper
  if (Array.isArray(cloned)) {
    return convertV2ToV3({ version: "v2", tables: cloned });
  }

  // 4. Legacy PWD Template format
  if (cloned.isPwdTemplate) {
    return convertLegacyToV3(cloned as LegacyPWDTable, "pwd");
  }

  // 5. Legacy Standard Table format: { headers: [...], rows: [...] }
  if (Array.isArray(cloned.headers) && Array.isArray(cloned.rows)) {
    return convertLegacyToV3(cloned as LegacyStandardTable, "standard");
  }

  // Fallback for unrecognized non-empty objects
  return {
    version: "v3",
    tables: [],
    metadata: {
      parseErrors: ["Unrecognized tableData schema structure"],
    },
  };
}

/**
 * Parses raw JSON string or object from database, safely handling malformed inputs.
 */
export function parseNoticeTableData(raw: string | object | null | undefined): NoticeTableDataV3 {
  if (!raw) {
    return { version: "v3", tables: [] };
  }

  if (typeof raw === "object") {
    return normalizeNoticeTableData(raw);
  }

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) {
      return { version: "v3", tables: [] };
    }

    try {
      const parsed = JSON.parse(trimmed);
      return normalizeNoticeTableData(parsed);
    } catch (err: any) {
      return {
        version: "v3",
        tables: [],
        metadata: {
          parseErrors: [`JSON parse error: ${err.message || "Invalid JSON"}`],
        },
      };
    }
  }

  return { version: "v3", tables: [] };
}

/**
 * Validates a NoticeTableDataV3 structure against the required schema.
 */
export function validateNoticeTableData(data: any): TableValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data || typeof data !== "object") {
    return { isValid: false, errors: ["Notice table data must be a non-null object"] };
  }

  if (data.version !== "v3") {
    errors.push(`Expected version 'v3', got '${data.version}'`);
  }

  if (!Array.isArray(data.tables)) {
    errors.push("Notice table data must include a 'tables' array");
    return { isValid: false, errors, warnings };
  }

  const tableIds = new Set<string>();

  data.tables.forEach((t: any, tIdx: number) => {
    if (!t || typeof t !== "object") {
      errors.push(`Table at index ${tIdx} is not a valid object`);
      return;
    }

    if (!t.id) {
      errors.push(`Table at index ${tIdx} is missing a required 'id'`);
    } else {
      if (tableIds.has(t.id)) {
        warnings.push(`Duplicate table id detected: '${t.id}'`);
      }
      tableIds.add(t.id);
    }

    if (!Array.isArray(t.headers)) {
      errors.push(`Table '${t.id || tIdx}' must have a 'headers' array`);
    } else {
      const colIds = new Set<string>();
      t.headers.forEach((col: any, cIdx: number) => {
        if (!col || typeof col !== "object" || !col.id) {
          errors.push(`Table '${t.id}' column at index ${cIdx} must have a valid 'id'`);
        } else {
          if (colIds.has(col.id)) {
            warnings.push(`Table '${t.id}' has duplicate column id: '${col.id}'`);
          }
          colIds.add(col.id);
        }
      });
    }

    if (!Array.isArray(t.rows)) {
      errors.push(`Table '${t.id || tIdx}' must have a 'rows' array`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Serializes NoticeTableDataV3 into JSON string for persistence in Notice.tableData.
 */
export function serializeNoticeTableData(v3Data: NoticeTableDataV3): string {
  const validation = validateNoticeTableData(v3Data);
  if (!validation.isValid) {
    console.warn("Saving NoticeTableDataV3 with validation errors:", validation.errors);
  }
  return JSON.stringify(v3Data);
}

// ============================================================================
// Interoperability Adapters (For Public Rendering, Print, and PDF)
// ============================================================================

/**
 * Converts a TableSpecV3 into positional headers and rows string arrays.
 * Enables 100% seamless backward compatibility with existing SingleNoticeClient,
 * NoticeTable, and PDF pagination code without modifying their rendering logic!
 */
export function tableSpecToRowsArray(table: TableSpecV3): {
  headers: string[];
  rows: string[][];
  columnColors: string[];
  visibleColumns: ColumnSpecV3[];
} {
  const visibleColumns = (table.headers || []).filter((col) => col.visible !== false);
  const headers = visibleColumns.map((c) => c.header);
  const columnColors = visibleColumns.map(
    (c, i) => c.backgroundColor || table.columnColors?.[i] || "#ffffff"
  );

  const rows = (table.rows || []).map((rowObj) => {
    return visibleColumns.map((col) => rowObj[col.id] ?? "");
  });

  return {
    headers,
    rows,
    columnColors,
    visibleColumns,
  };
}

/**
 * Converts a table object with positional array rows into a strongly typed TableSpecV3.
 */
export function rowsArrayToTableSpec(params: {
  id?: string;
  order?: number;
  tableTitle?: string;
  tableSubtitle?: string;
  officeName?: string;
  subTitle?: string;
  workLocation?: string;
  noticeDateBlock?: string;
  lastDateBlock?: string;
  lotteryDateBlock?: string;
  headers: string[];
  rows: (string[] | Record<string, any>)[];
  columnColors?: string[];
  headerBg?: string;
  headerBgColor?: string;
  payOrderTo?: string;
  moreInfo?: string;
  bottomWarning?: string;
  tableType?: string;
  category?: string;
  extra?: Record<string, any>;
}): TableSpecV3 {
  const rawHeaders: string[] = Array.isArray(params.headers) ? params.headers : [];
  const rawColors: string[] = Array.isArray(params.columnColors) ? params.columnColors : [];

  const baseColumns = headersToColumnSpecs(rawHeaders, rawColors);
  const { rows: normalizedRows, updatedColumns } = rowsToRecordObjects(
    params.rows || [],
    baseColumns
  );

  return {
    id: params.id || `tbl_${(params.order ?? 0) + 1}`,
    title: params.tableTitle || params.officeName || "",
    subtitle: params.tableSubtitle || params.subTitle || "",
    order: typeof params.order === "number" ? params.order : 0,
    tableType: params.tableType || params.category || "LTM",
    headers: updatedColumns,
    rows: normalizedRows,
    headerBgColor: params.headerBgColor || params.headerBg || "#0891b2",
    columnColors: rawColors,
    workLocation: params.workLocation || "",
    noticeDateBlock: params.noticeDateBlock || "",
    lastDateBlock: params.lastDateBlock || "",
    lotteryDateBlock: params.lotteryDateBlock || "",
    payOrderTo: params.payOrderTo || "",
    moreInfo: params.moreInfo || "",
    bottomWarning: params.bottomWarning || "",
    extra: params.extra,
  };
}

/**
 * Winner row detection utility: checks if a row contains a winning tenderer.
 */
export function isWinnerRow(row: Record<string, string>, headers: ColumnSpecV3[]): boolean {
  if (!row || !Array.isArray(headers)) return false;

  const winnerCol = headers.find((h) =>
    (h.header || "").toUpperCase().replace(/\./g, "").includes("WINNER")
  );

  if (!winnerCol) return false;
  const val = row[winnerCol.id];
  return !!val && val.trim() !== "";
}


