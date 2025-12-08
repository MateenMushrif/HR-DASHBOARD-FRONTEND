"use client";

import React from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";

interface Department {
    id: number;
    name: string;
}

export default function NewEmployeePage() {
    const router = useRouter();

    const [departments, setDepartments] = React.useState<Department[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const [firstName, setFirstName] = React.useState("");
    const [lastName, setLastName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [phone, setPhone] = React.useState("");
    const [role, setRole] = React.useState("");
    const [departmentId, setDepartmentId] = React.useState<string>("");
    const [status, setStatus] = React.useState("ACTIVE");
    const [dateOfJoining, setDateOfJoining] = React.useState("");
    const [salary, setSalary] = React.useState("");
    const [isIntern, setIsIntern] = React.useState(false); // 👈 NEW

    React.useEffect(() => {
        async function loadDepartments() {
            try {
                setError(null);
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("Not authenticated");
                    setLoading(false);
                    return;
                }

                const res = await fetch(`${API_URL}/api/departments`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.message || "Failed to load departments");
                }

                const data = await res.json();
                setDepartments(data.departments || []);
            } catch (err: any) {
                console.error("Error loading departments:", err);
                setError(err.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        }

        loadDepartments();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!firstName || !lastName || !email) {
            setError("First name, last name and email are required");
            return;
        }

        try {
            setSaving(true);
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Not authenticated");
                setSaving(false);
                return;
            }

            const body = {
                firstName,
                lastName,
                email,
                phone: phone || null,
                role: role || null,
                departmentId: departmentId ? Number(departmentId) : null,
                status,
                dateOfJoining: dateOfJoining || null,
                salary: salary ? Number(salary) : null,
                isIntern, // 👈 NEW
            };

            const res = await fetch(`${API_URL}/api/employees`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data.message || "Failed to create employee");
            }

            router.push("/dashboard/employees");
        } catch (err: any) {
            console.error("Error creating employee:", err);
            setError(err.message || "Something went wrong");
        } finally {
            setSaving(false);
        }
    }

    // LOADING STATE
    if (loading) {
        return (
            <div className="flex h-full min-h-[240px] items-center justify-center p-4 lg:p-6">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
            </div>
        );
    }


    // HARD ERROR + NO DEPARTMENTS
    if (error && departments.length === 0) {
        return (
            <div className="p-4 lg:p-6">
                <div className="glass-card">
                    <div className="inner-card space-y-3">
                        <h1 className="text-base font-semibold tracking-tight">
                            Add Employee
                        </h1>
                        <div className="rounded-md bg-destructive/15 px-3 py-2 text-sm text-destructive">
                            Error: {error}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-6">
            {/* Form card */}
            <div className="glass-card max-w-xl mx-auto p-1">
                <div className="inner-card">

                    {error && (
                        <div className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5 py-2"
                    >
                        {/* Basic info */}
                        <section className="space-y-3">
                            <div>
                                <h2 className="text-sm font-semibold tracking-tight">
                                    Basic information
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Name and contact details used across the system.
                                </p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-medium text-muted-foreground">
                                        First name <span className="text-destructive">*</span>
                                    </label>
                                    <input
                                        className="glass-input glass-input"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-medium text-muted-foreground">
                                        Last name <span className="text-destructive">*</span>
                                    </label>
                                    <input
                                        className="glass-input"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-medium text-muted-foreground">
                                    Email <span className="text-destructive">*</span>
                                </label>
                                <input
                                    type="email"
                                    className="glass-input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-medium text-muted-foreground">
                                        Phone
                                    </label>
                                    <input
                                        className="glass-input"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-medium text-muted-foreground">
                                        Role
                                    </label>
                                    <input
                                        className="glass-input"
                                        placeholder="e.g. Frontend Developer"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                    />
                                </div>
                            </div>
                        </section>

                        <hr className="border-border/60" />

                        {/* Job details */}
                        <section className="space-y-3">
                            <div>
                                <h2 className="text-sm font-semibold tracking-tight">
                                    Job details
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    Department, status and compensation.
                                </p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-medium text-muted-foreground">
                                        Department
                                    </label>
                                    <select
                                        className="glass-input"
                                        value={departmentId}
                                        onChange={(e) => setDepartmentId(e.target.value)}
                                    >
                                        <option value="">No department</option>
                                        {departments.map((dept) => (
                                            <option key={dept.id} value={dept.id}>
                                                {dept.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-medium text-muted-foreground">
                                        Status
                                    </label>
                                    <select
                                        className="glass-input"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="INACTIVE">INACTIVE</option>
                                        <option value="ON_LEAVE">ON_LEAVE</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    id="isIntern"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border border-border bg-transparent
                                        checked:bg-primary checked:hover:bg-primary
                                        appearance-none 
                                        checked:appearance-auto"
                                    checked={isIntern}
                                    onChange={(e) => setIsIntern(e.target.checked)}
                                />

                                <label
                                    htmlFor="isIntern"
                                    className="text-xs font-medium text-muted-foreground"
                                >
                                    Mark as intern
                                </label>
                            </div>


                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-medium text-muted-foreground">
                                        Date of joining
                                    </label>
                                    <input
                                        type="date"
                                        className="glass-input"
                                        value={dateOfJoining}
                                        onChange={(e) => setDateOfJoining(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-medium text-muted-foreground">
                                        Salary
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        className="glass-input"
                                        value={salary}
                                        onChange={(e) => setSalary(e.target.value)}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center rounded-full px-5 py-2 text-sm font-medium
                  bg-primary text-primary-foreground shadow-sm
                  hover:opacity-90 transition disabled:opacity-60"
                            >
                                {saving ? "Saving..." : "Save employee"}
                            </button>

                            <button
                                type="button"
                                onClick={() => router.push("/dashboard/employees")}
                                className="inline-flex items-center rounded-full px-4 py-2 text-xs font-medium 
                  border border-border/70 bg-secondary/60 text-secondary-foreground
                  hover:bg-secondary/90 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
