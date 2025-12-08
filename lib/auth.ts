const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export function getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
}

export async function fetchCurrentUser() {
    if (typeof window === "undefined") return null;

    const token = getToken();

    if (!token) return null;

    try {
        const res = await fetch(`${API_URL}/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            return null;
        }

        const data = await res.json();
        return data;
    } catch (err) {
        console.error("fetchCurrentUser | error:", err);
        return null;
    }
}

// 🔴 LOGOUT helper
export async function logout() {
    if (typeof window === "undefined") return;

    const token = getToken();

    try {
        if (token) {
            await fetch(`${API_URL}/auth/logout`, {
                method: "POST",
                credentials: "include", // 🔥 SEND COOKIES TO BACKEND
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        }
    } catch (err) {
        console.error("logout | error:", err);
        // even if backend fails, we still clear token on client
    }

    localStorage.removeItem("token");
}
