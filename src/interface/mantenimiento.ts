// interfaces/mantenimiento.ts

import { Usuario } from "./auth";
import { DetalleVenta } from "./venta";

// Interface principal del modelo Mantenimiento
export interface Mantenimiento {
  id: number;
  fecha_solicitud: string;
  fecha_atencion: string | null;
  fecha_finalizacion: string | null;
  costo: string;
  estado: 'Pendiente' | 'En proceso' | 'Completado' | 'Cancelado';
  descripcion: string;
  detalle_venta: DetalleVenta; // ID del detalle de venta
  usuario: Usuario; // ID del usuario
  created_at?: string;
  updated_at?: string;
}

// Interface para relaciones expandidas (si tu backend las incluye)
export interface MantenimientoCompleto extends Mantenimiento {
  detalle_venta_info?: {
    id: number;
    producto?: {
      id: number;
      descripcion: string;
      imagen?: string;
    };
    cantidad?: number;
    precio_unitario?: string;
  };
  usuario_info?: {
    id: number;
    nombre: string;
    email: string;
  };
}

// Datos para crear un mantenimiento
export interface DatosCrearMantenimiento {
  detalle_venta: number;
  usuario: number;
  descripcion: string;
  fecha_solicitud?: string;
  costo?: number;
  estado?: 'Pendiente' | 'En proceso' | 'Completado' | 'Cancelado';
}

// Datos para actualizar un mantenimiento
export interface DatosActualizarMantenimiento {
  fecha_atencion?: string;
  fecha_finalizacion?: string;
  costo?: number;
  estado?: 'Pendiente' | 'En proceso' | 'Completado' | 'Cancelado';
  descripcion?: string;
  detalle_venta?: number;
  usuario?: number;
}

// Filtros para búsqueda de mantenimientos
export interface FiltrosMantenimientoInterface {
  estado?: string;
  usuario_id?: number;
  detalle_venta?: number;
  fecha_solicitud_desde?: string;
  fecha_solicitud_hasta?: string;
  fecha_atencion_desde?: string;
  fecha_atencion_hasta?: string;
  fecha_finalizacion_desde?: string;
  fecha_finalizacion_hasta?: string;
  buscar?: string;
  pagina?: number;
  limite?: number;
}

// Respuestas de la API
export interface RespuestaMantenimientos {
  exito: boolean;
  datos: Mantenimiento[] | MantenimientoCompleto[];
  mensaje?: string;
  paginacion?: {
    total: number;
    paginaActual: number;
    totalPaginas: number;
    limite: number;
  };
}

export interface RespuestaMantenimiento {
  exito: boolean;
  datos: Mantenimiento | MantenimientoCompleto;
  mensaje?: string;
}

// Estadísticas para dashboard
export interface EstadisticasMantenimiento {
  total: number;
  pendientes: number;
  enProceso: number;
  completados: number;
  cancelados: number;
  costoTotal: number;
}

// Para el cambio de estado con datos adicionales
export interface DatosCambioEstado {
  estado: 'Pendiente' | 'En proceso' | 'Completado' | 'Cancelado';
  fecha_atencion?: string;
  fecha_finalizacion?: string;
  costo?: number;
}