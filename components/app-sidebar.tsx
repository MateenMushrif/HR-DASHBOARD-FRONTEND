"use client";

import * as React from "react";
import {
  BookOpen,
  Bot,
  Command,
  LifeBuoy,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import Link from "next/link";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: "Employees",
      url: "/dashboard/employees",
      icon: Bot,
    },
    {
      title: "Projects",
      url: "/dashboard/projects",
      icon: BookOpen,
    },
    {
      title: "Salary",
      url: "/dashboard/salary",
      icon: Settings2,
    },
    {
      title: "Requests",
      url: "/dashboard/requests",
      icon: Send,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings2,
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "https://github.com",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "https://twitter.com",
      icon: Send,
    },
  ],
};

interface MeResponse {
  message: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: MeResponse["user"] | null;
}) {
  const effectiveUser = user ?? data.user;

  return (
    <Sidebar
      collapsible="icon"
      variant="floating"
      className="bg-[var(--background)] border-[var(--sidebar-border)]"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Acme Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={effectiveUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
