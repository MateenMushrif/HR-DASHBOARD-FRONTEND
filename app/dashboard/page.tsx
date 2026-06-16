"use client";

import React from "react";
import StackedAreaChart, { HirePoint } from "@/components/area-rechart";
import ChartPieDonutText from "@/components/chart-pie-donut-text";
import EmployeesByDepartmentChart from "@/components/employees-by-department-chart";
import EmployeesOnLeaveCard from "@/components/employees-on-leave-card";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";

type StatCardProps = {
    label: string;
    value: string | number;
    sublabel: string;
    accent?: boolean;
};

// Reusable stat card with accent bottom border
function StatCard({ label, value, sublabel, accent }: StatCardProps) {
    return (
        <div
            className="glass-card flex flex-col justify-between p-5 md:p-6 border-b-[6px]"
            style={{ borderBottomColor: "var(--sidebar-primary)" }}
        >
            <p className="text-[18px] font-semibold text-foreground tracking-wide">
                {label}
            </p>

            <p
                className={`mt-3 text-3xl font-semibold leading-tight md:text-4xl ${accent ? "text-red-500" : "text-foreground"
                    }`}
            >
                {value}
            </p>

            <p className="mt-2 text-[11px] text-muted-foreground">{sublabel}</p>
        </div>
    );
}

