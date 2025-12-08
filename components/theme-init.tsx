"use client"

import { useEffect } from "react"

export function ThemeInit() {
    useEffect(() => {
        if (typeof window === "undefined") return

        const stored = localStorage.getItem("theme")

        if (stored === "dark") {
            document.documentElement.classList.add("dark")
        } else if (stored === "light") {
            document.documentElement.classList.remove("dark")
        }
        // if null, you can default to light and do nothing
    }, [])

    return null
}
