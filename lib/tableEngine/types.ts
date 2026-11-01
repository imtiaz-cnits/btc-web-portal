/**
 * BTC Web Portal - Table Engine Types
 * Strongly typed definitions for V3, V2, and Legacy Tender Table data structures.
 */

// ============================================================================
// 1. Column Specifications (V3)
// ============================================================================

export type ColumnDataType = "string" | "number" | "currency" | "date";
export type ColumnAlignment = "left" | "center" | "right";

export interface ColumnSpecV3 {
  /** Stable unique identifier (e.g., 'col_tender_id', 'col_k8s2_location') */
  id: string;
  /** Visible header title (e.g., 'Tender Id', 'Work Location') */
  header: string;
  /** Normalized slug key for data mapping (e.g., 'tender_id') */
  fieldKey?: string;
  /** Custom column width in pixels (e.g., 140) */
  width?: number;
  /** Text alignment in header and body cells */
  align?: ColumnAlignment;
  /** Data formatting type */
  dataType?: ColumnDataType;
  /** Whether the column is visible in tables, print, and PDF */
  visible?: boolean;
  /** Custom background color for this column (hex, e.g. '#fde047') */
  backgroundColor?: string;
  /** Whether cell value is mandatory for valid rows */
  required?: boolean;
}

// ============================================================================
// 2. Table Specifications (V3)
// ============================================================================

export type NoticeTableCategory =
  | "OTM"
  | "LTM"
  | "LOTTERY_PENDING"
  | "LOTTERY_RESULT"
  | "CUSTOM";

export interface TableStyleV3 {
  borderColor?: string;
  borderWidth?: number;
  fontSize?: number;
  alternateRowColors?: boolean;
}

export interface TableSpecV3 {
  /** Stable unique table ID (e.g., 'tbl_main_1', 'tbl_u39s12') */
  id: string;
  /** Table title / Procuring Entity (e.g. 'গণপূর্ত বিভাগ, পাবনা।') */
  title?: string;
  /** Optional subtitle or method note (e.g. 'e-Tender Notice (LTM Method)') */
  subtitle?: string;
  /** Display sequence order (0-indexed) */
  order: number;
  /** Template category / type */
  tableType?: NoticeTableCategory | string;

  /** Ordered list of column definitions */
  headers: ColumnSpecV3[];
  /** Row data keyed by ColumnSpecV3.id */
  rows: Record<string, string>[];

  /** Table header background color (e.g. '#0891b2') */
  headerBgColor?: string;
  /** Legacy array of column background colors preserved for backward compatibility */
  columnColors?: string[];

  /** Work Location shorthand / default for table */
  workLocation?: string;
  /** Formatted notice publication date block (e.g., '20-08-2026 11:56 AM') */
  noticeDateBlock?: string;
  /** Formatted last date & time block (e.g., '01-09-2026 05:00 PM') */
  lastDateBlock?: string;
  /** Formatted lottery date & time block */
  lotteryDateBlock?: string;

  /** Table-level footer overrides (if not using shared notice footer) */
  payOrderTo?: string;
  moreInfo?: string;
  bottomWarning?: string;

  /** Optional presentation styling */
  tableStyle?: TableStyleV3;

  /** Preserves unknown legacy or custom properties */
  extra?: Record<string, any>;
}

// ============================================================================
// 3. Shared Notice Footer & Root Payload (V3)
// ============================================================================

export interface SharedFooterV3 {
  payOrderTo?: string;
  moreInfo?: string;
  bottomWarning?: string;
}

export interface NoticeTableDataV3 {
  version: "v3";
  tables: TableSpecV3[];
  sharedFooter?: SharedFooterV3;
  metadata?: {
    migratedFrom?: "v2" | "pwd_legacy" | "standard_legacy";
    migratedAt?: string;
    parseErrors?: string[];
    [key: string]: any;
  };
}

// ============================================================================
// 4. Existing V2 Specifications (For Backward Compatibility)
// ============================================================================

export interface V2TableSpec {
  id: string;
  type: string;
  officeName?: string;
  subTitle?: string;
  workLocation?: string;
  noticeDateBlock?: string;
  lastDateBlock?: string;
  lotteryDateBlock?: string;
  payOrderTo?: string;
  moreInfo?: string;
  bottomWarning?: string;
  headers: string[];
  rows: any[]; // string[][] or Record<string, any>[]
  columnColors?: string[];
  headerBgColor?: string;
  [key: string]: any;
}

export interface NoticeTableDataV2 {
  version: "v2";
  tables: V2TableSpec[];
  [key: string]: any;
}

// ============================================================================
// 5. Legacy Single-Table Specifications (V1 / Legacy)
// ============================================================================

export interface LegacyPWDTable {
  isPwdTemplate: boolean | string;
  officeName?: string;
  noticeDateBlock?: string;
  lastDateBlock?: string;
  lotteryDateBlock?: string;
  payOrderTo?: string;
  moreInfo?: string;
  bottomWarning?: string;
  headerBgColor?: string;
  columnColors?: string[];
  headers?: string[];
  rows?: any[]; // Array of { tenderId, description, ... } or string[][]
  [key: string]: any;
}

export interface LegacyStandardTable {
  headers: string[];
  rows: string[][];
  columnColors?: string[];
  headerBgColor?: string;
  officeName?: string;
  subTitle?: string;
  [key: string]: any;
}

// ============================================================================
// 6. Validation & Conversion Result Types
// ============================================================================

export interface TableValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

