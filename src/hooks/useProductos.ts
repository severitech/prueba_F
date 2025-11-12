// hooks/useProductos.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Producto,
  DatosCrearProducto,
  DatosActualizarProducto,
  FiltrosProductos,
} from "@/interface/productos";
import { servicioProductos } from "@/api/productos.service";

/**
 * Hook personalizado para manejar productos en componentes React
 */
export function useProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltrosProductos>({});

  /**
   * Cargar productos con filtros actuales
   */
  const cargarProductos = useCallback(
    async (nuevosFiltros: FiltrosProductos = {}) => {
      setCargando(true);
      setError(null);

      try {
        const resultado = await servicioProductos.obtenerProductos(
          nuevosFiltros
        );

        if (resultado.exito) {
          setProductos(resultado.datos);
          setFiltros(nuevosFiltros);
        } else {
          setError(resultado.mensaje || "Error al cargar productos");
        }
      } catch (err) {
        console.error("Error en cargarProductos:", err);
        setError("Error de conexión al cargar productos");
      } finally {
        setCargando(false);
      }
    },
    []
  ); // ❌ QUITAMOS la dependencia de filtros

  /**
   * Crear nuevo producto
   */
  const crearProducto = useCallback(
    async (datosProducto: DatosCrearProducto) => {
      setCargando(true);

      try {
        const resultado = await servicioProductos.crearProducto(datosProducto);

        if (resultado.exito) {
          // Recargar productos para incluir el nuevo
          await cargarProductos(filtros);
          return resultado;
        } else {
          return resultado;
        }
      } catch (err) {
        return {
          exito: false,
          mensaje: "Error inesperado al crear producto",
        };
      } finally {
        setCargando(false);
      }
    },
    [cargarProductos, filtros]
  );

  /**
   * Actualizar producto existente
   */
  const actualizarProducto = useCallback(
    async (datosProducto: DatosActualizarProducto) => {
      setCargando(true);

      try {
        const resultado = await servicioProductos.actualizarProducto(
          datosProducto
        );

        if (resultado.exito) {
          // Actualizar el producto en la lista local
          setProductos((prev) =>
            prev.map((producto) =>
              producto.id === datosProducto.id ? resultado.datos : producto
            )
          );
          return resultado;
        } else {
          return resultado;
        }
      } catch (err) {
        return {
          exito: false,
          mensaje: "Error inesperado al actualizar producto",
        };
      } finally {
        setCargando(false);
      }
    },
    []
  );

  /**
   * Eliminar producto
   */
  const eliminarProducto = useCallback(async (id: number) => {
    setCargando(true);

    try {
      const resultado = await servicioProductos.eliminarProducto(id);

      if (resultado.exito) {
        // Remover el producto de la lista local
        setProductos((prev) => prev.filter((producto) => producto.id !== id));
        return resultado;
      } else {
        return resultado;
      }
    } catch (err) {
      return {
        exito: false,
        mensaje: "Error inesperado al eliminar producto",
      };
    } finally {
      setCargando(false);
    }
  }, []);

  /**
   * Buscar productos
   */
  const buscarProductos = useCallback(
    async (termino: string): Promise<Producto[]> => {
      try {
        const resultado = await servicioProductos.buscarProductos(termino);
        return resultado.exito ? resultado.datos : [];
      } catch (err) {
        console.error("Error buscando productos:", err);
        return [];
      }
    },
    []
  );

  // Cargar productos automáticamente al montar el hook - SOLO UNA VEZ
  useEffect(() => {
    let mounted = true;

    const cargarDatosIniciales = async () => {
      if (mounted) {
        await cargarProductos({});
      }
    };

    cargarDatosIniciales();

    return () => {
      mounted = false;
    };
  }, [cargarProductos]);

  return {
  productos,
  cargando,
  error,
  filtros: filtros || {}, // ✅ Asegura que siempre hay un objeto
  cargarProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  buscarProductos,
  setFiltros
}
}
