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
    const [chartData, setChartData] = React.useState<HirePoint[]>([]);
    const [chartLoading, setChartLoading] = React.useState(true);
    const [chartError, setChartError] = React.useState<string | null>(null);

    React.useEffect(() => {
        async function loadStats() {
            try {
                setChartLoading(true);
                const token = localStorage.getItem("token");
                if (!token) return;

                const res = await fetch(
                    `${API_URL}/api/employees/stats/hires-last-6-months`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data.message || "Failed to load stats");

                setChartData(data.points ?? []);
            } catch (err: any) {
                setChartError(err.message || "Something went wrong");
            } finally {
                setChartLoading(false);
            }
        }

        loadStats();
    }, []);

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

                <section className="grid auto-rows-[minmax(150px,auto)] gap-4 lg:grid-cols-4">

                    {/* Card 1 */}
                    <StatCard
                        label="Total Employees"
                        value={48}
                        sublabel="+6 compared to last month"
                    />

                    {/* Card 2 */}
                    <StatCard
                        label="Active Today"
                        value={36}
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
                        <div className="mt-3 flex flex-1 items-center justify-center">
                            <ChartPieDonutText />
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
                        <div className="mt-3 flex flex-1 items-center justify-center">
                            <ChartPieDonutText />
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
                        className="glass-card flex flex-col p-4 lg:col-span-2 border-b-[6px]"
                        style={{ borderBottomColor: "var(--sidebar-primary)" }}
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <h2 className="text-sm font-medium">Hiring dynamics</h2>
                            <span className="text-[10px] text-muted-foreground">
                                Last 6 months
                            </span>
                        </div>

                        {chartLoading ? (
                            <div className="flex h-[200px] items-center justify-center">
                                <div className="h-7 w-7 animate-spin rounded-full border-2 border-muted border-t-primary" />
                            </div>
                        ) : chartError ? (
                            <p className="text-xs text-destructive">{chartError}</p>
                        ) : (
                            <div className="min-h-[200px]">
                                <StackedAreaChart data={chartData} />
                            </div>
                        )}
                    </div>

                    {/* Card 11 – Employees on leave */}
                    <div
                        className="glass-card flex flex-col p-4 lg:col-span-2 border-b-[6px]"
                        style={{ borderBottomColor: "var(--sidebar-primary)" }}
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <h2 className="text-sm font-medium">Employees on leave</h2>
                            <span className="text-[10px] text-muted-foreground">
                                Live overview
                            </span>
                        </div>
                        <div className="overflow-hidden rounded-md">
                            <EmployeesOnLeaveCard />
                        </div>
                    </div>

                    {/* Card 10 – Headcount chart */}
                    <div
                        className="glass-card flex flex-col p-4 lg:col-span-2 border-b-[6px]"
                        style={{ borderBottomColor: "var(--sidebar-primary)" }}
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <h2 className="text-sm font-medium">Headcount by department</h2>
                            <span className="text-[10px] text-muted-foreground">
                                Total employees in each department
                            </span>
                        </div>
                        <EmployeesByDepartmentChart />
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
