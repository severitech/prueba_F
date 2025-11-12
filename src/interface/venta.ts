import { Usuario } from "./auth"
import { Pago } from "./pago"
import { Producto } from "./productos"

export interface DetalleVenta {
  id: number
  venta: number
  producto: Producto
  cantidad: number
  subtotal: number
}



export interface Venta {
  id: number
  fecha: string
  total: number
  estado: 'Pendiente' | 'Pagado' | 'Cancelado'
  usuario: Usuario
  detalles?: DetalleVenta[]
  pagos?: Pago[]
}

export interface RespuestaVentas {
  count: number
  next: string | null
  previous: string | null
  results: Venta[]
}
