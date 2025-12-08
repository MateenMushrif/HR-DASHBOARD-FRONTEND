"use client"

import * as React from "react"

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
    name: string
    department?: string | Department
    status?: "ACTIVE" | "ON_LEAVE" | "INACTIVE" | string
    role?: string
}

export default function EmployeesOnLeaveCard() {
    const [employeesOnLeave, setEmployeesOnLeave] = React.useState<Employee[]>([])
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

                const onLeave = employees.filter(
                    (emp) => emp.status === "ON_LEAVE"
                )

                setEmployeesOnLeave(onLeave)
            } catch (err: any) {
                console.error("Error fetching employees on leave:", err)
                setError(err.message || "Something went wrong")
            } finally {
                setLoading(false)
            }
        }

        fetchEmployees()
    }, [])

    if (loading) {
        return (
            <div className="mt-1 text-xs text-muted-foreground flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
                <span>Loading employees on leave...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="mt-2 text-xs text-destructive">
                Failed to load: {error}
            </div>
        )
    }

    if (employeesOnLeave.length === 0) {
        return (
            <div className="mt-2 text-xs text-muted-foreground">
                No employees are currently on leave.
            </div>
        )
    }

    return (
        <div className="mt-3 space-y-2 text-xs text-muted-foreground max-h-[280px] overflow-y-auto scrollbar-hide">
            {employeesOnLeave.map((emp) => {
                const deptLabel =
                    typeof emp.department === "string"
                        ? emp.department
                        : emp.department?.name

                const empName =
                    emp.name ||
                    emp.fullName ||
                    emp.employeeName ||
                    `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim() ||
                    "Unnamed Employee"

                return (
                    <div
                        key={emp.id}
                        className="flex items-center justify-between rounded-lg bg-[color-mix(in_srgb,var(--gradient-2)_20%,transparent)] px-3 py-2"
                    >
                        <div className="flex flex-col">
                            {/* NAME */}
                            <span className="text-foreground text-[13px] font-medium">
                                {empName}
                            </span>

                            {/* DEPARTMENT */}
                            <span className="text-[11px] text-[var(--chart-text)] opacity-90">
                                {deptLabel || "No department"}
                            </span>
                        </div>

                        <span className="badge-status status-onleave text-[10px]">
                            On leave
                        </span>
                    </div>
                )
            })}

        </div>
    )

}