export default function Page() {

    const [dashboardData, setDashboardData] = React.useState<{
        totalEmployees: number;
        internsCount: number;
        onLeaveCount: number;
        onLeaveEmployees: {
            id: number;
            firstName: string;
            lastName: string;
            role: string | null;
            department: string | null;
        }[];
        departmentCounts: {
            department: string;
            count: number;
        }[];
        hiresLast6Months: HirePoint[];
    } | null>(null);

    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        async function loadDashboard() {
            try {
                setLoading(true);
                setError(null);

                const token = localStorage.getItem("token");
                if (!token) {
                    setError("Not authenticated");
                    return;
                }

                const res = await fetch(`${API_URL}/api/dashboard`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    throw new Error(data.message || "Failed to load dashboard");
                }

                setDashboardData(data);
                console.log("DASHBOARD RESPONSE:", data);
            } catch (err: unknown) {
                const message =
                    err instanceof Error ? err.message : "Something went wrong";
                setError(message);
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, []);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
            </div>
        );
    }

    if (error || !dashboardData) {
        return (
            <div className="flex h-full items-center justify-center text-destructive">
                {error ?? "Failed to load dashboard"}
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col px-12 py-4">
            {/* Heading with accent underline */}
            <div
                className="w-full border-b-4 pt-2 pb-4"
                style={{ borderColor: "var(--sidebar-primary)" }}
            >
                <h1 className="text-2xl font-semibold ">Analytics Dashboard</h1>
            </div>

            {/* Scrollable content area */}
            <div className="pt-4 flex-1 overflow-y-auto pb-4 py-2 pr-2 scrollbar-hide ">

                <section className="grid min-w-0 auto-rows-[minmax(150px,auto)] gap-4 lg:grid-cols-4">

                    {/* Card 1 */}
                    <StatCard
                        label="Total Employees"
                        value={dashboardData.totalEmployees}
                        sublabel="+6 compared to last month"
                    />

                    {/* Card 2 */}
                    <StatCard
                        label="Active Today"
                        value={dashboardData.totalEmployees - dashboardData.onLeaveCount}
                        sublabel="75% of total workforce"
                    />

                    {/* Card 3 – donut tall */}
                    <div
                        className="glass-card flex flex-col p-4 lg:row-span-2 border-b-[6px]"
                        style={{ borderBottomColor: "var(--sidebar-primary)" }}
                    >
                        <p className="mb-1 text-xs font-medium text-muted-foreground">
                            Workforce breakdown
                        </p>
                        <p className="text-xl font-semibold">Employees vs interns</p>
                        <div className="mt-3 -mx-2 flex flex-1 items-center justify-center">
                            <ChartPieDonutText
                                employeesCount={
                                    dashboardData.totalEmployees - dashboardData.internsCount
                                }
                                internsCount={dashboardData.internsCount}
                            />
                        </div>
                    </div>

                    {/* Card 4 – donut tall */}
                    <div
                        className="glass-card flex flex-col p-4 lg:row-span-2 border-b-[6px]"
                        style={{ borderBottomColor: "var(--sidebar-primary)" }}
                    >
                        <p className="mb-1 text-xs font-medium text-muted-foreground">
                            Presence status
                        </p>
                        <p className="text-xl font-semibold">Present vs leave</p>
                        <div className="mt-3 -mx-2 flex flex-1 items-center justify-center">
                            <ChartPieDonutText
                                employeesCount={dashboardData.totalEmployees - dashboardData.internsCount}
                                internsCount={dashboardData.internsCount}
                            />
                        </div>
                    </div>

                    {/* Card 5 */}
                    <StatCard
                        label="New hires (30 days)"
                        value={9}
                        sublabel="3 interns • 6 employees"
                    />

                    {/* Card 6 */}
                    <StatCard
                        label="Pending requests"
                        value={12}
                        sublabel="Approvals needed today"
                        accent
                    />

                    {/* Card 7 – hiring dynamics */}
                    <div
                        className="glass-card flex min-w-0 flex-col p-4 lg:col-span-2 border-b-[6px]"
                        style={{ borderBottomColor: "var(--sidebar-primary)" }}
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <h2 className="text-sm font-medium">Hiring dynamics</h2>
                            <span className="text-[10px] text-muted-foreground">
                                Last 6 months
                            </span>
                        </div>

                        <div className="min-h-[200px]">
                            <StackedAreaChart data={dashboardData.hiresLast6Months} />
                        </div>
                    </div>

                    {/* Card 11 – Employees on leave */}
                    <div
                        className="glass-card flex min-w-0 flex-col p-4 lg:col-span-2 border-b-[6px]"
                        style={{ borderBottomColor: "var(--sidebar-primary)" }}
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <h2 className="text-sm font-medium">Employees on leave</h2>
                            <span className="text-[10px] text-muted-foreground">
                                Live overview
                            </span>
                        </div>
                        <div className="overflow-hidden rounded-md">
                            <div className="mt-2 text-base font-medium text-foreground">
                                <EmployeesOnLeaveCard
                                    employees={dashboardData.onLeaveEmployees}
                                    loading={false}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Card 10 – Headcount chart */}
                    <div
                        className="glass-card flex min-w-0 flex-col p-4 lg:col-span-2 border-b-[6px]"
                        style={{ borderBottomColor: "var(--sidebar-primary)" }}
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <h2 className="text-sm font-medium">Headcount by department</h2>
                            <span className="text-[10px] text-muted-foreground">
                                Total employees in each department
                            </span>
                        </div>
                        <EmployeesByDepartmentChart
                            departmentCounts={dashboardData.departmentCounts}
                        />
                    </div>

                    {/* Card 8 */}
                    <div
                        className="glass-card flex flex-col p-4 border-b-[6px]"
                        style={{ borderBottomColor: "var(--sidebar-primary)" }}
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <h2 className="text-sm font-medium">Something was here</h2>
                            <span className="text-[10px] text-muted-foreground">Current</span>
                        </div>
                        <div className="flex-1 min-h-[120px] text-xs text-muted-foreground">
                            sfnadkjsfnasjkdfnas
                        </div>
                    </div>

                    {/* Card 9 */}
                    <div
                        className="glass-card flex flex-col p-4 border-b-[6px] "
                        style={{ borderBottomColor: "var(--sidebar-primary)" }}
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <h2 className="text-sm font-medium">Something was here</h2>
                            <span className="text-[10px] text-muted-foreground">Today</span>
                        </div>
                        <div className="flex-1 min-h-[120px] text-xs text-muted-foreground">
                            kjsdnfjasnfjasnf
                        </div>
                    </div>

                </section>
            </div>
        </div>
    );
}
