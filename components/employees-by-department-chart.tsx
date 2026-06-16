"use client"

import * as React from "react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts"

interface CustomTooltipProps {
    active?: boolean
    payload?: Array<{ value: number }>
    label?: string
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null

    const item = payload[0]

    return (
        <div className="rounded-lg border border-border bg-card shadow-md px-3 py-2 text-xs backdrop-blur-sm min-w-[120px]">
            <p className="mb-1 text-[12px] text-[var(--chart-text)]">{label}</p>
            <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-muted-foreground">
                    Employees
                </span>
                <span className="text-[15px] text-foreground font-semibold">
                    {item.value}
                </span>
            </div>
        </div>
    )
}

interface EmployeesByDepartmentChartProps {
    departmentCounts: {
        department: string;
        count: number;
    }[];
}

export default function EmployeesByDepartmentChart({
    departmentCounts,
}: EmployeesByDepartmentChartProps) {

    const chartData = departmentCounts.map((d) => ({
        department: d.department,
        employees: d.count,
    }));

    return (
        <div className="w-full min-h-[260px] h-[260px] md:h-[280px] lg:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{
                        top: 10,
                        right: 10,
                        left: -10,
                        bottom: 5,
                    }}
                >
                    <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop
                                offset="0%"
                                stopColor="var(--chart-3)"
                                stopOpacity={0.9}
                            />
                            <stop
                                offset="100%"
                                stopColor="var(--chart-3)"
                                stopOpacity={0.6}
                            />
                        </linearGradient>
                    </defs>

                    <CartesianGrid
                        strokeDasharray="4 4"
                        stroke="var(--border)"
                        vertical={false}
                        opacity={0.3}
                    />

                    <XAxis
                        dataKey="department"
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                        height={50}
                        tickFormatter={(value: string) =>
                            value.length > 14 ? value.slice(0, 14) + "…" : value
                        }
                        tick={{
                            fill: "var(--muted-foreground)",
                            fontSize: 12,
                        }}
                    />

                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tickMargin={8}
                        tick={{
                            fill: "var(--muted-foreground)",
                            fontSize: 12,
                        }}
                    />

                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: "rgba(0,0,0,0.04)" }}
                    />

                    <Bar
                        dataKey="employees"
                        name="Employees"
                        radius={[8, 8, 4, 4]}
                        fill="url(#barGradient)"
                        animationDuration={500}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}