// api/autenticacion.service.ts
import { DatosLogin, DatosRegistro, RespuestaAutenticacion, Usuario } from '@/interface/auth'
import { utilidadesAutenticacion } from '@/lib/autenticacion'

/**
 * Servicio para manejar todas las operaciones de autenticación con el backend
 */
class ServicioAutenticacion {
  // URL base de la API - se puede configurar con variables de entorno
  private urlBase = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-de7b5.up.railway.app/api'

  /**
   * Inicia sesión con email y password
   */
  async iniciarSesion(datosLogin: DatosLogin): Promise<RespuestaAutenticacion> {
    try {
      console.log('📤 Enviando solicitud de login...')
      
      const respuesta = await fetch(`${this.urlBase}/authz/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosLogin),
      })

      const datos = await respuesta.json()

      // Si la respuesta es exitosa y contiene token
      if (respuesta.ok && datos.token) {
        // Guardar en localStorage
        utilidadesAutenticacion.guardarToken(datos.token)
        utilidadesAutenticacion.guardarUsuario(datos.user)
        
        console.log('✅ Login exitoso')
        
        return {
          exito: true,
          mensaje: 'Inicio de sesión exitoso',
          token: datos.token,
          usuario: datos.user
        }
      } else {
        // Manejar errores del servidor
        const mensajeError = datos.detail || datos.mensaje || datos.error || 'Error en el inicio de sesión'
        console.log('❌ Error del servidor:', mensajeError)
        return {
          exito: false,
          mensaje: mensajeError
        }
      }
    } catch (error) {
      console.error('❌ Error en inicio de sesión:', error)
      return {
        exito: false,
        mensaje: 'Error de conexión con el servidor'
      }
    }
  }

  /**
   * Registra un nuevo usuario
   */
  async registrarUsuario(datosRegistro: DatosRegistro): Promise<RespuestaAutenticacion> {
    try {
      // Validar que las contraseñas coincidan
      if (datosRegistro.password !== datosRegistro.confirmarPassword) {
        return {
          exito: false,
          mensaje: 'Las contraseñas no coinciden'
        }
      }

      console.log('📤 Enviando solicitud de registro...')
      
      const respuesta = await fetch(`${this.urlBase}/authz/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosRegistro),
      })

      const datos = await respuesta.json()

      if (respuesta.ok) {
        return {
          exito: true,
          mensaje: 'Registro exitoso. Ya puedes iniciar sesión.'
        }
      } else {
        const mensajeError = datos.detail || datos.mensaje || datos.error || 'Error en el registro'
        return {
          exito: false,
          mensaje: mensajeError,
          errores: datos.errores
        }
      }
    } catch (error) {
      console.error('❌ Error en registro:', error)
      return {
        exito: false,
        mensaje: 'Error de conexión con el servidor'
      }
    }
  }

  /**
   * Cierra la sesión del usuario
   */
  async cerrarSesion(): Promise<void> {
    try {
      const token = utilidadesAutenticacion.obtenerToken()
      
      // Si hay token, notificar al servidor del logout
      if (token) {
        await fetch(`${this.urlBase}/authz/logout/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        })
      }
    } catch (error) {
      console.error('Error en cierre de sesión:', error)
    } finally {
      // Siempre limpiar localStorage
      utilidadesAutenticacion.limpiarAutenticacion()
    }
  }

  /**
   * Obtiene el usuario actual desde localStorage
   */
  async obtenerUsuarioActual(): Promise<Usuario | null> {
    const usuario = utilidadesAutenticacion.obtenerUsuario()
    
    // Solo retornar usuario si hay token válido
    if (usuario && utilidadesAutenticacion.obtenerToken()) {
      return usuario
    }
    
    return null
  }

  /**
   * Genera headers para peticiones API que requieren autenticación
   */
  obtenerHeadersAutenticacion(): HeadersInit {
    return utilidadesAutenticacion.obtenerHeadersAutenticacion()
  }
}

// Exportamos una instancia única del servicio
export const servicioAutenticacion = new ServicioAutenticacion()