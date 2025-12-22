"use client";
import React from "react";

export default function Pagination({
    totalPages,
    currentPage,
    onChange
}: {
    totalPages: number;
    currentPage: number;
    onChange: (p: number) => void;
}) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center gap-2">
            <button onClick={() => onChange(Math.max(1, currentPage - 1))} className="btn-sm">Prev</button>
            <span className="px-2">{currentPage} / {totalPages}</span>
            <button onClick={() => onChange(Math.min(totalPages, currentPage + 1))} className="btn-sm">Next</button>
        </div>
    );
}
