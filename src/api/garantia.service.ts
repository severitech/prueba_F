// api/garantias.service.ts
import { Garantia, DatosCrearGarantia, DatosActualizarGarantia, RespuestaGarantias, RespuestaGarantia, FiltrosGarantiasInterface } from '@/interface/garantia'
import { utilidadesAutenticacion } from '@/lib/autenticacion'

class ServicioGarantias {
  private urlBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'

  private obtenerHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    const token = utilidadesAutenticacion.obtenerToken()
    if (token) {
      headers['Authorization'] = `Token ${token}`
    }

    return headers
  }

  /**
   * Obtener todas las garantías con filtros opcionales
   */
  async obtenerGarantias(filtros: FiltrosGarantiasInterface = {}): Promise<RespuestaGarantias> {
    try {
      const parametros = new URLSearchParams()
      
      if (filtros.buscar) parametros.append('search', filtros.buscar)
      if (filtros.producto_id) parametros.append('producto_id', filtros.producto_id.toString())
      if (filtros.tiempo_min) parametros.append('tiempo_min', filtros.tiempo_min.toString())
      if (filtros.tiempo_max) parametros.append('tiempo_max', filtros.tiempo_max.toString())
      if (filtros.pagina) parametros.append('page', filtros.pagina.toString())
      if (filtros.limite) parametros.append('page_size', filtros.limite.toString())

      const url = `${this.urlBase}/garantias/${parametros.toString() ? `?${parametros.toString()}` : ''}`

      const respuesta = await fetch(url, {
        method: 'GET',
        headers: this.obtenerHeaders(),
      })

      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`)
      }

      const datos = await respuesta.json()
      
      let garantias: Garantia[] = []
      let total = 0
      let paginaActual = 1
      let totalPaginas = 1

      if (Array.isArray(datos)) {
        garantias = datos
        total = datos.length
      } else if (datos.results && Array.isArray(datos.results)) {
        garantias = datos.results
        total = datos.count || datos.results.length
        paginaActual = datos.current_page || 1
        totalPaginas = datos.total_pages || Math.ceil(total / (filtros.limite || 10))
      } else {
        garantias = datos
        total = 1
      }

      return {
        exito: true,
        datos: garantias,
        paginacion: {
          total,
          paginaActual,
          totalPaginas,
          limite: filtros.limite || 10
        }
      }
    } catch (error) {
      console.error('❌ Error obteniendo garantías:', error)
      return {
        exito: false,
        datos: [],
        mensaje: error instanceof Error ? error.message : 'Error al obtener garantías'
      }
    }
  }

  /**
   * Obtener una garantía por ID
   */
  async obtenerGarantiaPorId(id: number): Promise<RespuestaGarantia> {
    try {
      const respuesta = await fetch(`${this.urlBase}/garantias/${id}/`, {
        method: 'GET',
        headers: this.obtenerHeaders(),
      })

      if (!respuesta.ok) {
        if (respuesta.status === 404) {
          throw new Error('Garantía no encontrada')
        }
        throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`)
      }

      const datos = await respuesta.json()

      return {
        exito: true,
        datos: datos
      }
    } catch (error) {
      console.error('❌ Error obteniendo garantía:', error)
      return {
        exito: false,
        datos: {} as Garantia,
        mensaje: error instanceof Error ? error.message : 'Error al obtener garantía'
      }
    }
  }

  /**
   * Crear una nueva garantía
   */
  async crearGarantia(datosGarantia: DatosCrearGarantia): Promise<RespuestaGarantia> {
    try {
      const cuerpo = {
        descripcion: datosGarantia.descripcion,
        tiempo: parseInt(datosGarantia.tiempo.toString()),
        producto_id: datosGarantia.producto_id
      }

      console.log('📤 Creando garantía:', cuerpo);

      const respuesta = await fetch(`${this.urlBase}/garantias/`, {
        method: 'POST',
        headers: this.obtenerHeaders(),
        body: JSON.stringify(cuerpo)
      })

      if (!respuesta.ok) {
        const errorData = await respuesta.json().catch(() => ({}))
        console.error('❌ Error del backend:', errorData);
        
        let mensajeError = `Error ${respuesta.status}: ${respuesta.statusText}`;
        if (errorData.detail) {
          mensajeError = errorData.detail;
        } else if (errorData.message) {
          mensajeError = errorData.message;
        } else if (typeof errorData === 'object') {
          const erroresCampo = Object.entries(errorData)
            .map(([campo, errores]) => `${campo}: ${Array.isArray(errores) ? errores.join(', ') : errores}`)
            .join('; ');
          if (erroresCampo) {
            mensajeError = erroresCampo;
          }
        }
        
        throw new Error(mensajeError);
      }

      const datos = await respuesta.json()

      return {
        exito: true,
        datos: datos,
        mensaje: 'Garantía creada exitosamente'
      }
    } catch (error) {
      console.error('❌ Error creando garantía:', error)
      return {
        exito: false,
        datos: {} as Garantia,
        mensaje: error instanceof Error ? error.message : 'Error al crear garantía'
      }
    }
  }

  /**
   * Actualizar una garantía existente
   */
  async actualizarGarantia(id: number, datosActualizacion: Partial<DatosActualizarGarantia>): Promise<RespuestaGarantia> {
    try {
      console.log('📤 Actualizando garantía:', datosActualizacion);

      const respuesta = await fetch(`${this.urlBase}/garantias/${id}/`, {
        method: 'PATCH',
        headers: this.obtenerHeaders(),
        body: JSON.stringify(datosActualizacion)
      })

      if (!respuesta.ok) {
        const errorData = await respuesta.json().catch(() => ({}))
        console.error('❌ Error del backend:', errorData);
        
        let mensajeError = `Error ${respuesta.status}: ${respuesta.statusText}`;
        if (errorData.detail) {
          mensajeError = errorData.detail;
        } else if (errorData.message) {
          mensajeError = errorData.message;
        } else if (typeof errorData === 'object') {
          const erroresCampo = Object.entries(errorData)
            .map(([campo, errores]) => `${campo}: ${Array.isArray(errores) ? errores.join(', ') : errores}`)
            .join('; ');
          if (erroresCampo) {
            mensajeError = erroresCampo;
          }
        }
        
        throw new Error(mensajeError);
      }

      const datos = await respuesta.json()

      return {
        exito: true,
        datos: datos,
        mensaje: 'Garantía actualizada exitosamente'
      }
    } catch (error) {
      console.error('❌ Error actualizando garantía:', error)
      return {
        exito: false,
        datos: {} as Garantia,
        mensaje: error instanceof Error ? error.message : 'Error al actualizar garantía'
      }
    }
  }

  /**
   * Eliminar una garantía
   */
  async eliminarGarantia(id: number): Promise<{ exito: boolean; mensaje?: string }> {
    try {
      const respuesta = await fetch(`${this.urlBase}/garantias/${id}/`, {
        method: 'DELETE',
        headers: this.obtenerHeaders(),
      })

      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`)
      }

      return {
        exito: true,
        mensaje: 'Garantía eliminada exitosamente'
      }
    } catch (error) {
      console.error('❌ Error eliminando garantía:', error)
      return {
        exito: false,
        mensaje: error instanceof Error ? error.message : 'Error al eliminar garantía'
      }
    }
  }

  /**
   * Obtener garantías por producto
   */
  async obtenerGarantiasPorProducto(productoId: number): Promise<RespuestaGarantias> {
    try {
      const respuesta = await fetch(`${this.urlBase}/garantias/?producto_id=${productoId}`, {
        method: 'GET',
        headers: this.obtenerHeaders(),
      })

      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`)
      }

      const datos = await respuesta.json()

      let garantias: Garantia[] = []
      if (Array.isArray(datos)) {
        garantias = datos
      } else if (datos.results && Array.isArray(datos.results)) {
        garantias = datos.results
      } else {
        garantias = datos
      }

      return {
        exito: true,
        datos: garantias
      }
    } catch (error) {
      console.error('❌ Error obteniendo garantías por producto:', error)
      return {
        exito: false,
        datos: [],
        mensaje: error instanceof Error ? error.message : 'Error al obtener garantías por producto'
      }
    }
  }

  /**
   * Validar datos de la garantía
   */
  validarGarantia(garantia: Partial<Garantia>): { valido: boolean; errores: string[] } {
    const errores: string[] = []

    if (!garantia.descripcion || garantia.descripcion.trim().length === 0) {
      errores.push('La descripción es requerida')
    }

    if (!garantia.tiempo || garantia.tiempo <= 0) {
      errores.push('El tiempo de garantía debe ser mayor a 0 meses')
    }

    if (!garantia.producto_id) {
      errores.push('El producto es requerido')
    }

    return {
      valido: errores.length === 0,
      errores
    }
  }
}

export const servicioGarantias = new ServicioGarantias()