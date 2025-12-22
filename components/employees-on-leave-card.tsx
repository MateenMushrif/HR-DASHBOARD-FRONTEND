"use client";

import * as React from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";

interface Department {
    id: number;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

interface Employee {
    id: number;
    name?: string;
    fullName?: string;
    employeeName?: string;
    firstName?: string;
    lastName?: string;
    department?: string | Department;
    status?: "ACTIVE" | "ON_LEAVE" | "INACTIVE" | string;
    role?: string;
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

export default function EmployeesOnLeaveCard() {
    const [employeesOnLeave, setEmployeesOnLeave] = React.useState<Employee[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        async function fetchEmployees() {
            try {
                setLoading(true);
                setError(null);

                const token = localStorage.getItem("token");
                if (!token) {
                    setError("Not authenticated");
                    return;
                }

                const res = await fetch(`${API_URL}/api/employees`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    const data: unknown = await res.json().catch(() => ({}));
                    if (
                        typeof data === "object" &&
                        data !== null &&
                        "message" in data
                    ) {
                        throw new Error(String((data as { message: unknown }).message));
                    }
                    throw new Error("Failed to load employees");
                }

                const data: { employees?: Employee[] } = await res.json();
                const employees = data.employees ?? [];

                const onLeave = employees.filter(
                    (emp) => emp.status === "ON_LEAVE"
                );

                setEmployeesOnLeave(onLeave);
            } catch (err: unknown) {
                const message =
                    err instanceof Error ? err.message : "Something went wrong";
                console.error("Error fetching employees on leave:", err);
                setError(message);
            } finally {
                setLoading(false);
            }
        }

        fetchEmployees();
    }, []);

    if (loading) {
        return (
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
                <span>Loading employees on leave...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-2 rounded-md bg-destructive/5 px-3 py-2 text-xs text-destructive">
                Failed to load: {error}
            </div>
        );
    }

    if (employeesOnLeave.length === 0) {
        return (
            <div className="mt-2 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                No employees are currently on leave.
            </div>
        );
    }

    return (
        <div className="mt-2 flex max-h-[260px] flex-col gap-2 overflow-y-auto pr-1 text-xs text-muted-foreground scrollbar-hide">
            <div className="mb-1 text-[11px] text-muted-foreground">
                {employeesOnLeave.length}{" "}
                {employeesOnLeave.length === 1 ? "employee" : "employees"} on leave
                today
            </div>

            {employeesOnLeave.map((emp) => {
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
