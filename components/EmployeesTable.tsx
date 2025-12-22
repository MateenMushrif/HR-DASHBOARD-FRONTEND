"use client";

import React from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";
const PAGE_LIMIT = 10;

type Department = { id: number; name: string };
type Employee = {
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
    isIntern?: boolean;
};

export default function EmployeesTable() {
    const [employees, setEmployees] = React.useState<Employee[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string | null>(null);

    const [query, setQuery] = React.useState<string>("");
    const [debouncedQuery, setDebouncedQuery] = React.useState<string>("");

    const [page, setPage] = React.useState<number>(1);
    const [totalPages, setTotalPages] = React.useState<number>(1);

    const [departments, setDepartments] = React.useState<Department[]>([]);
    const [departmentFilter, setDepartmentFilter] = React.useState<string>("");
    const [internFilter, setInternFilter] = React.useState<string>("all");

    // debug info
    const [lastUrl, setLastUrl] = React.useState<string | null>(null);
    const [lastResponse, setLastResponse] = React.useState<any>(null);

    // debounce
    React.useEffect(() => {
        const t = setTimeout(() => setDebouncedQuery(query.trim()), 350);
        return () => clearTimeout(t);
    }, [query]);

    // fetch departments
    React.useEffect(() => {
        let mounted = true;
        async function fetchDepts() {
            try {
                const res = await fetch(`${API_URL}/api/departments`);
                if (!res.ok) return;
                const data = await res.json();
                if (!mounted) return;
                setDepartments(data.departments || []);
            } catch (e) {
                // ignore
            }
        }
        fetchDepts();
        return () => { mounted = false; };
    }, []);

    // reset page when filters/search changes (defensive)
    React.useEffect(() => {
        setPage(1);
    }, [debouncedQuery, departmentFilter, internFilter]);

    React.useEffect(() => {
        let mounted = true;
        async function fetchEmployees() {
            setLoading(true);
            setError(null);

            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setError("Not authenticated");
                    setLoading(false);
                    return;
                }

                const params = new URLSearchParams();
                params.set("limit", String(PAGE_LIMIT));
                params.set("page", String(page));
                if (debouncedQuery) params.set("query", debouncedQuery);
                if (departmentFilter) params.set("departmentId", departmentFilter);
                if (internFilter === "interns") params.set("isIntern", "true");
                if (internFilter === "employees") params.set("isIntern", "false");

                const url = `${API_URL}/api/employees?${params.toString()}`;
                setLastUrl(url);

                const res = await fetch(url, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                // try to parse json, but keep raw text fallback
                const text = await res.text();
                let data: any = null;
                try {
                    data = text ? JSON.parse(text) : {};
                } catch (e) {
                    // not valid json
                    data = text;
                }

                // debug
                setLastResponse({ status: res.status, headers: Object.fromEntries(res.headers.entries()), body: data });
                console.info("[EmployeesTable] fetch url:", url);
                console.info("[EmployeesTable] server responded:", data, "headers:", Object.fromEntries(res.headers.entries()));

                if (!res.ok) {
                    // server might return { message }
                    const message = data?.message || `HTTP ${res.status}`;
                    throw new Error(message);
                }

                // handle shapes:
                // 1) { employees: [...], total: N }
                // 2) { employees: [...], totalPages: M }
                // 3) header X-Total-Count: N
                // 4) fallback: just use returned array and guess totalPages = 1
                const receivedEmployees = Array.isArray(data?.employees) ? data.employees : (Array.isArray(data) ? data : []);
                let computedTotalPages = 1;

                if (typeof data?.totalPages === "number") {
                    computedTotalPages = Math.max(1, data.totalPages);
                } else if (typeof data?.total === "number") {
                    computedTotalPages = Math.max(1, Math.ceil(data.total / PAGE_LIMIT));
                } else if (res.headers.has("x-total-count")) {
                    const total = Number(res.headers.get("x-total-count"));
                    if (!Number.isNaN(total)) computedTotalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));
                } else if (receivedEmployees.length === PAGE_LIMIT) {
                    // maybe there are more pages — optimistic guess
                    computedTotalPages = page + 1;
                } else {
                    computedTotalPages = Math.max(1, Math.ceil(receivedEmployees.length / PAGE_LIMIT));
                }

                if (!mounted) return;
                setEmployees(receivedEmployees);
                setTotalPages(computedTotalPages);
            } catch (err: any) {
                console.error("Error fetching employees:", err);
                if (mounted) setError(err.message || "Something went wrong");
            } finally {
                if (mounted) setLoading(false);
            }
        }

        fetchEmployees();
        return () => { mounted = false; };
    }, [debouncedQuery, page, departmentFilter, internFilter]);

    function normalizeStatus(s: string) {
        if (!s) return s;
        const up = s.toUpperCase();
        if (up === "ACTIVE") return "Active";
        if (up === "ON_LEAVE" || up === "ONLEAVE") return "On Leave";
        if (up === "INACTIVE") return "Inactive";
        return s;
    }

    const renderPagination = () => {
        if (!totalPages || totalPages <= 1) return null;
        const pages: number[] = [];
        const start = Math.max(1, page - 2);
        const end = Math.min(totalPages, page + 2);
        for (let p = start; p <= end; p++) pages.push(p);

        return (
            <div className="mt-4 flex items-center justify-center gap-2">
                <button onClick={() => setPage((v) => Math.max(1, v - 1))} className="px-3 py-1 rounded-md border" disabled={page === 1}>Prev</button>
                {start > 1 && (
                    <>
                        <button onClick={() => setPage(1)} className="px-3 py-1 rounded-md border">1</button>
                        {start > 2 && <span>…</span>}
                    </>
                )}
                {pages.map((p) => (
                    <button key={p} onClick={() => setPage(p)} className={`px-3 py-1 rounded-md border ${p === page ? "bg-primary text-primary-foreground" : ""}`}>{p}</button>
                ))}
                {end < totalPages && (
                    <>
                        {end < totalPages - 1 && <span>…</span>}
                        <button onClick={() => setPage(totalPages)} className="px-3 py-1 rounded-md border">{totalPages}</button>
                    </>
                )}
                <button onClick={() => setPage((v) => Math.min(totalPages, v + 1))} className="px-3 py-1 rounded-md border" disabled={page === totalPages}>Next</button>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex h-48 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
            </div>
        );
    }

    if (error) {
        return <div className="rounded-md bg-destructive/15 px-3 py-2 text-sm text-destructive">Error: {error}</div>;
    }

    return (
        <div className="flow-root">
            <div className="">
                {/* here */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b-4 pt-2 pb-4 mb-2"
                    style={{ borderBottomColor: "var(--accento)" }}
                >
                    <div className="">
                        <h1 className="text-2xl font-semibold">Employees</h1>
                        <p className="text-sm text-muted-foreground">
                            {employees.length} employee
                            {employees.length > 1 ? "s" : ""} in your team.
                        </p>
                    </div>
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search employees..."
                        className="input w-full md:w-72"
                    />
                    <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="input">
                        <option value="">All departments</option>
                        {departments.map((d) => <option key={d.id} value={String(d.id)}>{d.name}</option>)}
                    </select>
                    <select value={internFilter} onChange={(e) => setInternFilter(e.target.value)} className="input">
                        <option value="all">All</option>
                        <option value="interns">Interns</option>
                        <option value="employees">Employees</option>
                    </select>
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

            <div className="inline-block min-w-full align-middle">
                <div className="rounded-lg bg-gray-50 p-2 md:pt-0 h-[66vh] overflow-y-hidden">
                    {/* mobile */}
                    <div className="md:hidden space-y-3">
                        {employees.map(emp => (
                            <div key={emp.id} className="w-full rounded-md bg-white p-4">
                                <div className="flex items-center justify-between border-b pb-3">
                                    <div>
                                        <p className="font-medium">{emp.firstName} {emp.lastName}</p>
                                        <p className="text-sm text-gray-500">{emp.email}</p>
                                        <p className="text-xs text-muted-foreground">{emp.role || "No role"}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs">{normalizeStatus(emp.status)}</span>
                                        <div className="mt-2">
                                            <Link href={`/dashboard/employees/${emp.id}`} className="text-xs inline-flex items-center rounded-full px-3 py-1 font-medium bg-accent text-accent-foreground hover:opacity-90 transition">Edit</Link>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex w-full items-center justify-between pt-3 text-sm text-gray-700">
                                    <div>
                                        <p>{emp.department?.name || "No department"}</p>
                                        <p className="text-xs">{emp.phone || ""}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{emp.salary || "-"}</p>
                                        <p className="text-xs">{emp.dateOfJoining ? new Date(emp.dateOfJoining).toLocaleDateString() : ""}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* desktop */}
                    <table className="hidden min-w-full text-gray-900 md:table">
                        <thead className="rounded-lg text-left text-sm font-normal">
                            <tr>
                                <th className="px-4 py-5 font-medium sm:pl-6">Name</th>
                                <th className="px-3 py-5 font-medium">Email</th>
                                <th className="px-3 py-5 font-medium">Role</th>
                                <th className="px-3 py-5 font-medium">Department</th>
                                <th className="px-3 py-5 font-medium">Salary</th>
                                <th className="px-3 py-5 font-medium">Joined</th>
                                <th className="px-3 py-5 font-medium">Status</th>
                                <th className="relative py-3 pl-6 pr-3"><span className="sr-only">Edit</span></th>
                            </tr>
                        </thead>

                        <tbody className="bg-white">
                            {employees.map(emp => (
                                <tr key={emp.id} className="w-full border-b py-3 text-sm last-of-type:border-none ">
                                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-full bg-muted h-7 w-7 flex items-center justify-center text-xs">
                                                {emp.firstName?.[0] || "?"}
                                            </div>
                                            <p>{emp.firstName} {emp.lastName}</p>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3">{emp.email}</td>
                                    <td className="whitespace-nowrap px-3 py-3">{emp.role || "-"}</td>
                                    <td className="whitespace-nowrap px-3 py-3">{emp.department?.name || "-"}</td>
                                    <td className="whitespace-nowrap px-3 py-3">{emp.salary || "-"}</td>
                                    <td className="whitespace-nowrap px-3 py-3">{emp.dateOfJoining ? new Date(emp.dateOfJoining).toLocaleDateString() : "-"}</td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs bg-muted/20">{normalizeStatus(emp.status)}</span>
                                    </td>
                                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                                        <div className="flex justify-end gap-3">
                                            <Link href={`/dashboard/employees/${emp.id}`} className="text-xs inline-flex items-center rounded-full px-3 py-1 font-medium bg-accent text-accent-foreground hover:opacity-90 transition">Edit</Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {renderPagination()}
        </div>
    );
}
