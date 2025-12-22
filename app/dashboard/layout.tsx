"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { fetchCurrentUser } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface MeResponse {
    message: string;
    user: {
        id: number;
        email: string;
        name: string;
    };
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();

    const [user, setUser] = useState<MeResponse["user"] | null>(null);
    const [loading, setLoading] = useState(true);

    const isRootDashboard = pathname === "/dashboard";

    let secondCrumbLabel: string | null = null;
    let secondCrumbHref: string | null = null;
    let currentPageLabel = "Settings";

    if (pathname === "/dashboard") {
        currentPageLabel = "Dashboard";
    } else if (pathname === "/dashboard/employees") {
        currentPageLabel = "Employees";
    } else if (pathname.startsWith("/dashboard/employees")) {
        secondCrumbLabel = "Employees";
        secondCrumbHref = "/dashboard/employees";

        if (pathname === "/dashboard/employees/new") {
            currentPageLabel = "New Employee";
        } else if (pathname.startsWith("/dashboard/employees/")) {
            currentPageLabel = "Employee Details";
        }
    }

    useEffect(() => {
        let cancelled = false;

        async function load() {
            const data = await fetchCurrentUser();

            if (cancelled) return;

            if (!data) {
                router.replace("/login");
                return;
            }

            setUser(data.user);
            setLoading(false);
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [router]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-sm text-muted-foreground">
                    Checking your session...
                </p>
            </div>
        );
    }

    return (
        <SidebarProvider>
            <AppSidebar user={user} />

            <SidebarInset className="h-screen overflow-hidden bg-background">
                <header className="flex h-16 shrink-0 items-center">
                    <div className="flex w-full items-center justify-between px-4">
                        <div className="flex items-center gap-3">
                            <SidebarTrigger className="-ml-1" />

                            <Breadcrumb>
                                <BreadcrumbList className="flex items-center gap-2">
                                    {isRootDashboard ? (
                                        <BreadcrumbItem>
                                            <span className="glass-crumb">Dashboard</span>
                                        </BreadcrumbItem>
                                    ) : (
                                        <>
                                            <BreadcrumbItem className="hidden md:block">
                                                <Link href="/dashboard" className="glass-crumb">
                                                    Dashboard
                                                </Link>
                                            </BreadcrumbItem>

                                            {secondCrumbLabel && secondCrumbHref && (
                                                <>
                                                    <BreadcrumbSeparator className="hidden md:block text-muted-foreground" />
                                                    <BreadcrumbItem className="hidden md:block">
                                                        <Link
                                                            href={secondCrumbHref}
                                                            className="glass-crumb"
                                                        >
                                                            {secondCrumbLabel}
                                                        </Link>
                                                    </BreadcrumbItem>
                                                </>
                                            )}

                                            <BreadcrumbSeparator className="hidden md:block text-muted-foreground" />

                                            <BreadcrumbItem>
                                                <BreadcrumbPage className="glass-crumb">
                                                    {currentPageLabel}
                                                </BreadcrumbPage>
                                            </BreadcrumbItem>
                                        </>
                                    )}
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>

                        <div className="hidden items-center gap-3 md:flex">
                            <button className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
                                <span>01.08.2022 - 31.08.2022</span>
                            </button>
                        </div>
                    </div>
                </header>

                <div className="ml-12 mt-4 flex flex-1 flex-col gap-4 rounded-tl-4xl bg-[var(--accento)] pr-2 pt-0">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
