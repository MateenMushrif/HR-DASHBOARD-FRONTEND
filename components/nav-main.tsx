"use client";

import * as React from "react";
import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const [openItem, setOpenItem] = React.useState<string | null>(null);



  // toggle theme function , currently using for light/dark mode switch
  const toggleTheme = () => {
    if (typeof document === "undefined") return

    const root = document.documentElement
    const isDark = root.classList.contains("dark")

    if (isDark) {
      root.classList.remove("dark")
      localStorage.setItem("theme", "light")
    } else {
      root.classList.add("dark")
      localStorage.setItem("theme", "dark")
    }
  }


  return (
    <SidebarGroup>
      <SidebarGroupLabel></SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasChildren = !!item.items?.length;
          const isOpen = openItem === item.title;

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className="flex items-center gap-2"
              >
                <a
                  href={item.url}
                  onClick={(e) => {
                    if (hasChildren) {
                      // toggle submenu instead of navigating
                      e.preventDefault();
                      setOpenItem(isOpen ? null : item.title);
                    }
                    // if no children: normal navigation
                  }}
                >
                  <item.icon />
                  <span>{item.title}</span>
                  {hasChildren ? (
                    <ChevronRight
                      className={`ml-auto h-4 w-4 transition-transform ${isOpen ? "rotate-90" : ""
                        }`}
                    />
                  ) : null}
                </a>
              </SidebarMenuButton>

              {hasChildren && isOpen ? (
                <SidebarMenuSub>
                  {item.items!.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      {subItem.title === "Switch Theme" ? (
                        <SidebarMenuSubButton asChild>
                          <button
                            type="button"
                            onClick={toggleTheme}
                            className="flex w-full items-center justify-between text-left"
                          >
                            <span>{subItem.title}</span>
                          </button>
                        </SidebarMenuSubButton>
                      ) : (
                        <SidebarMenuSubButton asChild>
                          <a href={subItem.url}>
                            <span>{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      )}
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              ) : null}
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
