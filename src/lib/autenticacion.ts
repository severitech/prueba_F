// lib/utils/auth.utils.ts
import { Usuario } from "@/interface/auth"

/**
 * Clase de utilidades para manejar la autenticación en el cliente
 * Se encarga de guardar, obtener y limpiar datos de autenticación en localStorage
 */
class UtilidadesAutenticacion {
  /**
   * Guarda el token de autenticación en localStorage
   * @param token - Token JWT recibido del servidor
   */
  guardarToken(token: string): void {
    // Verifica que estamos en el navegador (no en servidor)
    if (typeof window !== 'undefined') {
      localStorage.setItem('tokenAutenticacion', token)
      console.log('🔐 Token guardado en localStorage')
    }
  }

  /**
   * Obtiene el token de autenticación desde localStorage
   * @returns Token o null si no existe
   */
  obtenerToken(): string | null {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('tokenAutenticacion')
      console.log('🔑 Token obtenido:', token ? 'Sí' : 'No')
      return token
    }
    return null
  }

  /**
   * Guarda los datos del usuario en localStorage
   * @param usuario - Objeto con información del usuario
   */
  guardarUsuario(usuario: Usuario): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('usuario', JSON.stringify(usuario))
      console.log('👤 Usuario guardado en localStorage:', usuario.email)
    }
  }

  /**
   * Obtiene los datos del usuario desde localStorage
   * @returns Usuario o null si no existe
   */
  obtenerUsuario(): Usuario | null {
    if (typeof window !== 'undefined') {
      const usuarioString = localStorage.getItem('usuario')
      const usuario = usuarioString ? JSON.parse(usuarioString) : null
      console.log('👤 Usuario obtenido:', usuario ? usuario.email : 'No')
      return usuario
    }
    return null
  }

  /**
   * Limpia todos los datos de autenticación (logout)
   */
  limpiarAutenticacion(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tokenAutenticacion')
      localStorage.removeItem('usuario')
      console.log('🧹 Autenticación limpiada de localStorage')
    }
  }

  /**
   * Verifica si el usuario está autenticado
   * @returns true si hay token, false si no
   */
  estaAutenticado(): boolean {
    const autenticado = !!this.obtenerToken()
    console.log('🔐 Está autenticado:', autenticado)
    return autenticado
  }

  /**
   * Genera los headers para peticiones API con autenticación
   * @returns Objeto con headers para fetch
   */
  obtenerHeadersAutenticacion(): HeadersInit {
    const token = this.obtenerToken()
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }
    
    // Si hay token, añade header de autorización
    if (token) {
      headers['Authorization'] = `Token ${token}`
    }
    
    console.log('📨 Headers de autenticación:', headers)
    return headers
  }
}

// Exportamos una instancia única (singleton)
export const utilidadesAutenticacion = new UtilidadesAutenticacion()