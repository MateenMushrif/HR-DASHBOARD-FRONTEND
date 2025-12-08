"use client";

import StackedAreaChart, { HirePoint } from "@/components/area-rechart";
import ChartPieDonutText from "@/components/chart-pie-donut-text";
import EmployeesByDepartmentChart from "@/components/employees-by-department-chart";
import EmployeesOnLeaveCard from "@/components/employees-on-leave-card"
import React from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";

export default function Page() {

    // inside your Page component:
    const [chartData, setChartData] = React.useState<HirePoint[]>([]);
    const [chartLoading, setChartLoading] = React.useState(true);
    const [chartError, setChartError] = React.useState<string | null>(null);

    React.useEffect(() => {
        async function loadStats() {
            try {
                setChartLoading(true);
                setChartError(null);

                const token = localStorage.getItem("token");
                if (!token) {
                    setChartError("Not authenticated");
                    setChartLoading(false);
                    return;
                }

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

                if (!res.ok) {
                    throw new Error(data.message || "Failed to load hire stats");
                }

                // data.points is [{ month, employees, interns }]
                setChartData(data.points || []);
            } catch (err: any) {
                console.error("Error loading hire stats:", err);
                setChartError(err.message || "Something went wrong");
            } finally {
                setChartLoading(false);
            }
        }

        loadStats();
    }, []);

    return (
        <div className="flex flex-col gap-4 p-4 ">

            {/* Top stats row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 ">

                <div className="glass-card p-1">
                    <div className="inner-card p-4">
                        <div className="text-xs text-muted-foreground">Total Employees</div>
                        <div className="mt-2 text-2xl font-semibold">48</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                            +6 compared to last month
                        </div>
                    </div>
                </div>

                <div className="glass-card p-1">
                    <div className="inner-card p-4">
                        <div className="text-xs text-muted-foreground">Active Today</div>
                        <div className="mt-2 text-2xl font-semibold">36</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                            75% of total workforce
                        </div>
                    </div>
                </div>

                <div className="glass-card p-1">
                    <div className="inner-card p-4">
                        <div className="text-xs text-muted-foreground">On Leave</div>
                        <div className="mt-2 text-2xl font-semibold">5</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                            Mostly from Engineering
                        </div>
                    </div>
                </div>

                <div className="glass-card p-1">
                    <div className="inner-card p-4">
                        <div className="text-xs text-muted-foreground">Pending Requests</div>
                        <div className="mt-2 text-2xl font-semibold text-accent">12</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                            Approvals needed today
                        </div>
                    </div>
                </div>

            </div>

            {/* Bottom section */}
            <div className="grid grid-cols-12 gap-4">

                {/* 4-col pie chart */}
                <div className="glass-card col-span-12 lg:col-span-4 lg:row-span-4">
                    <div className="inner-card-clean p-4 flex items-center justify-center h-full">
                        {/* <PieChart /> */}
                        <ChartPieDonutText />
                    </div>
                </div>

                {/* 8-col brick */}
                <div className="glass-card col-span-12 lg:col-span-8 lg:row-span-4">
                    <div className="inner-card-clean h-full w-full p-4">
                        {chartLoading ? (
                            <div className="flex h-full min-h-[160px] items-center justify-center">
                                <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
                            </div>
                        ) : chartError ? (
                            <p className="text-xs text-destructive">{chartError}</p>
                        ) : (
                            <StackedAreaChart data={chartData} />
                        )}
                    </div>
                </div>


                {/* 8-col chart */}
                <div className="glass-card p-1 col-span-12 lg:col-span-8 lg:row-span-4">
                    <div className="inner-card p-4 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium">Headcount by department</h3>
                            <span className="text-[11px] text-[var(--chart-text)] opacity-80">
                                All employees & interns
                            </span>
                        </div>

                        <EmployeesByDepartmentChart />
                    </div>
                </div>


                {/* 4-col summary / employees on leave */}
                <div className="glass-card p-1 col-span-12 lg:col-span-4 lg:row-span-4">
                    <div className="inner-card p-4 h-full flex flex-col">
                        <h3 className="text-sm font-medium">Employees on leave</h3>
                        <EmployeesOnLeaveCard />
                    </div>
                </div>


            </div>


        </div>
    );
}
