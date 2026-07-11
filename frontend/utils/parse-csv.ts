import type { ParsedCsvPreview, ParsedCsvRow } from "../types/csv-import";

function stripBom(value: string) {
  return value.replace(/^\uFEFF/, "");
}

function uniqueHeaders(headers: string[]) {
  const counts = new Map<string, number>();

  return headers.map((header, index) => {
    const base = header.trim() || `column_${index + 1}`;
    const currentCount = counts.get(base) ?? 0;
    counts.set(base, currentCount + 1);

    if (currentCount === 0) {
      return base;
    }

    return `${base}_${currentCount + 1}`;
  });
}

function parseCsvText(text: string) {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  const normalized = stripBom(text).replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let index = 0; index < normalized.length; index += 1) {
    const character = normalized[index];
    const nextCharacter = normalized[index + 1];

    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        currentCell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === "," && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = "";
      continue;
    }

    if (character === "\n" && !inQuotes) {
      currentRow.push(currentCell.trim());
      if (currentRow.some((cell) => cell.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = "";
      continue;
    }

    currentCell += character;
  }

  currentRow.push(currentCell.trim());
  if (currentRow.some((cell) => cell.length > 0)) {
    rows.push(currentRow);
  }

  return rows;
}

export function parseCsvPreview(fileName: string, csvText: string, previewRowLimit = 25): ParsedCsvPreview {
  const rows = parseCsvText(csvText);

  if (rows.length === 0) {
    return {
      fileName,
      headers: [],
      rows: [],
      records: [],
      totalRows: 0,
    };
  }

  const headers = uniqueHeaders(rows[0] ?? []);
  const dataRows = rows.slice(1);
  const allRecords: ParsedCsvRow[] = dataRows.map((row) => {
    const record: ParsedCsvRow = {};

    headers.forEach((header, index) => {
      record[header] = row[index] ?? "";
    });

    if (row.length > headers.length) {
      row.slice(headers.length).forEach((value, extraIndex) => {
        record[`extra_${extraIndex + 1}`] = value;
      });
    }

    return record;
  });

  const previewRows = allRecords.slice(0, previewRowLimit);

  return {
    fileName,
    headers,
    rows: previewRows,
    records: allRecords,
    totalRows: dataRows.length,
  };
}
