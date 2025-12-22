// src/types/nav.ts
import type { LucideIcon } from "lucide-react";

export interface NavItem {
    title: string;
    url?: string;                // optional because some items (theme toggle) don't need a url
    icon?: LucideIcon | React.ComponentType<React.SVGProps<SVGSVGElement>>;
    isActive?: boolean;
    isThemeToggle?: boolean;
    items?: NavItem[];           // nested items
}
