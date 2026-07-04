"use client";

import * as React from "react";
import Link from "next/link";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

type DashboardShellProps = {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  isAdmin?: boolean;
  children: React.ReactNode;
};

export function DashboardShell({ user, isAdmin = false, children }: DashboardShellProps) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        variant="inset"
        isAdmin={isAdmin}
        user={{
          name: user.name,
          email: user.email,
          avatar: user.image ?? "",
        }}
      />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
