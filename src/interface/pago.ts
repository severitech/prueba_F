export interface Pago {
  id: number
  monto: number
  fecha: string
  stripe_key: string | null
  venta: number
}