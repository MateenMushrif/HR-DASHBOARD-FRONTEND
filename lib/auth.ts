const API_URL = process.env.NEXT_PUBLIC_API_URL!;

// export function getToken() {
//     if (typeof window === "undefined") return null;
//     return localStorage.getItem("token");
// }

export async function fetchCurrentUser() {
    if (typeof window === "undefined") return null;

    try {
        const res = await fetch(`${API_URL}/me`, {
            credentials: "include", // 🔥 SEND COOKIES
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



// ✅ LOGOUT helper (cookie-based auth)
export async function logout() {
    if (typeof window === "undefined") return;

    try {
        await fetch(`${API_URL}/auth/logout`, {
            method: "POST",
            credentials: "include", // 🔥 REQUIRED so cookie is sent
        });
    } catch (err) {
        console.error("logout | error:", err);
        // even if this fails, auth cookie will expire eventually
    }

    // Optional but recommended:
    window.location.href = "/login";
}
