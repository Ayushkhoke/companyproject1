"use client";

import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { PreviewTable } from "./preview-table";
import { parseCsvPreview } from "../../utils/parse-csv";
import type { ParsedCsvPreview } from "../../types/csv-import";
import { normalizeImport, prepareImport } from "../../services/import-api";
import type { NormalizedImportResponse, PreparedImportResponse } from "@groweasy/shared";

export function CsvImporter() {
  const [preview, setPreview] = useState<ParsedCsvPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preparedImport, setPreparedImport] = useState<PreparedImportResponse | null>(null);
  const [normalizedImport, setNormalizedImport] = useState<NormalizedImportResponse | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) {
      return;
    }

    setIsParsing(true);
    setError(null);

    try {
      const csvText = await file.text();
      const parsed = parseCsvPreview(file.name, csvText);
      setPreview(parsed);
      setPreparedImport(null);
      setNormalizedImport(null);
      setProgress(0);
    } catch (parseError) {
      setPreview(null);
      setError(parseError instanceof Error ? parseError.message : "Unable to parse CSV file.");
    } finally {
      setIsParsing(false);
    }
  }, []);

  const handleConfirmImport = useCallback(async () => {
    if (!preview) {
      return;
    }

    setIsImporting(true);
    setError(null);
    setProgress(10);

    try {
      const prepared = await prepareImport({
        fileName: preview.fileName,
        batchSize: 25,
        records: preview.records,
      });

      setPreparedImport(prepared);
      setProgress(55);

      const normalized = await normalizeImport({
        fileName: prepared.fileName ?? preview.fileName,
        batchSize: prepared.batchSize,
        batches: prepared.batches,
      });

      setNormalizedImport(normalized);
      setProgress(100);
    } catch (importError) {
      setNormalizedImport(null);
      setPreparedImport(null);
      setError(importError instanceof Error ? importError.message : "Import failed.");
      setProgress(0);
    } finally {
      setIsImporting(false);
    }
  }, [preview]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: { "text/csv": [".csv"] },
    multiple: false,
    noClick: true,
    noKeyboard: true,
    onDrop,
  });

  const summaryCards = useMemo(() => {
    if (!preview) {
      return [];
    }

    if (normalizedImport) {
      return [
        { label: "Imported records", value: normalizedImport.records.length.toString() },
        { label: "Skipped records", value: normalizedImport.skippedRecordCount.toString() },
        { label: "Batches processed", value: normalizedImport.batchCount.toString() },
      ];
    }

    return [
      { label: "Rows detected", value: preview.totalRows.toString() },
      { label: "Columns detected", value: preview.headers.length.toString() },
      { label: "Preview rows", value: preview.rows.length.toString() },
    ];
  }, [normalizedImport, preview]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Step 1", value: "Upload CSV" },
          { label: "Step 2", value: "Preview rows" },
          { label: "Step 3", value: "Confirm import" },
        ].map((step) => (
          <div key={step.label} className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4 shadow-glow backdrop-blur">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">{step.label}</p>
            <p className="mt-2 text-sm font-medium text-slate-100">{step.value}</p>
          </div>
        ))}
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-glow backdrop-blur">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-400">GrowEasy CSV Importer</p>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
              Upload messy exports and preview the shape before AI mapping.
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Drop a CSV from any CRM, spreadsheet, or marketing tool. We parse it locally first so the user can inspect the raw structure before we normalize records on the backend.
            </p>
          </div>

          <div
            {...getRootProps()}
            className={`rounded-3xl border border-dashed px-6 py-10 transition ${
              isDragActive
                ? "border-cyan-400 bg-cyan-400/10"
                : "border-slate-700 bg-slate-900/60"
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                <span className="text-xl font-semibold">CSV</span>
              </div>
              <div className="space-y-1">
                <p className="text-base font-medium text-slate-100">
                  {isDragActive ? "Drop the file here" : "Drag and drop a CSV file"}
                </p>
                <p className="text-sm text-slate-400">
                  Preview happens locally first, then the confirmed import is normalized on the backend.
                </p>
              </div>
              <button
                type="button"
                onClick={open}
                className="inline-flex items-center rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Choose file
              </button>
              <p className="text-xs text-slate-500">Accepted format: .csv</p>
            </div>
          </div>

          {preview ? (
            <div className="flex flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-900/60 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-100">Ready to confirm import</p>
                <p className="text-sm text-slate-400">
                  The backend will batch {preview.records.length} parsed rows and send them to Gemini for normalization.
                </p>
              </div>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={isImporting || isParsing}
                className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isImporting ? "Processing import" : "Confirm import"}
              </button>
            </div>
          ) : null}

          {isParsing ? (
            <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-4 text-sm text-cyan-100">
              Parsing CSV preview locally...
            </div>
          ) : null}

          {isImporting ? (
            <div className="space-y-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-4 text-sm text-emerald-100">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-emerald-200/80">
                <span>AI processing</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-emerald-950/60">
                <div
                  className="h-full rounded-full bg-emerald-300 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p>Preparing batches and normalizing records with Gemini...</p>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-4 text-sm text-rose-100">
              <p className="font-medium">Import failed</p>
              <p className="mt-1 leading-6">{error}</p>
            </div>
          ) : null}
        </div>

        <aside className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {summaryCards.length > 0 ? (
              summaryCards.map((card) => (
                <div key={card.label} className="rounded-3xl border border-slate-800 bg-slate-950/80 px-5 py-5 shadow-glow backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{card.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-50">{card.value}</p>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-slate-800 bg-slate-950/80 px-5 py-6 text-sm text-slate-400 shadow-glow backdrop-blur sm:col-span-3 lg:col-span-1">
                Upload a CSV to see import statistics, detected columns, and a preview of the first records.
              </div>
            )}
          </div>

          {preview ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 px-5 py-5 shadow-glow backdrop-blur">
              <p className="text-sm font-medium text-slate-200">File</p>
              <p className="mt-1 text-lg font-semibold text-slate-50">{preview.fileName}</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                We detected {preview.headers.length} columns and {preview.totalRows} data rows. The backend AI pass will use this raw shape to infer GrowEasy CRM fields.
              </p>
            </div>
          ) : null}

          {preparedImport ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 px-5 py-5 shadow-glow backdrop-blur">
              <p className="text-sm font-medium text-slate-200">Batching summary</p>
              <div className="mt-4 grid gap-3 text-sm text-slate-300">
                <p>Received rows: {preparedImport.receivedRecords}</p>
                <p>Retained rows: {preparedImport.retainedRecords}</p>
                <p>Skipped empty rows: {preparedImport.skippedEmptyRecords}</p>
                <p>Batch count: {preparedImport.batchCount}</p>
              </div>
            </div>
          ) : null}

          {normalizedImport ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 px-5 py-5 shadow-glow backdrop-blur">
              <p className="text-sm font-medium text-slate-200">Import complete</p>
              <div className="mt-4 grid gap-3 text-sm text-slate-300">
                <p>Imported records: {normalizedImport.records.length}</p>
                <p>Skipped records: {normalizedImport.skippedRecordCount}</p>
                <p>Batches processed: {normalizedImport.batchCount}</p>
              </div>
            </div>
          ) : null}
        </aside>
      </section>

      {preview ? <PreviewTable headers={preview.headers} rows={preview.rows} /> : null}
    </div>
  );
}
