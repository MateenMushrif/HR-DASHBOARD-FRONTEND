// src/lib/theme-api.ts
const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3003").replace(/\/$/, "");

function getTokenHeader(): Record<string, string> {
    try {
        if (typeof window === "undefined") return {};
        const token = localStorage.getItem("token"); // same key your auth uses
        return token ? { Authorization: `Bearer ${token}` } : {};
    } catch {
        return {};
    }
}

async function fetchJson(path: string, opts?: RequestInit) {
    const url = API_BASE + path;
    const res = await fetch(url, {
        credentials: "include",
        ...opts,
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        const msg = text || `${res.status} ${res.statusText}`;
        throw new Error(msg);
    }
    return res.json();
}

export async function fetchThemeApi() {
    const headers = { ...getTokenHeader() };
    return fetchJson("/api/user/theme", { method: "GET", headers });
}

export async function updateThemeApi(theme: string) {
    const headers = { "Content-Type": "application/json", ...getTokenHeader() };
    return fetchJson("/api/user/theme", {
        method: "POST",
        headers,
        body: JSON.stringify({ theme }),
    });
}
