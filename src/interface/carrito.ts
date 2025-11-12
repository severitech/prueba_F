// types/index.ts

import { Producto } from "./productos";


export interface ItemCarrito extends Producto {
  cantidad: number;
}

export interface ContextoCarrito {
  carrito: ItemCarrito[];
  contadorCarrito: number;
  agregarAlCarrito: (producto: Producto) => void;
  eliminarDelCarrito: (idProducto: number) => void;
  actualizarCantidad: (idProducto: number, nuevaCantidad: number) => void;
  vaciarCarrito: () => void;
  calcularTotal: () => number;
}



export interface ItemCarritoPago {
  producto_id: number
  nombre: string
  precio: number
  cantidad: number
}

export interface DatosPago {
  descripcion: string
  items: ItemCarritoPago[]
}

export interface RespuestaCheckout {
  checkout_url: string
  session_id: string
  pago_id?: number
  mensaje: string
}

export interface RespuestaVerificacionPago {
  pago_exitoso: boolean
  venta_id?: number
  pago_id?: number
  total?: number
  mensaje?: string
  cliente_email?: string
  cliente_nombre?: string
}