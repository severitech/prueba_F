"use client";

import * as React from "react";
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconNotification,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
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

import { useAutenticacion } from "@/hooks/useAuth";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Productos",
      url: "/dashboard/productos",
      icon: IconListDetails,
    },
    {
      title: "Garantia",
      url: "/dashboard/garantia",
      icon: IconChartBar,
    },
    {
      title: "Promoción",
      url: "/dashboard/promocion",
      icon: IconFolder,
    },
    {
      title: "Mantenimiento",
      url: "/dashboard/mantenimiento",
      icon: IconUsers,
    },
  ],
 
  navSecondary: [
    {
      title: "Notificaciones Movil",
      url: "/dashboard/notificaciones",
      icon: IconNotification,
    },
    
  ],
  
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { usuario, cargando, autenticado } = useAutenticacion();

  if (cargando) {
    return (
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarFooter>
          <div className="p-2 text-sm text-muted-foreground">
            Cargando usuario...
          </div>
        </SidebarFooter>
      </Sidebar>
    );
  }

  if (!autenticado || !usuario) {
    return (
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarFooter>
          <div className="p-2 text-sm text-muted-foreground">
            No autenticado
          </div>
        </SidebarFooter>
      </Sidebar>
    );
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
        {/* <span>{JSON.stringify(usuario)}</span> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser 
          usuario={usuario} 
        />
      </SidebarFooter>
    </Sidebar>
  );
}
