// components/TarjetaDeProductos.tsx
"use client";

import {
  CardFlip,
  CardFlipFront,
  CardFlipBack,
  CardFlipHeader,
  CardFlipFooter,
  CardFlipTitle,
  CardFlipDescription,
  CardFlipContent,
} from "@/components/ui/card-flip";
import { Button } from "@/components/ui/button";
import { Box, ShoppingCart, Star, RefreshCw } from "lucide-react";
import { useProductos } from "@/hooks/useProductos";
import { FiltrosProductosInterface, Producto } from "@/interface/productos";
import { useState } from "react";
import FiltrosProductos from "../(public)/productos/components/FiltroProductos";
import { usarCarrito } from "@/context/CarritoContexto";
import Image from "next/image";

// Datos de ejemplo para categorías y subcategorías
const categoriasEjemplo = [
  { id: 2, descripcion: "Cocina" },
  { id: 3, descripcion: "Lavandería" },
  { id: 4, descripcion: "Cuidado del hogar" },
  { id: 5, descripcion: "Entretenimiento y Tecnología" },
  { id: 6, descripcion: "Climatización" },
  { id: 7, descripcion: "Cuidado personal" },
  { id: 8, descripcion: "Cocina y Preparación de Bebidas" },
  { id: 9, descripcion: "Electrodomésticos inteligentes" },
  { id: 10, descripcion: "Pequeños electrodomésticos" },
];

const subcategoriasEjemplo = [
  { id: 1, descripcion: "Hornos", categoria: { id: 2, descripcion: "Cocina" } },
  {
    id: 2,
    descripcion: "Microondas",
    categoria: { id: 2, descripcion: "Cocina" },
  },
  {
    id: 3,
    descripcion: "Cocinas",
    categoria: { id: 2, descripcion: "Cocina" },
  },
  {
    id: 4,
    descripcion: "Batidoras y Licuadoras",
    categoria: { id: 2, descripcion: "Cocina" },
  },
  {
    id: 5,
    descripcion: "Freidoras",
    categoria: { id: 2, descripcion: "Cocina" },
  },
  {
    id: 6,
    descripcion: "Lavadoras",
    categoria: { id: 3, descripcion: "Lavandería" },
  },
  {
    id: 14,
    descripcion: "Televisores",
    categoria: { id: 5, descripcion: "Entretenimiento y Tecnología" },
  },
];

interface Props {
  cantidadProductos?: number | null;
}

export default function TarjetaDeProductos({
  cantidadProductos = null,
}: Props) {
  const { productos, cargando, error, filtros, cargarProductos } =
    useProductos();

  // Asegurar que filtros nunca sea undefined
  const filtrosSeguros = filtros || {};

  // Aplicar límite de cantidad si se especifica
  const productosMostrados = cantidadProductos
    ? productos.slice(0, cantidadProductos)
    : productos;

  const handleFiltrosChange = (nuevosFiltros: FiltrosProductosInterface) => {
    cargarProductos(nuevosFiltros);
  };

  if (cargando && productos.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Cargando productos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">Error: {error}</p>
        <Button
          onClick={() =>
            cargarProductos({ limite: 10, pagina: 1 }) // Valores predeterminados para cumplir con la interfaz
          }
          variant="outline"
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      {/* Filtros */}
      {!cantidadProductos && (
        <FiltrosProductos
          filtros={filtrosSeguros}
          onFiltrosChange={handleFiltrosChange}
          categorias={categoriasEjemplo}
          subcategorias={subcategoriasEjemplo}
        />
      )}

      {/* Información de resultados */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          {productosMostrados.length}{" "}
          {productosMostrados.length === 1
            ? "producto encontrado"
            : "productos encontrados"}
          {filtrosSeguros.buscar && ` para "${filtrosSeguros.buscar}"`}
        </p>
      </div>

      {/* Grid de productos */}
      {productosMostrados.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No se encontraron productos con los filtros aplicados
          </p>
          <Button onClick={() => cargarProductos({ limite: 10, pagina: 1 })} variant="outline">
            Mostrar todos los productos
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productosMostrados.map((producto) => (
            <ProductoFlipCard key={producto.id} producto={producto} />
          ))}
        </div>
      )}
    </div>
  );
}

