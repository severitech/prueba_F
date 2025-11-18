// api/pagos.service.ts - VERSIÓN ACTUALIZADA
import { DatosPago, RespuestaCheckout, RespuestaVerificacionPago } from "@/interface/carrito"
import { utilidadesAutenticacion } from "@/lib/autenticacion"

interface DatosPagoConUsuario extends DatosPago {
  usuario_id?: number
}

class ServicioPagos {
  private urlBase = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-de7b5.up.railway.app/api'

  /**
   * Crear sesión de checkout en Stripe
   */
  async crearCheckoutSession(
    datosPago: DatosPago, 
    usuarioId?: number
  ): Promise<RespuestaCheckout> {
    try {
      const datosEnvio: DatosPagoConUsuario = {
        ...datosPago,
        usuario_id: usuarioId
      }

      // Loguear token y headers para depuración
      const token = utilidadesAutenticacion.obtenerToken()
      const headers = {
        'Content-Type': 'application/json',
        ...utilidadesAutenticacion.obtenerHeadersAutenticacion()
      }

      console.log('🔎 crearCheckoutSession: token en localStorage ->', token)
      console.log('🔎 crearCheckoutSession: headers enviados ->', headers)
      console.log('🔎 crearCheckoutSession: payload ->', datosEnvio)

      // Validación temprana: si no hay token, informar claramente
      if (!token) {
        throw new Error('No hay token de autenticación en localStorage. Por favor inicia sesión.')
      }

      const respuesta = await fetch(`${this.urlBase}/crear-checkout-session/`, {
        method: 'POST',
        headers,
        // ✅ TEMPORAL: Quita credentials hasta que arregles CORS
        // credentials: 'include', 
        body: JSON.stringify(datosEnvio)
      })

      if (!respuesta.ok) {
        const errorData = await respuesta.json()
        throw new Error(errorData.error || `Error ${respuesta.status}: ${respuesta.statusText}`)
      }

      return await respuesta.json()
    } catch (error) {
      console.error('❌ Error creando checkout session:', error)
      throw error
    }
  }

  /**
   * Verificar estado de un pago
   */
  async verificarPago(
    sessionId: string, 
    usuarioId?: number
  ): Promise<RespuestaVerificacionPago> {
    try {
      const url = usuarioId 
        ? `${this.urlBase}/verificar-pago/?session_id=${sessionId}&usuario_id=${usuarioId}`
        : `${this.urlBase}/verificar-pago/?session_id=${sessionId}`

      const headers = {
        'Content-Type': 'application/json',
        ...utilidadesAutenticacion.obtenerHeadersAutenticacion()
      }

      console.log('🔎 verificarPago: headers enviados ->', headers)

      const respuesta = await fetch(url, {
        method: 'GET',
        headers,
        // ✅ TEMPORAL: Quita credentials hasta que arregles CORS
        // credentials: 'include'
      })

      // Log para depuración (cliente)
      const tokenCheck = utilidadesAutenticacion.obtenerToken()
      console.log('🔎 verificarPago: token en localStorage ->', tokenCheck)
      console.log('🔎 verificarPago: url ->', url)

      if (!respuesta.ok) {
        const errorData = await respuesta.json()
        throw new Error(errorData.error || `Error ${respuesta.status}: ${respuesta.statusText}`)
      }

      const resultado = await respuesta.json()
      
      // ✅ NUEVO: LIMPIAR CARRITO SI EL PAGO FUE EXITOSO
      if (resultado.pago_exitoso) {
        this.limpiarCarritoLocalStorage()
        console.log('✅ Pago exitoso - Carrito limpiado automáticamente')
      }

      return resultado
    } catch (error) {
      console.error('❌ Error verificando pago:', error)
      throw error
    }
  }

  /**
   * NUEVO: Limpiar carrito del localStorage
   */
  private limpiarCarritoLocalStorage(): void {
    try {
      if (typeof window === 'undefined') return
      
      // Guardar info de debug antes de limpiar
      const carritoAntes = localStorage.getItem('carrito')
      console.log('🛒 Carrito antes de limpiar:', carritoAntes)
      
      // Eliminar el carrito del localStorage
      localStorage.removeItem('carrito')
      localStorage.removeItem('carrito_timestamp')
      sessionStorage.removeItem('carrito')
      
      // Verificar que se limpió
      const carritoDespues = localStorage.getItem('carrito')
      console.log('🛒 Carrito después de limpiar:', carritoDespues)
      console.log('✅ Carrito limpiado exitosamente del localStorage')
      
    } catch (error) {
      console.warn('⚠️ No se pudo limpiar el carrito del localStorage:', error)
    }
  }

  /**
   * NUEVO: Obtener carrito actual del localStorage (para debug)
   */
  obtenerCarritoLocal(): any[] {
    try {
      if (typeof window === 'undefined') return []
      
      const carrito = localStorage.getItem('carrito')
      return carrito ? JSON.parse(carrito) : []
    } catch {
      return []
    }
  }

  /**
   * NUEVO: Método público para limpiar carrito manualmente
   */
  limpiarCarrito(): void {
    this.limpiarCarritoLocalStorage()
  }

  /**
   * NUEVO: Verificar estado del carrito (para debug)
   */
  verificarEstadoCarrito(): { existe: boolean; items: any[]; cantidad: number } {
    try {
      const carrito = this.obtenerCarritoLocal()
      return {
        existe: carrito.length > 0,
        items: carrito,
        cantidad: carrito.length
      }
    } catch {
      return { existe: false, items: [], cantidad: 0 }
    }
  }
}

export const servicioPagos = new ServicioPagos()