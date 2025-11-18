// api/pagos.service.ts - VERSIÓN ACTUALIZADA
import { DatosPago, RespuestaCheckout, RespuestaVerificacionPago } from "@/interface/carrito"
import { utilidadesAutenticacion } from "@/lib/autenticacion"

interface DatosPagoConUsuario extends DatosPago {
  usuario_id?: number
}

class ServicioPagos {
  private urlBase = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-de7b5.up.railway.app/api'

  /**
   * Limpiar carrito del localStorage
   */
  private limpiarCarritoLocalStorage(): void {
    try {
      // Eliminar el carrito del localStorage
      localStorage.removeItem('carrito')
      localStorage.removeItem('carrito_timestamp')
      
      console.log('🛒 Carrito limpiado del localStorage')
      
      // También puedes limpiar sessionStorage si lo usas
      sessionStorage.removeItem('carrito')
      
    } catch (error) {
      console.warn('⚠️ No se pudo limpiar el carrito del localStorage:', error)
    }
  }

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

      const token = utilidadesAutenticacion.obtenerToken()
      const headers = {
        'Content-Type': 'application/json',
        ...utilidadesAutenticacion.obtenerHeadersAutenticacion()
      }

      console.log('🔎 crearCheckoutSession: token en localStorage ->', token)
      console.log('🔎 crearCheckoutSession: headers enviados ->', headers)
      console.log('🔎 crearCheckoutSession: payload ->', datosEnvio)

      if (!token) {
        throw new Error('No hay token de autenticación en localStorage. Por favor inicia sesión.')
      }

      const respuesta = await fetch(`${this.urlBase}/crear-checkout-session/`, {
        method: 'POST',
        headers,
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
   * Verificar estado de un pago y limpiar carrito si es exitoso
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
      })

      const tokenCheck = utilidadesAutenticacion.obtenerToken()
      console.log('🔎 verificarPago: token en localStorage ->', tokenCheck)
      console.log('🔎 verificarPago: url ->', url)

      if (!respuesta.ok) {
        const errorData = await respuesta.json()
        throw new Error(errorData.error || `Error ${respuesta.status}: ${respuesta.statusText}`)
      }

      const resultado = await respuesta.json()
      
      // ✅ LIMPIAR CARRITO SI EL PAGO FUE EXITOSO
      if (resultado.pago_exitoso) {
        this.limpiarCarritoLocalStorage()
        console.log('✅ Pago exitoso - Carrito limpiado')
      }

      return resultado
    } catch (error) {
      console.error('❌ Error verificando pago:', error)
      throw error
    }
  }

  /**
   * Método público para limpiar carrito (por si necesitas usarlo en otros lugares)
   */
  limpiarCarrito(): void {
    this.limpiarCarritoLocalStorage()
  }
}

export const servicioPagos = new ServicioPagos()