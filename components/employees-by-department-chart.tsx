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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003"

interface Department {
    id: number
    name: string
    description?: string
    createdAt: string
    updatedAt: string
}

interface Employee {
    id: number
    name?: string
    fullName?: string
    employeeName?: string
    firstName?: string
    lastName?: string
    department?: string | Department
    status?: "ACTIVE" | "ON_LEAVE" | "INACTIVE" | string
    isIntern?: boolean
}

interface DeptPoint {
    department: string
    employees: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null

    const item = payload[0]

    return (
        <div className="glass-card p-0.5">
            <div className="tooltip-card px-3 py-2 text-xs">
                <p className="mb-1 text-[10px] text-[var(--chart-text)]">{label}</p>
                <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-foreground/80">
                        Employees
                    </span>
                    <span className="text-[11px] text-foreground font-semibold">
                        {item.value}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default function EmployeesByDepartmentChart() {
    const [data, setData] = React.useState<DeptPoint[]>([])
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
                    const json = await res.json().catch(() => ({}))
                    throw new Error(json.message || "Failed to load employees")
                }

                const json = await res.json()
                const employees: Employee[] = json.employees || []

                const map = new Map<string, number>()

                for (const emp of employees) {
                    const dept =
                        typeof emp.department === "string"
                            ? emp.department
                            : emp.department?.name ||
                            "Unknown"

                    map.set(dept, (map.get(dept) || 0) + 1)
                }

                const chartData: DeptPoint[] = Array.from(map.entries()).map(
                    ([department, employees]) => ({
                        department,
                        employees,
                    }),
                )

                setData(chartData)
            } catch (err: any) {
                console.error("Error fetching employees for dept chart:", err)
                setError(err.message || "Something went wrong")
            } finally {
                setLoading(false)
            }
        }

        fetchEmployees()
    }, [])

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center text-xs text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary mr-2" />
                Loading department data...
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-1 items-center justify-center text-xs text-destructive">
                Failed to load: {error}
            </div>
        )
    }

    if (data.length === 0) {
        return (
            <div className="flex flex-1 items-center justify-center text-xs text-muted-foreground">
                No employees found.
            </div>
        )
    }

    return (
        <div className="w-full h-[240px] md:h-[260px] lg:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{
                        top: 16,
                        right: 12,
                        left: 0,
                        bottom: 20,
                    }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsla(0, 0%, 0%, 0.00)"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="department"
                        axisLine={false}
                        tickLine={false}
                        tickMargin={8}
                        tick={{
                            fill: "var(--chart-text)",
                            fontSize: 12,
                        }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tickMargin={8}
                        tick={{
                            fill: "var(--chart-text)",
                            fontSize: 12,
                        }}
                    />
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: "hsla(0, 0%, 80%, 0.43)" }}
                    />
                    <Bar
                        dataKey="employees"
                        name="Employees"
                        radius={[6, 6, 2, 2]}
                        fill="var(--chart-3)"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
