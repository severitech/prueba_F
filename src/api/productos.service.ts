// api/productos.service.ts
import { Producto, DatosCrearProducto, DatosActualizarProducto, RespuestaProducto, FiltrosProductosInterface } from '@/interface/productos'
import { utilidadesAutenticacion } from '@/lib/autenticacion'

/**
 * Servicio para manejar todas las operaciones de productos con el backend
 */
class ServicioProductos {
  private urlBase = process.env.NEXT_PUBLIC_API_URL || 'https://web-production-de7b5.up.railway.app/api'

  /**
   * Obtener headers de autenticación
   */
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
   * Obtener headers para FormData (sin Content-Type)
   */
  private obtenerHeadersFormData(): HeadersInit {
    const headers: HeadersInit = {}

    const token = utilidadesAutenticacion.obtenerToken()
    if (token) {
      headers['Authorization'] = `Token ${token}`
    }

    return headers
  }

  /**
   * Obtener todos los productos con filtros opcionales
   */
  async obtenerProductos(filtros: FiltrosProductosInterface ): Promise<RespuestaProductos> {
    try {
      // Construir query string con filtros
      const parametros = new URLSearchParams()
      
      if (filtros.buscar) parametros.append('search', filtros.buscar)
      if (filtros.subcategoria) parametros.append('subcategoria', filtros.subcategoria.toString())
      if (filtros.estado) parametros.append('estado', filtros.estado)
      if (filtros.precio_min) parametros.append('precio_min', filtros.precio_min.toString())
      if (filtros.precio_max) parametros.append('precio_max', filtros.precio_max.toString())
      if (filtros.ordenar_por) parametros.append('ordering', filtros.ordenar_por)
      if (filtros.orden) parametros.append('order', filtros.orden)
      if (filtros.pagina) parametros.append('page', filtros.pagina.toString())
      if (filtros.limite) parametros.append('page_size', filtros.limite.toString())

      const url = `${this.urlBase}/productos/${parametros.toString() ? `?${parametros.toString()}` : ''}`

      const respuesta = await fetch(url, {
        method: 'GET',
        headers: this.obtenerHeaders(),
      })

      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`)
      }

      const datos = await respuesta.json()
      
      // Manejar diferentes estructuras de respuesta
      let productos: Producto[] = []
      let total = 0
      let paginaActual = 1
      let totalPaginas = 1

      if (Array.isArray(datos)) {
        productos = datos
        total = datos.length
      } else if (datos.results && Array.isArray(datos.results)) {
        productos = datos.results
        total = datos.count || datos.results.length
        paginaActual = datos.current_page || 1
        totalPaginas = datos.total_pages || Math.ceil(total / (filtros.limite || 10))
      } else {
        productos = datos
        total = 1
      }

      return {
        exito: true,
        datos: productos,
        paginacion: {
          total,
          paginaActual,
          totalPaginas,
          limite: filtros.limite || 10
        }
      }
    } catch (error) {
      console.error('❌ Error obteniendo productos:', error)
      return {
        exito: false,
        datos: [],
        mensaje: error instanceof Error ? error.message : 'Error al obtener productos'
      }
    }
  }

  /**
   * Obtener un producto por ID
   */
  async obtenerProductoPorId(id: number): Promise<RespuestaProducto> {
    try {
      const respuesta = await fetch(`${this.urlBase}/productos/${id}/`, {
        method: 'GET',
        headers: this.obtenerHeaders(),
      })

      if (!respuesta.ok) {
        if (respuesta.status === 404) {
          throw new Error('Producto no encontrado')
        }
        throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`)
      }

      const datos = await respuesta.json()

