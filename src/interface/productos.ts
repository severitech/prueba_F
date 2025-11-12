// lib/types/productos.types.ts

import { SubCategoria } from "./subcategoria";

/**
 * Interfaz para un producto
 */
export interface Producto {
  id: number;
  descripcion: string;
  precio: number;
  stock: number;
  imagenes: string[];
  estado: string;
  subcategoria: SubCategoria;
}
/**
 * Datos para crear un producto
 */
export interface DatosCrearProducto {
  descripcion: string
  precio: number
  stock: number
  estado: string
  subcategoria_id: number
  imagenes?: File[]
}

/**
 * Datos para actualizar un producto
 */
export interface DatosActualizarProducto extends Partial<DatosCrearProducto> {
  id: number
}

/**
 * Respuesta de la API para productos
 */
export interface RespuestaProductos {
  exito: boolean
  datos: Producto[]
  mensaje?: string
  total?: number
}

export interface RespuestaProducto {
  exito: boolean
  datos: Producto
  mensaje?: string
}

/**
 * Filtros para productos
 */
export interface FiltrosProductosInterface {
  buscar?: string;
  categoria?: number;
  subcategoria?: number;
  estado?: string;
  precio_min?: number;
  precio_max?: number;
  ordenar_por?: string;
  orden?: 'asc' | 'desc';
  marca?: string;
  limite: number;
  pagina: number;
}