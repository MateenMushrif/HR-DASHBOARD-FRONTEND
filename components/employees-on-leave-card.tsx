"use client";

import * as React from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";

interface Employee {
    id: number
    status?: string
    role?: string
    name?: string
    fullName?: string
    employeeName?: string
    firstName?: string
    lastName?: string
    department?: string | { id: number; name: string }
}

function getDisplayName(emp: Employee): string {
    return (
        emp.name ||
        emp.fullName ||
        emp.employeeName ||
        `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim() ||
        "Unnamed Employee"
    );
}

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

interface Props {
    employees: {
        id: number
        status?: string
        department?: string | { id: number; name: string }
        role?: string
        name?: string
        fullName?: string
        employeeName?: string
        firstName?: string
        lastName?: string
    }[]
    loading: boolean
}

export default function EmployeesOnLeaveCard({
    employees,
    loading,
}: Props) {

    if (loading) {
        return (
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
                <span>Loading employees on leave...</span>
            </div>
        );
    }

    if (employees.length === 0) {
        return (
            <div className="mt-2 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                No employees are currently on leave.
            </div>
        );
    }

    return (
        <div className="mt-2 flex max-h-[260px] flex-col gap-2 overflow-y-auto pr-1 text-xs text-muted-foreground scrollbar-hide">
            <div className="mb-1 text-[11px] text-muted-foreground">
                {employees.length}{" "}
                {employees.length === 1 ? "employee" : "employees"} on leave
                today
            </div>

            {employees.map((emp) => {
                const deptLabel =
                    typeof emp.department === "string"
                        ? emp.department
                        : emp.department?.name;

                const name = getDisplayName(emp);
                const initials = getInitials(name);

                return (
                    <div
                        key={emp.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 transition-colors hover:bg-muted"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-[11px] font-semibold text-primary">
                                {initials}
                            </div>

                            <div className="flex flex-col">
                                <span className="text-[13px] font-medium text-foreground">
                                    {name}
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                    {deptLabel || "No department"}
                                    {emp.role ? ` • ${emp.role}` : ""}
                                </span>
                            </div>
                        </div>

                        <span className="badge-status status-onleave shrink-0 text-[10px]">
                            On leave
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
