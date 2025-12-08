"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { fetchCurrentUser } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";


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
    const [user, setUser] = useState<MeResponse["user"] | null>(null);
    const [loading, setLoading] = useState(true);


    const pathname = usePathname();

    const isRootDashboard = pathname === "/dashboard";

    let secondCrumbLabel: string | null = null;
    let secondCrumbHref: string | null = null;
    let currentPageLabel = "Overview";

    if (pathname === "/dashboard") {
        currentPageLabel = "Dashboard";
    } else if (pathname === "/dashboard/employees") {
        // Only 2 levels: Dashboard / Employees
        currentPageLabel = "Employees";
    } else if (pathname.startsWith("/dashboard/employees")) {
        // Nested under employees, so we show:
        // Dashboard / Employees / Something
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
            console.log("Dashboard /me:", data);

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
        <SidebarProvider >
            <AppSidebar/>
            <SidebarInset className="scrollbar-hide h-screen overflow-y-auto" >
                <header className="flex h-16 shrink-0 items-center gap-2 ">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        {/* <Separator
                            orientation="vertical"
                            className="scale-130 mr-1 data-[orientation=vertical]:h-4"
                        /> */}
                        <Breadcrumb>
                            <BreadcrumbList className="flex items-center gap-2">
                                {isRootDashboard ? (
                                    <BreadcrumbItem>
                                        <span className="glass-card py-1 px-1.5 text-foreground hover:text-[var(--border)]">Dashboard</span>
                                    </BreadcrumbItem>
                                ) : (
                                    <>
                                        <BreadcrumbItem className="hidden md:block">
                                            <BreadcrumbLink href="/dashboard" className="glass-card py-1 px-1.5 text-foreground hover:text-[var(--border)]">
                                                Dashboard
                                            </BreadcrumbLink>
                                        </BreadcrumbItem>

                                        {secondCrumbLabel && secondCrumbHref && (
                                            <>
                                                    <BreadcrumbSeparator className="glass-card p-0.5 hidden md:block text-foreground" />
                                                <BreadcrumbItem className="hidden md:block">
                                                    <BreadcrumbLink href={secondCrumbHref} className="glass-card py-1 px-1.5 text-foreground hover:text-[var(--border)]">
                                                        {secondCrumbLabel}
                                                    </BreadcrumbLink>
                                                </BreadcrumbItem>
                                            </>
                                        )}

                                        <BreadcrumbSeparator className="glass-card p-0.5 hidden md:block text-foreground" />

                                        <BreadcrumbItem>
                                            <BreadcrumbPage className="glass-card py-1 px-1.5 text-foreground hover:text-[var(--border)]">
                                                {currentPageLabel}
                                            </BreadcrumbPage>
                                        </BreadcrumbItem>
                                    </>
                                )}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );

}
