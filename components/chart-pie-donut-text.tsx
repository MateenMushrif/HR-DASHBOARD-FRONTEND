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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003"

interface Employee {
    id: number
    isIntern?: boolean
}

export const description = "Employees vs interns donut with total in center"

export default function EmployeesInternsDonutChart() {
    const [employeesCount, setEmployeesCount] = React.useState(0)
    const [internsCount, setInternsCount] = React.useState(0)
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)

    React.useEffect(() => {
        async function fetchEmployees() {
            try {
                setLoading(true)
                setError(null)

                const token = localStorage.getItem("token")
                if (!token) {
                    setError("Not authenticated")
                    setLoading(false)
                    return
                }

                const res = await fetch(`${API_URL}/api/employees`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                })

                if (!res.ok) {
                    const data = await res.json().catch(() => ({}))
                    throw new Error(data.message || "Failed to load employees")
                }

                const data = await res.json()
                const employees: Employee[] = data.employees || []

                const interns = employees.filter((e) => e.isIntern === true).length
                const regulars = employees.length - interns

                setInternsCount(interns)
                setEmployeesCount(regulars)
            } catch (err: any) {
                console.error("Error fetching employees for donut chart:", err)
                setError(err.message || "Something went wrong")
            } finally {
                setLoading(false)
            }
        }

        fetchEmployees()
    }, [])

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

    // Loading state
    if (loading) {
        return (
            <Card className="flex h-full w-full flex-col bg-transparent border-0 shadow-none">
                <CardContent className="flex flex-1 items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
                </CardContent>
            </Card>
        )
    }

    // Error state
    if (error) {
        return (
            <Card className="flex h-full w-full flex-col bg-transparent border-0 shadow-none">
                <CardContent className="flex flex-1 items-center justify-center">
                    <p className="text-xs text-destructive">
                        Failed to load team mix: {error}
                    </p>
                </CardContent>
            </Card>
        )
    }

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
        <Card className="flex h-full w-full flex-col bg-transparent border-0 shadow-none">
            <CardContent className="flex-1 pb-0">
                {/* This wrapper makes it behave nicely in a grid cell */}
                <div className="w-full h-[220px] sm:h-[240px] lg:h-[260px]">
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
                                strokeWidth={5}
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
  