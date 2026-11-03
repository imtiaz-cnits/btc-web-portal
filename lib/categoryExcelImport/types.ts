/**
 * BTC Web Portal - Category-Based Excel Notice Entry System
 * Type definitions for Category-Specific Excel Import, Parsing, and Notice Form Integration.
 */

export type NoticeCategory = "OTM" | "LTM" | "LOTTERY_PENDING" | "LOTTERY_RESULT";
export type SupportedCategoryImport = "OTM" | "LTM";

export interface NoticeDetailsData {
  title: string;
  subTitle: string;
  category: NoticeCategory;
  year: string;
  publishDate: string;
  lastDate: string;
  lotteryDate: string;
}

export interface TenderDataSection {
  headers: string[];
  rows: string[][];
  totalRows: number;
}

export interface FooterDetailsData {
  payOrderTo: string;
  moreInfo: string;
}

export interface ValidationErrorItem {
  section: "notice" | "tender" | "footer" | "workbook";
  row?: number;
  column?: string;
  field?: string;
  message: string;
}

export interface CategoryImportValidationResult {
  isValid: boolean;
  errors: ValidationErrorItem[];
  warnings: string[];
}

export interface CategoryNoticeImportData {
  noticeDetails: NoticeDetailsData;
  tenderData: TenderDataSection;
  footerDetails: FooterDetailsData;
  validation: CategoryImportValidationResult;
  rawSheetNames: string[];
  category: NoticeCategory;
}

export interface NoticeFormStateUpdate {
  title: string;
  subTitle: string;
  category: NoticeCategory;
  year: string;
  publishDate: string;
  lastDate: string;
  lotteryDate: string;
  tablesList: any[];
}

