"use client";
import React from "react";

export default function Search({
    value,
    onChange,
    placeholder = "Search..."
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}) {
    return (
        <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="input w-full max-w-sm"
        />
    );
}
