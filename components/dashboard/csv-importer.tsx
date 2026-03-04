"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { z } from "zod";
import { UploadCloud, CheckCircle2, AlertCircle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const MemberRowSchema = z.object({
    full_name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
    role_title: z.string().optional(),
    department: z.string().optional(),
    birth_month: z.coerce.number().int().min(1).max(12),
    birth_day: z.coerce.number().int().min(1).max(31),
});

type MemberRow = z.infer<typeof MemberRowSchema>;

interface ParsedResult {
    valid: MemberRow[];
    invalid: { row: any; errors: string[] }[];
}

export function CsvImporter({ orgId, onSuccess }: { orgId: string; onSuccess?: () => void }) {
    const [parsedData, setParsedData] = useState<ParsedResult | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setError(null);
        const file = acceptedFiles[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const valid: MemberRow[] = [];
                const invalid: { row: any; errors: string[] }[] = [];

                results.data.forEach((row: any, index) => {
                    const parsed = MemberRowSchema.safeParse(row);
                    if (parsed.success) {
                        valid.push(parsed.data);
                    } else {
                        invalid.push({
                            row,
                            errors: parsed.error.issues.map((e: any) => String(`${e.path.join(".")}: ${e.message}`)),
                        });
                    }
                });

                setParsedData({ valid, invalid });
            },
            error: (err) => {
                setError(err.message);
            },
        });
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "text/csv": [".csv"] },
        maxFiles: 1,
    });

    const handleUpload = async () => {
        if (!parsedData || parsedData.valid.length === 0) return;
        setIsUploading(true);
        setError(null);

        try {
            const response = await fetch("/api/org/members/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orgId, members: parsedData.valid }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Failed to import members");
            }

            setParsedData(null);
            if (onSuccess) onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    if (parsedData) {
        return (
            <div className="w-full border rounded-lg p-6 space-y-4 bg-white/5 shadow-sm">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Review Import</h3>
                    <Button variant="ghost" size="icon" onClick={() => setParsedData(null)}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <div className="space-y-4">
                    <div className="flex space-x-4 text-sm">
                        <div className="flex items-center text-green-600 dark:text-green-400">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            {parsedData.valid.length} valid rows
                        </div>
                        {parsedData.invalid.length > 0 && (
                            <div className="flex items-center text-red-600 dark:text-red-400">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                {parsedData.invalid.length} invalid rows
                            </div>
                        )}
                    </div>

                    {parsedData.invalid.length > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-3 rounded-md text-sm max-h-32 overflow-y-auto w-full">
                            <p className="font-medium mb-1">Errors:</p>
                            <ul className="list-disc pl-5 space-y-1">
                                {parsedData.invalid.slice(0, 5).map((inv, i) => (
                                    <li key={i}>{JSON.stringify(inv.row)} - {inv.errors.join(", ")}</li>
                                ))}
                                {parsedData.invalid.length > 5 && (
                                    <li>...and {parsedData.invalid.length - 5} more</li>
                                )}
                            </ul>
                        </div>
                    )}

                    <div className="flex justify-end space-x-2 pt-4 border-t">
                        <Button variant="outline" onClick={() => setParsedData(null)} disabled={isUploading}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpload} disabled={parsedData.valid.length === 0 || isUploading}>
                            {isUploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Import {parsedData.valid.length} Members
                        </Button>
                    </div>
                </div>
                {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            </div>
        );
    }

    return (
        <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50"
                }`}
        >
            <input {...getInputProps()} />
            <UploadCloud className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
            <p className="font-medium text-lg">Drag & drop your CSV here</p>
            <p className="text-sm text-muted-foreground mt-2">
                Must include headers: <code>full_name, email, role_title, department, birth_month, birth_day</code>
            </p>
            {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
        </div>
    );
}
