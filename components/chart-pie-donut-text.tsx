"use client"

import * as React from "react"
import { Pie, PieChart, Label } from "recharts"

import {
    Card,
    CardContent,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "Employees vs interns donut with total in center"

interface EmployeesInternsDonutChartProps {
    employeesCount: number;
    internsCount: number;
}

export default function EmployeesInternsDonutChart({
    employeesCount,
    internsCount,
}: EmployeesInternsDonutChartProps) {


    const chartData = React.useMemo(
        () => [
            {
                browser: "employees",
                visitors: employeesCount,
                fill: "var(--chart-5)",
            },
            {
                browser: "interns",
                visitors: internsCount,
                fill: "var(--chart-3)",
            },
        ],
        [employeesCount, internsCount],
    )

    const chartConfig: ChartConfig = {
        visitors: {
            label: "Employees",
        },
        employees: {
            label: "Employees",
            color: "var(--chart-1)",
        },
        interns: {
            label: "Interns",
            color: "var(--chart-2)",
        },
    }

    const totalVisitors = React.useMemo(
        () => chartData.reduce((acc, curr) => acc + curr.visitors, 0),
        [chartData],
    )

    // No data
    if (totalVisitors === 0) {
        return (
            <Card className="flex h-full w-full flex-col bg-transparent border-0 shadow-none">
                <CardContent className="flex flex-1 items-center justify-center">
                    <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
                        <span>No employees found.</span>
                        <span>Donut chart will show once you add people.</span>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // ✅ Main chart render
    return (
        <Card className="flex h-full w-full flex-col bg-transparent border-0 shadow-none p-0">
            <CardContent className="flex-1 pb-0">
                {/* This wrapper makes it behave nicely in a grid cell */}
                <div className="w-full min-h-[220px] h-[220px] sm:h-[240px] lg:h-[260px]">
                    <ChartContainer
                        config={chartConfig}
                        className="w-full h-full"
                    >
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Pie
                                data={chartData}
                                dataKey="visitors"
                                nameKey="browser"
                                innerRadius={60}
                                strokeWidth={0}
                            >
                                <Label
                                    content={({ viewBox }) => {
                                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                            return (
                                                <text
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                >
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        className="fill-foreground text-3xl font-bold"
                                                    >
                                                        {totalVisitors.toLocaleString()}
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={(viewBox.cy || 0) + 24}
                                                        className="fill-muted-foreground text-xs"
                                                    >
                                                        Employees
                                                    </tspan>
                                                </text>
                                            )
                                        }
                                        return null
                                    }}
                                />
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
    )
}
