"use client";

import * as React from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Label,
} from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";

interface Employee {
    id: number;
    isIntern?: boolean;
}

export default function EmployeesInternsDonutChart() {
    const [employeesCount, setEmployeesCount] = React.useState(0);
    const [internsCount, setInternsCount] = React.useState(0);
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
                const employees: Employee[] = data.employees || [];

                const interns = employees.filter((e) => e.isIntern === true).length;
                const regulars = employees.length - interns;

                setInternsCount(interns);
                setEmployeesCount(regulars);
            } catch (err: any) {
                console.error("Error fetching employees for donut chart:", err);
                setError(err.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        }

        fetchEmployees();
    }, []);

    const total = employeesCount + internsCount;

    const chartData = [
        {
            name: "Employees",
            value: employeesCount,
            color: "var(--chart-1)",
        },
        {
            name: "Interns",
            value: internsCount,
            color: "var(--chart-2)",
        },
    ];

    // 🌀 Loading
    if (loading) {
        return (
            <div className="flex h-full min-h-[180px] items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
            </div>
        );
    }

    // 💥 Error
    if (error) {
        return (
            <div className="text-xs text-destructive">
                Failed to load team mix: {error}
            </div>
        );
    }

    // 😶 No data
    if (total === 0) {
        return (
            <div className="flex h-full min-h-[180px] flex-col items-center justify-center text-xs text-muted-foreground">
                <p>No employees found.</p>
                <p>Donut chart will show once you add people.</p>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            <div className="mb-2">
                <h3 className="text-sm font-medium">Team mix</h3>
                <p className="text-xs text-muted-foreground">
                    Employees vs interns in your company.
                </p>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center gap-3">
                {/* fixed height so Recharts doesn't play dead */}
                <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Tooltip
                                cursor={{ stroke: "hsla(0,0%,100%,0.18)", strokeWidth: 1 }}
                                content={({ active, payload }) => {
                                    if (!active || !payload || payload.length === 0) return null;
                                    return (
                                        <div className="glass-card p-0.5">
                                            <div className="inner-card px-2 py-1 text-xs">
                                                {payload.map((item, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex items-center justify-between gap-2 py-[2px]"
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            <span
                                                                className="h-2 w-2 rounded-full"
                                                                style={{ backgroundColor: (item as any).payload.color }}
                                                            />
                                                            <span className="text-[11px] text-foreground/80">
                                                                {item.name}
                                                            </span>
                                                        </div>
                                                        <span className="text-[11px] text-foreground">
                                                            {item.value}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }}
                            />
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={60}
                                outerRadius={90}
                                strokeWidth={4}
                            >
                                {chartData.map((entry) => (
                                    <Cell
                                        key={entry.name}
                                        fill={entry.color}
                                        stroke="transparent"
                                    />
                                ))}

                                {/* 🔹 CENTER LABEL: ONLY EMPLOYEES */}
                                <Label
                                    position="center"
                                    content={({ viewBox }) => {
                                        if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) {
                                            return null;
                                        }
                                        const cx = viewBox.cx ?? 0;
                                        const cy = viewBox.cy ?? 0;

                                        return (
                                            <text
                                                x={cx}
                                                y={cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={cx}
                                                    y={cy}
                                                    className="fill-foreground text-2xl font-bold"
                                                >
                                                    {total} {/* ✅ total employees (regular + interns) */}
                                                </tspan>
                                                <tspan
                                                    x={cx}
                                                    y={cy + 18}
                                                    className="fill-muted-foreground text-xs"
                                                >
                                                    Employees
                                                </tspan>
                                            </text>
                                        );
                                    }}
                                />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="mt-1 flex flex-wrap items-center justify-center gap-3 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: "var(--chart-1)" }}
                        />
                        <span>Employees: {employeesCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: "var(--chart-2)" }}
                        />
                        <span>Interns: {internsCount}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
