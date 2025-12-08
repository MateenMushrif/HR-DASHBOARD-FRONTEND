// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"], // using .dark on <html> or next-themes
    content: [
        "./src/app/**/*.{ts,tsx}",
        "./src/components/**/*.{ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",

                sidebar: "hsl(var(--sidebar))",
                "sidebar-foreground": "hsl(var(--sidebar-foreground))",

                card: "hsl(var(--card))",
                "card-foreground": "hsl(var(--card-foreground))",

                accent: "hsl(var(--accent))",
                "accent-foreground": "hsl(var(--accent-foreground))",

                muted: "hsl(var(--muted))",
                "muted-foreground": "hsl(var(--muted-foreground))",

                border: "hsl(var(--border))",
                ring: "hsl(var(--ring))",
            },
            borderRadius: {
                xl: "1rem",
                "2xl": "1.5rem",
                "3xl": "2rem",
            },
            boxShadow: {
                // used for floating glass panels
                "glass-soft": "0 24px 80px hsla(var(--shadow-color) / 0.45)",
            },
        },
    },
    plugins: [],
};

export default config;