      return {
        exito: true,
        datos: datos
      }
    } catch (error) {
      console.error('❌ Error obteniendo producto:', error)
      return {
        exito: false,
        datos: {} as Producto,
        mensaje: error instanceof Error ? error.message : 'Error al obtener producto'
      }
    }
  }

  /**
   * Crear un nuevo producto
   */
  async crearProducto(datosProducto: DatosCrearProducto): Promise<RespuestaProducto> {
    try {
      // Preparar el cuerpo EXACTAMENTE como lo espera el backend
      const cuerpo = {
        descripcion: datosProducto.descripcion,
        precio: parseFloat(datosProducto.precio.toString()),
        stock: parseInt(datosProducto.stock.toString()),
        estado: datosProducto.estado,
        subcategoria_id: datosProducto.subcategoria_id,
        imagenes: datosProducto.imagenes || []
      }

      console.log('📤 Enviando datos al backend:', cuerpo);

      const respuesta = await fetch(`${this.urlBase}/productos/`, {
        method: 'POST',
        headers: this.obtenerHeaders(),
        body: JSON.stringify(cuerpo)
      })

      if (!respuesta.ok) {
        const errorData = await respuesta.json().catch(() => ({}))
        console.error('❌ Error del backend:', errorData);
        
        // Mostrar errores específicos del backend si existen
        let mensajeError = `Error ${respuesta.status}: ${respuesta.statusText}`;
        if (errorData.detail) {
          mensajeError = errorData.detail;
        } else if (errorData.message) {
          mensajeError = errorData.message;
        } else if (typeof errorData === 'object') {
          // Mostrar errores de validación de campos
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
        mensaje: 'Producto creado exitosamente'
      }
    } catch (error) {
      console.error('❌ Error creando producto:', error)
      return {
        exito: false,
        datos: {} as Producto,
        mensaje: error instanceof Error ? error.message : 'Error al crear producto'
      }
    }
  }

  /**
   * Actualizar un producto existente
   */
  async actualizarProducto(id: number, datosActualizacion: Partial<DatosActualizarProducto>): Promise<RespuestaProducto> {
    try {
      console.log('📤 Actualizando producto con datos:', datosActualizacion);

      const respuesta = await fetch(`${this.urlBase}/productos/${id}/`, {
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
        mensaje: 'Producto actualizado exitosamente'
      }
    } catch (error) {
      console.error('❌ Error actualizando producto:', error)
      return {
        exito: false,
        datos: {} as Producto,
        mensaje: error instanceof Error ? error.message : 'Error al actualizar producto'
      }
    }
  }

  /**
   * Eliminar un producto (cambiar estado a Inactivo o eliminar permanentemente)
   */
  async eliminarProducto(id: number, permanente: boolean = false): Promise<{ exito: boolean; mensaje?: string }> {
    try {
      if (permanente) {
        // Eliminación permanente
        const respuesta = await fetch(`${this.urlBase}/productos/${id}/`, {
          method: 'DELETE',
          headers: this.obtenerHeaders(),
        })

        if (!respuesta.ok) {
          throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`)
        }
      } else {
        // Cambiar estado a Inactivo (eliminación lógica)
        const respuesta = await fetch(`${this.urlBase}/productos/${id}/`, {
          method: 'PATCH',
          headers: this.obtenerHeaders(),
          body: JSON.stringify({ estado: 'Inactivo' })
        })

        if (!respuesta.ok) {
          throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`)
        }
      }

      return {
        exito: true,
        mensaje: permanente ? 'Producto eliminado permanentemente' : 'Producto desactivado exitosamente'
      }
    } catch (error) {
      console.error('❌ Error eliminando producto:', error)
      return {
        exito: false,
        mensaje: error instanceof Error ? error.message : 'Error al eliminar producto'
      }
    }
  }

  /**
   * Activar un producto (cambiar estado a Activo)
   */
  async activarProducto(id: number): Promise<{ exito: boolean; mensaje?: string }> {
    try {
      const respuesta = await fetch(`${this.urlBase}/productos/${id}/`, {
        method: 'PATCH',
        headers: this.obtenerHeaders(),
        body: JSON.stringify({ estado: 'Activo' })
      })

      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`)
      }

      return {
        exito: true,
        mensaje: 'Producto activado exitosamente'
      }
    } catch (error) {
      console.error('❌ Error activando producto:', error)
      return {
        exito: false,
        mensaje: error instanceof Error ? error.message : 'Error al activar producto'
      }
    }
  }

  /**
   * Buscar productos por término
   */
  async buscarProductos(termino: string): Promise<RespuestaProductos> {
    try {
      const respuesta = await fetch(`${this.urlBase}/productos/?search=${encodeURIComponent(termino)}`, {
        method: 'GET',
        headers: this.obtenerHeaders(),
      })

      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`)
      }

      const datos = await respuesta.json()

      let productos: Producto[] = []
      if (Array.isArray(datos)) {
        productos = datos
      } else if (datos.results && Array.isArray(datos.results)) {
        productos = datos.results
      } else {
        productos = datos
      }

      return {
        exito: true,
        datos: productos
      }
    } catch (error) {
      console.error('❌ Error buscando productos:', error)
      return {
        exito: false,
        datos: [],
        mensaje: error instanceof Error ? error.message : 'Error al buscar productos'
      }
    }
  }

  /**
   * Obtener productos por subcategoría
   */
  async obtenerProductosPorSubcategoria(subcategoriaId: number): Promise<RespuestaProductos> {
    try {
      const respuesta = await fetch(`${this.urlBase}/productos/?subcategoria=${subcategoriaId}`, {
        method: 'GET',
        headers: this.obtenerHeaders(),
      })

      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`)
      }

      const datos = await respuesta.json()

      let productos: Producto[] = []
      if (Array.isArray(datos)) {
        productos = datos
      } else if (datos.results && Array.isArray(datos.results)) {
        productos = datos.results
      } else {
        productos = datos
      }

      return {
        exito: true,
        datos: productos
      }
    } catch (error) {
      console.error('❌ Error obteniendo productos por subcategoría:', error)
      return {
        exito: false,
        datos: [],
        mensaje: error instanceof Error ? error.message : 'Error al obtener productos por subcategoría'
      }
    }
  }

  /**
   * Subir imagen para producto
   */
  async subirImagen(productoId: number, archivo: File): Promise<{ exito: boolean; url?: string; mensaje?: string }> {
    try {
      const formData = new FormData()
      formData.append('imagen', archivo)

      const respuesta = await fetch(`${this.urlBase}/productos/${productoId}/subir-imagen/`, {
        method: 'POST',
        headers: this.obtenerHeadersFormData(),
        body: formData
      })

      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`)
      }

      const datos = await respuesta.json()

      return {
        exito: true,
        url: datos.url,
        mensaje: 'Imagen subida exitosamente'
      }
    } catch (error) {
      console.error('❌ Error subiendo imagen:', error)
      return {
        exito: false,
        mensaje: error instanceof Error ? error.message : 'Error al subir imagen'
      }
    }
  }

  /**
   * Formatear moneda
   */
  formatearMoneda(monto: number): string {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB'
    }).format(monto)
  }

  /**
   * Validar datos del producto
   */
  validarProducto(producto: Partial<Producto>): { valido: boolean; errores: string[] } {
    const errores: string[] = []

    if (!producto.descripcion || producto.descripcion.trim().length === 0) {
      errores.push('La descripción es requerida')
    }

    if (!producto.precio || producto.precio <= 0) {
      errores.push('El precio debe ser mayor a 0')
    }

    if (producto.stock === undefined || producto.stock < 0) {
      errores.push('El stock no puede ser negativo')
    }

    if (!producto.subcategoria) {
      errores.push('La subcategoría es requerida')
    }

    return {
      valido: errores.length === 0,
      errores
    }
  }
}

export const servicioProductos = new ServicioProductos()

export interface RespuestaProductos {
  exito: boolean;
  datos: Producto[];
  mensaje?: string;
  paginacion?: {
    total: number;
    paginaActual: number;
    totalPaginas: number;
    limite: number;
  };
}