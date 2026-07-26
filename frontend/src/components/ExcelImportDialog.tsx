"use client";

import React, { useRef, useState } from "react";
import { Upload, Download, FileSpreadsheet } from "lucide-react";
import type { AxiosResponse } from "axios";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import type { ApiResponse, ImportResult } from "@/types";
import type { ImportMode } from "@/lib/api";

interface ExcelImportDialogProps {
  entityLabel: string;
  onImport: (file: File, mode: ImportMode) => Promise<AxiosResponse<ApiResponse<ImportResult>>>;
  onDownloadTemplate: () => Promise<AxiosResponse<Blob>>;
  templateFilename: string;
  onComplete?: () => void;
}

export function ExcelImportDialog({
  entityLabel,
  onImport,
  onDownloadTemplate,
  templateFilename,
  onComplete,
}: ExcelImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<ImportMode>("UPSERT");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFile(null);
    setResult(null);
    setMode("UPSERT");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) reset();
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await onDownloadTemplate();
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = templateFilename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Error", description: "Failed to download template.", variant: "destructive" });
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await onImport(file, mode);
      const importResult = res.data.data;
      setResult(importResult);
      toast({
        title: "Import complete",
        description: `${importResult.created} created, ${importResult.updated} updated, ${importResult.skipped} skipped.`,
      });
      onComplete?.();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to import file.";
      toast({ title: "Import Failed", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-1" /> Import Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import {entityLabel} from Excel</DialogTitle>
          <DialogDescription>
            Upload a .xlsx file matching the expected columns. Rows are merged into existing
            records or appended as new ones.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 text-sm font-bold text-ink hover:underline"
          >
            <Download className="h-4 w-4" /> Download {entityLabel.toLowerCase()} template
          </button>

          <div className="space-y-1.5">
            <Label htmlFor="excel-file">Excel file (.xlsx)</Label>
            <input
              id="excel-file"
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-ash file:mr-3 file:py-1.5 file:px-3 file:rounded-pill file:border-0 file:text-sm file:font-bold file:bg-ink file:text-white hover:file:bg-ink/90"
            />
            {file && (
              <p className="flex items-center gap-1.5 text-xs text-ash">
                <FileSpreadsheet className="h-3.5 w-3.5" /> {file.name}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>When a row matches an existing record</Label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
                <input
                  type="radio"
                  name="import-mode"
                  checked={mode === "UPSERT"}
                  onChange={() => setMode("UPSERT")}
                  className="accent-clay"
                />
                Update existing, append new rows
              </label>
              <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
                <input
                  type="radio"
                  name="import-mode"
                  checked={mode === "SKIP_DUPLICATES"}
                  onChange={() => setMode("SKIP_DUPLICATES")}
                  className="accent-clay"
                />
                Skip duplicates, only append new rows
              </label>
            </div>
          </div>

          {result && (
            <div className="border border-pebble p-3 space-y-2">
              <p className="text-sm font-bold text-ink">
                {result.created} created &middot; {result.updated} updated &middot; {result.skipped} skipped
              </p>
              {result.errors.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {result.errors.map((e, i) => (
                    <p key={i} className="text-xs text-red-600">
                      Row {e.row}: {e.message}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Close
          </Button>
          <Button type="button" onClick={handleImport} disabled={!file || submitting}>
            {submitting ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
