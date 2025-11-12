// hooks/useAuth.ts
'use client'

import { servicioAutenticacion } from '@/api/autenticacion.service'
import { RespuestaAutenticacion, DatosRegistro, DatosLogin, Usuario } from '@/interface/auth'
import { useState, useEffect, useCallback } from 'react'

/**
 * Hook personalizado para manejar la autenticación en componentes React
 * Proporciona estado y funciones para login, registro y logout
 */
export function useAutenticacion() {
  // Estado del usuario actual
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  
  // Estado de carga (útil para mostrar spinners)
  const [cargando, setCargando] = useState(true)
  
  // Estado de autenticación
  const [autenticado, setAutenticado] = useState(false)

  /**
   * Efecto que se ejecuta al montar el componente
   * Carga el usuario desde localStorage si existe
   */
  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const usuarioActual = await servicioAutenticacion.obtenerUsuarioActual()
        setUsuario(usuarioActual)
        setAutenticado(!!usuarioActual)
      } catch (error) {
        console.error('Error cargando usuario:', error)
      } finally {
        setCargando(false)
      }
    }

    cargarUsuario()
  }, [])

  /**
   * Función para iniciar sesión
   */
  const iniciarSesion = useCallback(async (datosLogin: DatosLogin): Promise<RespuestaAutenticacion> => {
    setCargando(true)
    
    try {
      const resultado = await servicioAutenticacion.iniciarSesion(datosLogin)
      
      // Si el login fue exitoso, actualizar estado
      if (resultado.exito && resultado.usuario) {
        setUsuario(resultado.usuario)
        setAutenticado(true)
      }
      
      return resultado
    } catch (error) {
      return {
        exito: false,
        mensaje: 'Error inesperado en el inicio de sesión'
      }
    } finally {
      setCargando(false)
    }
  }, [])

  /**
   * Función para registrar nuevo usuario
   */
  const registrarUsuario = useCallback(async (datosRegistro: DatosRegistro): Promise<RespuestaAutenticacion> => {
    setCargando(true)
    
    try {
      const resultado = await servicioAutenticacion.registrarUsuario(datosRegistro)
      return resultado
    } catch (error) {
      return {
        exito: false,
        mensaje: 'Error inesperado en el registro'
      }
    } finally {
      setCargando(false)
    }
  }, [])

  /**
   * Función para cerrar sesión
   */
  const cerrarSesion = useCallback(async (): Promise<void> => {
    setCargando(true)
    
    try {
      await servicioAutenticacion.cerrarSesion()
      setUsuario(null)
      setAutenticado(false)
    } catch (error) {
      console.error('Error cerrando sesión:', error)
    } finally {
      setCargando(false)
    }
  }, [])

  // Retornamos el estado y las funciones
  return {
    usuario,
    cargando,
    autenticado,
    iniciarSesion,
    registrarUsuario,
    cerrarSesion
  }
}