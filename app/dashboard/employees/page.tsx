import { cookies } from "next/headers"
import EmployeesClient from "./employees-client"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003"

export default async function EmployeesPage() {
    // 👇 cookies() is async in Next 16
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    console.log("tokennnnnnnn: ", token)
    if (!token) {
        return (
            <div className="p-6 text-sm text-destructive">
                Not authenticated
            </div>
        )
    }

    const res = await fetch(`${API_URL}/api/employees`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store", // VERY important for dashboards
    })

    if (!res.ok) {
        throw new Error("Failed to load employees")
    }

    const data = await res.json()

    return (
        <EmployeesClient employees={data.employees ?? []} />
    )
}
