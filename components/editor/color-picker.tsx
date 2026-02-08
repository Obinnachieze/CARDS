import React from "react";
import { cn } from "@/lib/utils";

export const colors = [
    "#000000", "#ffffff", "#ef4444", "#f97316", "#eab308", "#22c55e",
    "#06b6d4", "#3b82f6", "#6366f1", "#a855f7", "#ec4899", "#f43f5e"
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
