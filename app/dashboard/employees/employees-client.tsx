"use client"

import * as React from "react"
import Link from "next/link"
import { DataTable } from "@/components/EmployeeTable"

interface Department {
    id: number
    name: string
}

interface Employee {
    id: number
    firstName: string
    lastName: string
    email: string
    phone?: string | null
    role?: string | null
    status: string
    dateOfJoining?: string | null
    salary?: string | null
    department?: Department | null
    isIntern?: boolean
}

export default function EmployeesClient({
    employees,
}: {
    employees: Employee[]
}) {
    const mappedEmployees = React.useMemo(() => {
        return employees.map((e) => ({
            id: e.id,
            firstName: e.firstName ?? "",
            lastName: e.lastName ?? "",
            email: e.email ?? "",
            phone: e.phone ?? null,
            role: e.role ?? null,
            isIntern: !!e.isIntern,
            department: e.department?.name ?? null,
            status: e.status ?? "UNKNOWN",
            dateOfJoining: e.dateOfJoining ?? null,
            salary: e.salary ?? null,
            header: `${e.firstName ?? ""} ${e.lastName ?? ""}`.trim(),
        }))
    }, [employees])

    if (employees.length === 0) {
        return (
            <div className="p-4 lg:p-6 space-y-4">
                <div className="glass-card">
                    <div className="inner-card flex justify-between">
                        <div>
                            <h1 className="text-xl font-semibold">Employees</h1>
                            <p className="text-sm text-muted-foreground">
                                No employees found.
                            </p>
                        </div>

                        <Link
                            href="/dashboard/employees/new"
                            className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground"
                        >
                            Add Employee
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4 px-12 py-4">
            <DataTable data={mappedEmployees} />
        </div>
    )
}
