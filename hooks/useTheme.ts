// src/hooks/useTheme.ts
import { useCallback, useEffect, useState } from "react";

export type ThemeName = "blue" | "green" | "default" | "orange" | "red" | "rose" | "violet" | "yellow";
export type Scheme = "light" | "dark";

type ThemeState = { theme: ThemeName; scheme: Scheme };
const STORAGE_KEY = "app_theme";
const DEFAULT: ThemeState = { theme: "yellow", scheme: "light" };
const ALLOWED = ["blue", "green", "default", "orange", "red", "rose", "violet", "yellow"] as const;
type Allowed = typeof ALLOWED[number];

export default function useTheme(opts?: {
    // optional functions you can pass that call your backend endpoints
    fetchServerTheme?: () => Promise<{ theme?: string } | null>;
    updateServerTheme?: (theme: string) => Promise<any>;
    onError?: (err: any) => void;
    userIsLoggedIn?: boolean; // if true, the hook will try to sync with server on mount
}) {
    const { fetchServerTheme, updateServerTheme, onError, userIsLoggedIn } = opts ?? {};

    // Initialize: prefer localStorage; fallback to DEFAULT
    const readLocal = (): ThemeState | null => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!parsed?.theme || !parsed?.scheme) return null;
            if (!ALLOWED.includes(parsed.theme)) return null;
            return { theme: parsed.theme as ThemeName, scheme: parsed.scheme as Scheme };
        } catch {
            return null;
        }
    };

    const [state, setState] = useState<ThemeState>(() => {
        if (typeof window === "undefined") return DEFAULT;
        return readLocal() ?? DEFAULT;
    });

    // Apply state to document and persist to localStorage
    useEffect(() => {
        try {
            document.documentElement.setAttribute("data-theme", state.theme);
            document.documentElement.setAttribute("data-scheme", state.scheme);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (err) {
            console.error("useTheme: apply/persist error", err);
        }
    }, [state]);

    // On login (if userIsLoggedIn true and fetchServerTheme provided), fetch server value and reconcile.
    useEffect(() => {
        if (!userIsLoggedIn || !fetchServerTheme) return;
        let mounted = true;
        (async () => {
            try {
                const res = await fetchServerTheme();
                if (!mounted) return;
                if (res?.theme && ALLOWED.includes(res.theme as Allowed) && res.theme !== state.theme) {
                    // Adopt server as canonical on login
                    setState(s => ({ ...s, theme: res.theme as ThemeName }));
                }
            } catch (err) {
                if (onError) onError(err);
            }
        })();
        return () => { mounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userIsLoggedIn, fetchServerTheme]);

    // Setters
    const setTheme = useCallback((theme: string) => {
        if (!ALLOWED.includes(theme as Allowed)) {
            console.warn("useTheme: attempt to set invalid theme:", theme);
            return;
        }
        setState(s => ({ ...s, theme: theme as ThemeName }));
        // optimistic server update
        if (updateServerTheme) {
            updateServerTheme(theme).catch(err => {
                if (onError) onError(err);
            });
        }
    }, [updateServerTheme, onError]);

    const setScheme = useCallback((scheme: Scheme) => {
        setState(s => ({ ...s, scheme }));
    }, []);

    const toggleScheme = useCallback(() => {
        setState(s => ({ ...s, scheme: s.scheme === "light" ? "dark" : "light" }));
    }, []);

    return {
        theme: state.theme,
        scheme: state.scheme,
        setTheme,
        setScheme,
        toggleScheme,
    };
}
