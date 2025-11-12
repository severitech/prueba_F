"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import {
  Search,
  ShoppingCart,
  User,
  Settings,
  Package,
  Users,
  BarChart3,
  BookDashedIcon,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { useAutenticacion } from "@/hooks/useAuth";
import { usarCarrito } from "@/context/CarritoContexto"; // Importar el hook del carrito

export default function BarraDeNavegacion() {
  const { autenticado, usuario, cerrarSesion } = useAutenticacion();
  const { contadorCarrito } = usarCarrito(); // Obtener el contador del carrito

  // Determinar si es administrador
  const esAdministrador = usuario?.perfil.rol === "Administrador";
  const esCliente =
    usuario?.perfil.rol === "Cliente" || (!usuario?.perfil.rol && autenticado); // Por defecto cliente si no tiene rol

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex items-center space-x-4 justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo y Navegación Principal */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="text-2xl font-bold text-primary">
            MiTienda
          </Link>

          <NavigationMenu>
            <NavigationMenuList>
              {/* Menú Productos - Visible para todos */}
              <NavigationMenuItem>
                <NavigationMenuTrigger>Productos</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-primary/10 to-primary/5 p-6 no-underline outline-none focus:shadow-md"
                          href="/productos"
                        >
                          <Package className="h-8 w-8 mb-2" />
                          <div className="mb-2 mt-2 text-lg font-medium">
                            Todos los Productos
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Explora nuestra amplia gama de productos
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <ListItem
                      href="/productos?categoria=electronica"
                      title="Electrónicos"
                    >
                      Los mejores dispositivos electrónicos
                    </ListItem>
                    <ListItem href="/productos?categoria=hogar" title="Hogar">
                      Electrodomésticos para tu hogar
                    </ListItem>
                    <ListItem
                      href="/productos?categoria=tecnologia"
                      title="Tecnología"
                    >
                      Lo último en tecnología
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  href="/mis-pedidos"
                >
                  Mis Pedidos
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Menú común para todos */}
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  href="/nosotros"
                >
                  Nosotros
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  href="/contacto"
                >
                  Contacto
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Búsqueda y Acciones del Usuario */}
        <div className="flex items-center space-x-3">
          {/* Barra de búsqueda */}
          <form className="relative hidden sm:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar productos..."
              className="pl-8 w-64"
            />
          </form>

          {/* Carrito de compras - Solo para clientes */}
          <Button size="icon" asChild className="relative">
            <Link href="/carrito">
              <ShoppingCart className="h-5 w-5" />
              {/* Contador del carrito */}
              {contadorCarrito > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {contadorCarrito > 99 ? '99+' : contadorCarrito}
                </span>
              )}
              <span className="sr-only">Carrito de compras</span>
            </Link>
          </Button>

          {/* Menú Administración - Solo para administradores */}
          
          {/* Perfil del usuario */}
          {autenticado ? (
            <div className="flex items-center space-x-2">
              {/* Botón de perfil con dropdown */}
              <div className="relative group">
                <Button variant="outline" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {usuario?.first_name || "Usuario"}
                  </span>
                  <span className="hidden sm:inline text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full ml-1">
                    {esAdministrador ? "Admin" : "Cliente"}
                  </span>
                </Button>

                {/* Dropdown menu */}
                <div className="absolute right-0 top-full mt-1 w-48 bg-background border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2">
                    <div className="px-3 py-2 text-sm border-b">
                      <p className="font-medium">
                        {usuario?.first_name} {usuario?.last_name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {usuario?.email}
                      </p>
                    </div>

                    <Link
                      href="/perfil"
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-md w-full text-left"
                    >
                      <User className="h-4 w-4" />
                      Mi Perfil
                    </Link>

                    {esCliente && (
                      <Link
                        href="/mis-pedidos"
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-md w-full text-left"
                      >
                        <Package className="h-4 w-4" />
                        Mis Pedidos
                      </Link>
                    )}

                    {esAdministrador && (
                      <a
                        href="/dashboard"
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-md w-full text-left"
                      >
                        <Settings className="h-4 w-4" />
                        Panel Admin
                      </a>
                    )}

                    <button 
                      onClick={cerrarSesion}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-md w-full text-left text-red-600"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Botones para usuarios no autenticados */
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Iniciar Sesión</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/registro">Registrarse</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

// Componente ListItem mejorado con soporte para iconos
const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { icon?: React.ReactNode }
>(({ className, title, children, icon, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "flex items-center gap-3 select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <div className="flex-1">
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-1">
              {children}
            </p>
          </div>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";