// Componente individual para cada producto
function ProductoFlipCard({ producto }: { producto: Producto }) {
  const [errorImagen, setErrorImagen] = useState(false);
  const [cargandoImagen, setCargandoImagen] = useState(true);
  const { agregarAlCarrito } = usarCarrito();

  const imagenPrincipal =
    producto.imagenes && producto.imagenes.length > 0 && !errorImagen
      ? producto.imagenes[0]
      : "/placeholder-product.jpg";

  const manejarErrorImagen = () => {
    console.warn(`Error cargando imagen: ${imagenPrincipal}`);
    setErrorImagen(true);
    setCargandoImagen(false);
  };

  const manejarCargaImagen = () => {
    setCargandoImagen(false);
  };

  const manejarAgregarCarrito = () => {
    // console.log("Agregar al carrito:", producto);
    agregarAlCarrito(producto);
    alert(`${producto.descripcion} agregado al carrito!`);
    
  };
  const esMasVendido = producto.stock > 50;

  return (
    <CardFlip className="w-full select-none h-[540px]">
      {/* --- Lado Frontal de la Tarjeta --- */}
      <CardFlipFront className="flex flex-col justify-between h-full">
        {/* Sección de imagen */}
        <div className="mx-4 mt-4 h-52 w-[calc(100%-2rem)] rounded-lg overflow-hidden bg-muted relative">
          {cargandoImagen && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          )}
          <Image
            src={imagenPrincipal}
            alt={producto.descripcion}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              cargandoImagen ? "opacity-0" : "opacity-100"
            }`}
            onError={manejarErrorImagen}
            onLoad={manejarCargaImagen}
            loading="lazy"
            width={500} // Ajustar según sea necesario
            height={500} // Ajustar según sea necesario
          />
        </div>

        {/* Badges y rating */}
        <div className="flex items-center justify-between px-4 mt-3">
          {esMasVendido && (
            <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              Más Vendido
            </span>
          )}
          <div className="flex items-center space-x-1 text-sm font-medium text-primary/70">
            <Star className="w-4 h-4 fill-primary text-primary" />
            <span>4.5 (126)</span>
          </div>
        </div>

        {/* Información del producto */}
        <CardFlipHeader className="px-4 mt-3">
          <CardFlipTitle className="line-clamp-2 text-base leading-tight min-h-10">
            {producto.descripcion}
          </CardFlipTitle>
          <p className="text-xl font-bold mt-2">
            Bs. {producto.precio.toLocaleString()}
          </p>
          <div className="flex items-center justify-between text-sm mt-3">
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                producto.estado === "Activo"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {producto.estado}
            </span>
            <span className="text-muted-foreground">
              Stock: {producto.stock}
            </span>
          </div>
        </CardFlipHeader>

        {/* Botones */}
        <CardFlipFooter className="flex gap-3 items-stretch px-4 mt-4 mb-4">
          <button className="flex-1 bg-primary py-2 text-primary-foreground px-4 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center text-sm font-medium">
            Ver Detalles
          </button>

          <button
            className="w-12 bg-primary py-2 text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={manejarAgregarCarrito}
            disabled={producto.stock === 0 || producto.estado !== "Activo"}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </CardFlipFooter>
      </CardFlipFront>

      {/* --- Lado Trasero de la Tarjeta --- */}
      <CardFlipBack className="h-full flex flex-col">
        <CardFlipHeader className="px-4 pt-4">
          <CardFlipTitle className="line-clamp-2 text-base leading-tight">
            {producto.descripcion}
          </CardFlipTitle>
          <CardFlipDescription className="text-sm mt-1">
            {producto.subcategoria?.descripcion} •{" "}
            {producto.subcategoria?.categoria?.descripcion}
          </CardFlipDescription>
        </CardFlipHeader>

        <CardFlipContent className="flex-1 overflow-auto space-y-3 px-4 py-2">
          <div className="flex items-start gap-3">
            <Box className="text-primary w-5 h-5 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm">Descripción</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {producto.descripcion}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Box className="text-primary w-5 h-5 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm">Precio</h4>
              <p className="text-sm text-muted-foreground">
                Bs. {producto.precio.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Box className="text-primary w-5 h-5 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm">Disponibilidad</h4>
              <p className="text-sm text-muted-foreground">
                {producto.stock > 0
                  ? `${producto.stock} unidades disponibles`
                  : "Agotado"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Box className="text-primary w-5 h-5 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm">Estado</h4>
              <p className="text-sm text-muted-foreground">
                {producto.estado === "Activo"
                  ? "Disponible para venta"
                  : "No disponible"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Box className="text-primary w-5 h-5 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm">Categoría</h4>
              <p className="text-sm text-muted-foreground">
                {producto.subcategoria?.descripcion} -{" "}
                {producto.subcategoria?.categoria?.descripcion}
              </p>
            </div>
          </div>
        </CardFlipContent>

        <CardFlipFooter className="border-t pt-3 px-4 pb-4">
          <p className="text-xs text-muted-foreground text-center">
            {producto.stock > 0
              ? "Envío exprés gratuito por compras mayores a Bs. 2,999"
              : "Producto temporalmente agotado"}
          </p>
        </CardFlipFooter>
      </CardFlipBack>
    </CardFlip>
  );
}
