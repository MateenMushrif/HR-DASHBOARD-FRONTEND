// src/components/ThemeSwitcher.tsx
"use client";

import React, { useCallback, useState, useEffect } from "react";
import useTheme, { ThemeName, Scheme } from "@/hooks/useTheme";
import { fetchThemeApi, updateThemeApi } from "@/lib/theme-api";

const THEMES: ThemeName[] = [
    "blue",
    "green",
    "default",
    "orange",
    "red",
    "rose",
    "violet",
    "yellow",
];

function Swatch({
    theme,
    scheme,
    isSelected,
    onClick,
}: {
    theme: ThemeName;
    scheme: Scheme;
    isSelected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            aria-pressed={isSelected}
            onClick={onClick}
            className={`w-28 rounded-lg border text-xs text-left transition-shadow bg-[var(--accento)] focus:outline-none focus:ring-3 ${isSelected ? "ring-3 ring-offset-2" : "shadow-sm"
                }`}
            title={`${theme} — ${scheme}`}
        >
            <div data-theme={theme} data-scheme={scheme} className="rounded-md overflow-hidden border p-2">
                <div className="h-10 w-full" style={{ background: "var(--background)" }} />
                <div className="flex gap-1 items-stretch p-2">
                    <div className="flex-1 h-6 rounded border-b-2 bg-[var(--card)] border-[var(--primary)]" />
                    <div
                        className="w-10 h-6 rounded flex items-center justify-center text-[10px] font-medium border-b-2 border-[var(--primary)]"
                        style={{
                            background: "var(--card)",
                            color: "var(--primary-foreground)",
                        }}
                    >
                        A
                    </div>
                </div>
                <div className="px-2 pb-2 pt-1">
                    <div className="font-medium leading-none truncate capitalize">{theme}</div>
                </div>
            </div>
        </button>
    );
}

export default function ThemeSwitcher({
    userIsLoggedIn = false,
}: {
    userIsLoggedIn?: boolean;
}) {
    const { theme, setTheme, toggleScheme } = useTheme({
        fetchServerTheme: fetchThemeApi,
        updateServerTheme: updateThemeApi,
        userIsLoggedIn,
        onError: (e) => console.error(e),
    });

    const [currentScheme, setCurrentScheme] = useState<Scheme>("light");

    // Keep track of the REAL current scheme from the DOM
    useEffect(() => {
        const updateScheme = () => {
            const scheme = (document.documentElement.getAttribute("data-scheme") as Scheme) || "light";
            setCurrentScheme(scheme);
        };

        updateScheme(); // initial

        // Optional: observe changes (in case something else changes it)
        const observer = new MutationObserver(updateScheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["data-scheme"],
        });

        return () => observer.disconnect();
    }, []);

    const [saving, setSaving] = useState(false);

    const handlePick = useCallback(
        async (pickedTheme: ThemeName) => {
            setTheme(pickedTheme);

            if (!userIsLoggedIn) return;
            setSaving(true);
            try {
                await updateThemeApi(pickedTheme);
            } catch (e) {
                console.error("Failed to save theme", e);
            } finally {
                setSaving(false);
            }
        },
        [setTheme, userIsLoggedIn]
    );

    const handleToggleScheme = useCallback(() => {
        toggleScheme();
    }, [toggleScheme]);

    return (
        <section className="mx-auto bg-card max-w-3xl rounded-lg p-5 shadow-sm">
            <header className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Appearance</h3>
                    <p className="text-sm text-muted-foreground p-1">
                        Select a palette.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-sm text-right">
                        <div className="text-xs text-muted-foreground">Current</div>
                        <div className="font-medium capitalize">
                            {theme} · {currentScheme}
                        </div>
                    </div>

                    <button
                        onClick={handleToggleScheme}
                        className="ml-3 rounded-md border px-3 py-1 text-sm"
                        aria-label="Toggle light/dark"
                    >
                        Switch to {currentScheme === "light" ? "Dark" : "Light"}
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {THEMES.map((t) => (
                    <Swatch
                        key={t}
                        theme={t}
                        scheme={currentScheme}
                        isSelected={theme === t}
                        onClick={() => handlePick(t)}
                    />
                ))}
            </div>

            <div className="mt-4 flex justify-between items-center text-sm text-muted-foreground">
                <div>
                    Showing previews for: <span className="capitalize ml-1">{currentScheme}</span>
                </div>
                <div>
                    <button
                        onClick={() => {
                            setTheme("yellow");
                            if (userIsLoggedIn) updateThemeApi("yellow").catch(() => { });
                        }}
                        className="rounded-md border px-3 py-1 text-sm"
                    >
                        Reset to default
                    </button>
                </div>
            </div>

            {saving ? <div className="mt-2 text-xs text-muted-foreground">Saving…</div> : null}
        </section>
    );
}