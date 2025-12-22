// frontend/components/theme-init.tsx
"use client";

import { useEffect } from "react";

export function ThemeInit() {
    useEffect(() => {
        if (typeof window === "undefined") return;

        try {
            const raw = localStorage.getItem("app_theme");
            if (raw) {
                const parsed = JSON.parse(raw);
                const theme = typeof parsed.theme === "string" ? parsed.theme : "yellow";
                const scheme = parsed.scheme === "dark" ? "dark" : "light";
                document.documentElement.setAttribute("data-theme", theme);
                document.documentElement.setAttribute("data-scheme", scheme);
                return;
            }
        } catch (e) {
            // ignore parsing errors and fall back to defaults below
            console.warn("ThemeInit: failing back to defaults:", e);
        }

        // fallback default (no surprises)
        document.documentElement.setAttribute("data-theme", "yellow");
        document.documentElement.setAttribute("data-scheme", "light");
    }, []);

    return null;
}
