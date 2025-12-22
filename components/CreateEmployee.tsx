"use client";
import Link from "next/link";

export default function CreateEmployee() {
    return (
        <Link href="/dashboard/employees/new" className="btn">
            + Create Employee
        </Link>
    );
}
