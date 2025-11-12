"use client"

import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Usuario } from '@/interface/auth'

// Definir la interfaz para las props
interface NavUserProps {
  usuario: Usuario
}

export function NavUser({ usuario }: NavUserProps) {
  const { isMobile } = useSidebar()

  // Extraer iniciales para el avatar
  const obtenerIniciales = (first_name: string, last_name: string) => {
    return first_name.charAt(0).toUpperCase(), last_name.charAt(0).toUpperCase()
  }

  // Obtener nombre para mostrar (usar email si no hay nombre específico)
  const obtenerNombreMostrar = () => {
    // Si tu backend devuelve un nombre en el perfil, úsalo
    // Si no, usa el email o extrae el nombre del email
    return (usuario.first_name+' '+ usuario.last_name)  || usuario.email.split('@')[0]
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage 
                  src={`https://ui-avatars.com/api/?name=${obtenerNombreMostrar()}&background=random`} 
                  alt={obtenerNombreMostrar()} 
                />
                <AvatarFallback className="rounded-lg">
                  {obtenerIniciales(usuario.first_name,usuario.last_name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {obtenerNombreMostrar()}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {usuario.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage 
                    src={`https://ui-avatars.com/api/?name=${obtenerNombreMostrar()}&background=random`} 
                    alt={obtenerNombreMostrar()} 
                  />
                  <AvatarFallback className="rounded-lg">
                    {obtenerIniciales(usuario.first_name,usuario.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {obtenerNombreMostrar()}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {usuario.email}
                  </span>
                  <span className="text-muted-foreground truncate text-xs capitalize">
                    {usuario.perfil.rol?.toLowerCase()}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <IconUserCircle className="mr-2" />
                Mi Cuenta
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconCreditCard className="mr-2" />
                Facturación
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconNotification className="mr-2" />
                Notificaciones
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <IconLogout className="mr-2" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}