export interface ParsedCsvRow {
  [column: string]: string;
}

export interface ParsedCsvPreview {
  fileName: string;
  headers: string[];
  rows: ParsedCsvRow[];
  records: ParsedCsvRow[];
  totalRows: number;
}
