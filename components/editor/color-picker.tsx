import React from "react";
import { cn } from "@/lib/utils";

export const colors = [
    // Neutrals
    "#000000", "#374151", "#6b7280", "#9ca3af", "#d1d5db", "#f3f4f6", "#ffffff",
    // Reds
    "#fecaca", "#f87171", "#ef4444", "#dc2626", "#991b1b",
    // Oranges
    "#fed7aa", "#fb923c", "#f97316", "#ea580c", "#9a3412",
    // Yellows
    "#fef08a", "#facc15", "#eab308", "#ca8a04", "#854d0e",
    // Greens
    "#bbf7d0", "#4ade80", "#22c55e", "#16a34a", "#166534",
    // Teals & Cyans
    "#a5f3fc", "#22d3ee", "#06b6d4", "#0891b2", "#155e75",
    // Blues
    "#bfdbfe", "#60a5fa", "#3b82f6", "#2563eb", "#1e3a8a",
    // Purples
    "#e9d5ff", "#a78bfa", "#8b5cf6", "#7c3aed", "#5b21b6",
    // Pinks
    "#fbcfe8", "#f472b6", "#ec4899", "#db2777", "#9d174d",
    // Rose
    "#fecdd3", "#fb7185", "#f43f5e", "#e11d48", "#9f1239",
];

interface ColorPickerProps {
    color: string;
    onChange: (c: string) => void;
    className?: string;
}

export const ColorPicker = ({ color, onChange, className }: ColorPickerProps) => (
    <div className={cn("flex flex-wrap gap-2", className)}>
        {colors.map((c) => (
            <button
                key={c}
                className={cn(
                    "w-6 h-6 rounded-full border border-gray-200 transition-transform hover:scale-110",
                    color === c && "ring-2 ring-offset-1 ring-purple-600"
                )}
                style={{ backgroundColor: c }}
                onClick={() => onChange(c)}
                title={c}
            />
        ))}
        <div className="relative w-6 h-6 rounded-full overflow-hidden border border-gray-200 bg-gradient-to-br from-red-500 via-green-500 to-blue-500">
            <input
                type="color"
                value={color}
                onChange={(e) => onChange(e.target.value)}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
            />
        </div>
    </div>
);
