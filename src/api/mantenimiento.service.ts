// services/mantenimiento.service.ts
import { 
  Mantenimiento,
  MantenimientoCompleto,
  DatosCrearMantenimiento,
  DatosActualizarMantenimiento,
  FiltrosMantenimiento,
  RespuestaMantenimientos,
  RespuestaMantenimiento
} from '@/interface/mantenimiento';
import { utilidadesAutenticacion } from '@/lib/autenticacion';

class ServicioMantenimiento {
  private urlBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

  private obtenerHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const token = utilidadesAutenticacion.obtenerToken();
    if (token) {
      headers["Authorization"] = `Token ${token}`;
    } else {
      console.warn("⚠️ Token de autenticación no encontrado");
    }

    return headers;
  }

  /**
   * Obtener todos los mantenimientos con filtros
   */
  async obtenerMantenimientos(filtros: FiltrosMantenimiento = {}): Promise<RespuestaMantenimientos> {
    try {
      const parametros = new URLSearchParams();
      
      // Aplicar filtros
      if (filtros.estado) parametros.append('estado', filtros.estado);
      if (filtros.usuario_id) parametros.append('usuario', filtros.usuario_id.toString());
      if (filtros.fecha_solicitud_desde) parametros.append('fecha_solicitud_desde', filtros.fecha_solicitud_desde);
      if (filtros.fecha_solicitud_hasta) parametros.append('fecha_solicitud_hasta', filtros.fecha_solicitud_hasta);
      if (filtros.fecha_atencion_desde) parametros.append('fecha_atencion_desde', filtros.fecha_atencion_desde);
      if (filtros.fecha_atencion_hasta) parametros.append('fecha_atencion_hasta', filtros.fecha_atencion_hasta);
      if (filtros.buscar) parametros.append('search', filtros.buscar);
      if (filtros.pagina) parametros.append('page', filtros.pagina.toString());
      if (filtros.limite) parametros.append('page_size', filtros.limite.toString());

      const url = `${this.urlBase}/mantenimientos/${parametros.toString() ? `?${parametros.toString()}` : ''}`;

      console.log('📥 Obteniendo mantenimientos:', url);

      const respuesta = await fetch(url, {
        method: 'GET',
        headers: this.obtenerHeaders(),
      });

      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
      }

      const datos = await respuesta.json();
      
      let mantenimientos: MantenimientoCompleto[] = [];
      let total = 0;
      let paginaActual = 1;
      let totalPaginas = 1; // Inicialización de la variable totalPaginas

      if (Array.isArray(datos)) {
        mantenimientos = datos;
        total = datos.length;
      } else if (datos.results && Array.isArray(datos.results)) {
        mantenimientos = datos.results;
        total = datos.count || datos.results.length;
        paginaActual = datos.current_page || 1;
        totalPaginas = datos.total_pages || Math.ceil(total / (filtros.limite || 10));
      } else {
        mantenimientos = datos;
        total = 1;
      }

      return {
        exito: true,
        datos: mantenimientos,
        paginacion: {
          total,
          paginaActual,
          totalPaginas,
          limite: filtros.limite || 10
        }
      };
    } catch (error) {
      console.error('❌ Error obteniendo mantenimientos:', error);
      return {
        exito: false,
        datos: [],
        mensaje: error instanceof Error ? error.message : 'Error al obtener mantenimientos'
      };
    }
  }

  /**
   * Obtener un mantenimiento por ID
   */
  async obtenerMantenimientoPorId(id: number): Promise<RespuestaMantenimiento> {
    try {
      const respuesta = await fetch(`${this.urlBase}/mantenimientos/${id}/`, {
        method: 'GET',
        headers: this.obtenerHeaders(),
      });

      if (!respuesta.ok) {
        if (respuesta.status === 404) {
          throw new Error('Mantenimiento no encontrado');
        }
        throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
      }

      const datos = await respuesta.json();

      return {
        exito: true,
        datos: datos
      };
    } catch (error) {
      console.error('❌ Error obteniendo mantenimiento:', error);
      return {
        exito: false,
        datos: {} as MantenimientoCompleto,
        mensaje: error instanceof Error ? error.message : 'Error al obtener mantenimiento'
      };
    }
  }

  /**
   * Crear un nuevo mantenimiento
   */
  async crearMantenimiento(datosMantenimiento: DatosCrearMantenimiento): Promise<RespuestaMantenimiento> {
    try {
      // Transformar los datos al formato esperado por el backend
      const cuerpo = {
        detalle_venta_id: datosMantenimiento.detalle_venta, // Cambiar clave
        usuario_id: datosMantenimiento.usuario, // Cambiar clave
        descripcion: datosMantenimiento.descripcion, // Mantener clave
        estado: datosMantenimiento.estado || "Pendiente", // Mantener clave
      };

      console.log("📤 Enviando datos para crear mantenimiento (transformados):", cuerpo);

      const respuesta = await fetch(`${this.urlBase}/mantenimientos/`, {
        method: "POST",
        headers: this.obtenerHeaders(),
        body: JSON.stringify(cuerpo),
      });

      if (!respuesta.ok) {
        const errorData = await respuesta.json().catch(() => ({}));
        console.error("❌ Error del backend al crear mantenimiento:", errorData);
        throw new Error(
          errorData.detail || `Error ${respuesta.status}: ${respuesta.statusText}`
        );
      }

      const datos = await respuesta.json();
      console.log("✅ Mantenimiento creado exitosamente:", datos);

      return {
        exito: true,
        datos: datos,
        mensaje: "Mantenimiento creado exitosamente",
      };
    } catch (error) {
      console.error("❌ Error creando mantenimiento:", error);
      return {
        exito: false,
        datos: {} as MantenimientoCompleto,
        mensaje: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Actualizar un mantenimiento existente
   */
  async actualizarMantenimiento(id: number, datosActualizacion: DatosActualizarMantenimiento): Promise<RespuestaMantenimiento> {
    try {
      console.log("📤 Enviando datos para actualizar mantenimiento:", datosActualizacion);

      const respuesta = await fetch(`${this.urlBase}/mantenimientos/${id}/`, {
        method: "PATCH",
        headers: this.obtenerHeaders(),
        body: JSON.stringify(datosActualizacion),
      });

      if (!respuesta.ok) {
        const errorData = await respuesta.json().catch(() => ({}));
        console.error("❌ Error del backend al actualizar mantenimiento:", errorData);
        throw new Error(
          errorData.detail || `Error ${respuesta.status}: ${respuesta.statusText}`
        );
      }

      const datos = await respuesta.json();
      console.log("✅ Mantenimiento actualizado exitosamente:", datos);

      return {
        exito: true,
        datos: datos,
        mensaje: "Mantenimiento actualizado exitosamente",
      };
    } catch (error) {
      console.error("❌ Error actualizando mantenimiento:", error);
      return {
        exito: false,
        datos: {} as MantenimientoCompleto,
        mensaje: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Eliminar un mantenimiento
   */
  async eliminarMantenimiento(id: number): Promise<{ exito: boolean; mensaje?: string }> {
    try {
      console.log(`📤 Enviando solicitud para eliminar mantenimiento con ID ${id}`);

      const respuesta = await fetch(`${this.urlBase}/mantenimientos/${id}/`, {
        method: "DELETE",
        headers: this.obtenerHeaders(),
      });

      if (!respuesta.ok) {
        const errorData = await respuesta.json().catch(() => ({}));
        console.error("❌ Error del backend al eliminar mantenimiento:", errorData);
        throw new Error(
          errorData.detail || `Error ${respuesta.status}: ${respuesta.statusText}`
        );
      }

      console.log("✅ Mantenimiento eliminado exitosamente");
      return {
        exito: true,
        mensaje: "Mantenimiento eliminado exitosamente",
      };
    } catch (error) {
      console.error("❌ Error eliminando mantenimiento:", error);
      return {
        exito: false,
        mensaje: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Obtener mantenimientos por usuario
   */
  async obtenerMantenimientosPorUsuario(usuarioId: number, filtros: FiltrosMantenimiento = {}): Promise<RespuestaMantenimientos> {
    try {
      const parametros = new URLSearchParams();
      parametros.append('usuario', usuarioId.toString());
      
      if (filtros.estado) parametros.append('estado', filtros.estado);
      if (filtros.fecha_solicitud_desde) parametros.append('fecha_solicitud_desde', filtros.fecha_solicitud_desde);
      if (filtros.fecha_solicitud_hasta) parametros.append('fecha_solicitud_hasta', filtros.fecha_solicitud_hasta);
      if (filtros.pagina) parametros.append('page', filtros.pagina.toString());
      if (filtros.limite) parametros.append('page_size', filtros.limite.toString());

      const url = `${this.urlBase}/mantenimientos/${parametros.toString() ? `?${parametros.toString()}` : ''}`;

      const respuesta = await fetch(url, {
        method: 'GET',
        headers: this.obtenerHeaders(),
      });

      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
      }

      const datos = await respuesta.json();
      
      let mantenimientos: MantenimientoCompleto[] = [];
      let total = 0;
      let paginaActual = 1;
      let totalPaginas = 1;

      if (Array.isArray(datos)) {
        mantenimientos = datos;
        total = datos.length;
      } else if (datos.results && Array.isArray(datos.results)) {
        mantenimientos = datos.results;
        total = datos.count || datos.results.length;
        paginaActual = datos.current_page || 1;
        totalPaginas = datos.total_pages || Math.ceil(total / (filtros.limite || 10));
      } else {
        mantenimientos = datos;
        total = 1;
      }

      return {
        exito: true,
        datos: mantenimientos,
        paginacion: {
          total,
          paginaActual,
          totalPaginas,
          limite: filtros.limite || 10
        }
      };
    } catch (error) {
      console.error('❌ Error obteniendo mantenimientos por usuario:', error);
      return {
        exito: false,
        datos: [],
        mensaje: error instanceof Error ? error.message : 'Error al obtener mantenimientos por usuario'
      };
    }
  }

  /**
   * Cambiar estado de mantenimiento
   */
  async cambiarEstadoMantenimiento(id: number, nuevoEstado: string, datosAdicionales: { fecha_atencion?: string; fecha_finalizacion?: string; costo?: number } = {}): Promise<RespuestaMantenimiento> {
    try {
      const datosActualizacion: DatosActualizarMantenimiento = {
        estado: nuevoEstado as "Pendiente" | "En proceso" | "Completado" | "Cancelado",
        ...datosAdicionales
      };

      // Si el estado es "En proceso" y no hay fecha de atención, establecerla
      if (nuevoEstado === 'En proceso' && !datosAdicionales.fecha_atencion) {
        datosActualizacion.fecha_atencion = new Date().toISOString();
      }

      // Si el estado es "Completado" y no hay fecha de finalización, establecerla
      if (nuevoEstado === 'Completado' && !datosAdicionales.fecha_finalizacion) {
        datosActualizacion.fecha_finalizacion = new Date().toISOString();
      }

      return await this.actualizarMantenimiento(id, datosActualizacion);
    } catch (error) {
      console.error('❌ Error cambiando estado de mantenimiento:', error);
      return {
        exito: false,
        datos: {} as MantenimientoCompleto,
        mensaje: error instanceof Error ? error.message : 'Error al cambiar estado de mantenimiento'
      };
    }
  }

  // ========== VALIDACIONES ==========

  /**
   * Validar datos del mantenimiento
   */
  validarMantenimiento(mantenimiento: Partial<DatosCrearMantenimiento>): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!mantenimiento.detalle_venta) {
      errores.push('El detalle de venta es requerido');
    }

    if (!mantenimiento.usuario) {
      errores.push('El usuario es requerido');
    }

    if (!mantenimiento.descripcion || mantenimiento.descripcion.trim().length === 0) {
      errores.push('La descripción es requerida');
    }

    if (mantenimiento.costo !== undefined && parseFloat(mantenimiento.costo.toString()) < 0) {
      errores.push('El costo no puede ser negativo');
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }

  // ========== UTILIDADES ==========

  /**
   * Formatear fecha para display
   */
  formatearFecha(fecha: string | null): string {
    if (!fecha) return 'No asignada';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Formatear moneda
   */
  formatearMoneda(monto: number | string): string {
    const valor = typeof monto === 'string' ? parseFloat(monto) : monto;
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB'
    }).format(valor);
  }

  /**
   * Obtener clase CSS para el estado
   */
  obtenerClaseEstado(estado: "Pendiente" | "En proceso" | "Completado" | "Cancelado"): string {
    const clases = {
      Pendiente: "bg-yellow-100 text-yellow-800",
      "En proceso": "bg-blue-100 text-blue-800",
      Completado: "bg-green-100 text-green-800",
      Cancelado: "bg-red-100 text-red-800",
    };
    return clases[estado];
  }

  /**
   * Calcular días transcurridos desde la solicitud
   */
  calcularDiasTranscurridos(fechaSolicitud: string): number {
    const solicitud = new Date(fechaSolicitud);
    const hoy = new Date();
    const diferencia = hoy.getTime() - solicitud.getTime();
    return Math.floor(diferencia / (1000 * 3600 * 24));
  }

  /**
   * Verificar si el mantenimiento está atrasado
   */
  estaAtrasado(mantenimiento: MantenimientoCompleto): boolean {
    if (mantenimiento.estado === 'Completado' || mantenimiento.estado === 'Cancelado') {
      return false;
    }
    
    const diasTranscurridos = this.calcularDiasTranscurridos(mantenimiento.fecha_solicitud);
    return diasTranscurridos > 7; // Considerar atrasado después de 7 días
  }
}

export const servicioMantenimiento = new ServicioMantenimiento();