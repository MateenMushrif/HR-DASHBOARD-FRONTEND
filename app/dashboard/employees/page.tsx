"use client";

import React from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";

interface Department {
    id: number;
    name: string;
}

interface Employee {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    role?: string | null;
    status: string;
    dateOfJoining?: string | null;
    salary?: string | null;
    department?: Department | null;
    isIntern?: boolean; // 👈 add this
}

const statusStyles: Record<string, string> = {
    Active: "bg-emerald-500/15 text-emerald-300",
    Inactive: "bg-red-500/15 text-red-300",
    Pending: "bg-amber-500/15 text-amber-300",
};

export default function EmployeesPage() {
    const [employees, setEmployees] = React.useState<Employee[]>([]);
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
                    setLoading(false);
                    return;
                }

                const res = await fetch(`${API_URL}/api/employees`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.message || "Failed to load employees");
                }

                const data = await res.json();
                setEmployees(data.employees || []);
            } catch (err: any) {
                console.error("Error fetching employees:", err);
                setError(err.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        }

        fetchEmployees();
    }, []);

    // LOADING STATE
    if (loading) {
        return (
            <div className="flex h-full min-h-[240px] items-center justify-center p-4 lg:p-6">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
            </div>
        );
    }


    // ERROR STATE
    if (error) {
        return (
            <div className="p-4 lg:p-6 space-y-4">
                <div className="glass-card">
                    <div className="inner-card space-y-2">
                        <h1 className="text-base font-semibold tracking-tight">
                            Employees
                        </h1>
                        <div className="rounded-md bg-destructive/15 px-3 py-2 text-sm text-destructive">
                            Error: {error}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // EMPTY STATE
    if (employees.length === 0) {
        return (
            <div className="p-4 lg:p-6 space-y-4">
                {/* Header */}
                <div className="glass-card">
                    <div className="inner-card flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight">
                                Employees
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Manage your team members and their details.
                            </p>
                        </div>
                        <Link
                            href="/dashboard/employees/new"
                            className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium 
                                bg-primary text-primary-foreground shadow-sm
                                hover:opacity-90 transition"
                        >
                            <span>＋</span>
                            <span>Add Employee</span>
                        </Link>
                    </div>
                </div>

                {/* Empty message */}
                <div className="glass-card">
                    <div className="inner-card flex flex-col items-center justify-center gap-2 py-10 text-center text-sm text-muted-foreground">
                        <p>No employees found.</p>
                        <p className="text-xs">
                            Start by adding your first team member using the button above.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // MAIN LIST
    return (
        <div className="px-4 lg:p-6 space-y-4">
            {/* Header bar */}
            <div className="glass-card">
                <div className="inner-card flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">Employees</h1>
                        <p className="text-sm text-muted-foreground">
                            {employees.length} employee
                            {employees.length > 1 ? "s" : ""} in your team.
                        </p>
                    </div>
                    <Link
                        href="/dashboard/employees/new"
                        className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium 
                            bg-primary text-primary-foreground shadow-sm
                            hover:opacity-90 transition"
                    >
                        <span>＋</span>
                        <span>Add Employee</span>
                    </Link>
                </div>
            </div>

            {/* 🔥 SCROLLABLE GRID WRAPPER */}
            <div className="max-h-[69vh] overflow-y-auto pr-1 scrollbar-hide">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {employees.map((emp) => {
                        const statusClass =
                            statusStyles[emp.status] || "bg-muted/40 text-muted-foreground";

                        return (
                            <div key={emp.id} className="glass-card">
                                <div className="inner-card-clean p-4 flex h-full flex-col gap-3">
                                    {/* Top: name + status */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-1">
                                            <h2 className="text-sm font-semibold leading-tight">
                                                {emp.firstName} {emp.lastName}
                                            </h2>

                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-xs text-muted-foreground">
                                                    {emp.role || "No role assigned"}
                                                </p>

                                                {/* Intern / Employee badge */}
                                                <span
                                                    className={`badge-chip ${emp.isIntern ? "badge-intern" : "badge-employee"
                                                        }`}
                                                >
                                                    {emp.isIntern ? "Intern" : "Employee"}
                                                </span>

                                            </div>
                                        </div>

                                        <span
                                            className={`badge-status ${emp.status === "ACTIVE"
                                                ? "status-active"
                                                : emp.status === "ON_LEAVE"
                                                    ? "status-onleave"
                                                    : "status-inactive"
                                                }`}
                                        >
                                            {emp.status}
                                        </span>

                                    </div>

                                    {/* Middle: details */}
                                    <div className="space-y-1.5 text-xs text-muted-foreground">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-medium text-foreground/80">
                                                Email
                                            </span>
                                            <span className="truncate text-right">{emp.email}</span>
                                        </div>

                                        {emp.department && (
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-medium text-foreground/80">
                                                    Department
                                                </span>
                                                <span className="truncate text-right">
                                                    {emp.department.name}
                                                </span>
                                            </div>
                                        )}

                                        {emp.phone && (
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-medium text-foreground/80">
                                                    Phone
                                                </span>
                                                <span className="truncate text-right">
                                                    {emp.phone}
                                                </span>
                                            </div>
                                        )}

                                        {emp.dateOfJoining && (
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-medium text-foreground/80">
                                                    Joined
                                                </span>
                                                <span className="truncate text-right">
                                                    {new Date(emp.dateOfJoining).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer: salary + edit */}
                                    <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                                        {emp.salary && (
                                            <div className="rounded-full bg-muted/40 px-3 py-1 text-[11px] text-muted-foreground">
                                                Salary: {emp.salary}
                                            </div>
                                        )}

                                        <div className="ml-auto">
                                            <Link
                                                href={`/dashboard/employees/${emp.id}`}
                                                className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium 
                                                    bg-accent text-accent-foreground
                                                    hover:opacity-90 transition"
                                            >
                                                Edit details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
