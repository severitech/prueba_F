// interface/auth.ts

/**
 * Interfaz para el perfil de usuario
 */
export interface Perfil {
  id: number
  user: string
  rol: string
  telefono: string | null
}

/**
 * Interfaz principal del usuario
 */
export interface Usuario {
  id: number
  email: string
  first_name: string
  last_name: string
  perfil: Perfil
}

/**
 * Datos necesarios para iniciar sesión
 */
export interface DatosLogin {
  email: string
  password: string
}

/**
 * Datos necesarios para registrar un nuevo usuario
 */
export interface DatosRegistro {
  nombre: string
  apellido: string
  email: string
  password: string
  confirmarPassword: string
}

/**
 * Respuesta de las operaciones de autenticación
 */
export interface RespuestaAutenticacion {
  exito: boolean
  mensaje: string
  token?: string
  usuario?: Usuario
  errores?: Record<string, string[]>
}

/**
 * Estado de autenticación en la aplicación
 */
export interface EstadoAutenticacion {
  usuario: Usuario | null
  cargando: boolean
  autenticado: boolean
}