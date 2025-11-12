// interface/promociones.ts
import { Producto } from "./productos";

export interface Promocion {
  id: number;
  fecha_inicio: string;
  fecha_fin: string;
  descripcion: string;
  monto: number | string;
  estado: boolean;
}

export interface ProductoPromocion {
  id: number;
  fecha: string;
  producto_id: number;
  promocion_id: number;
  producto?: Producto;
  promocion?: Promocion;
}

// ========== DATOS PARA CREAR ==========
export interface DatosCrearPromocion {
  fecha_inicio: string;
  fecha_fin: string;
  descripcion: string;
  monto: number;
  estado?: boolean;
}

export interface DatosCrearPromocionConProductos {
  fecha_inicio: string;
  fecha_fin: string;
  descripcion: string;
  monto: number;
  estado?: boolean;
  productos_ids: number[];
}

export interface DatosCrearProductoPromocion {
  producto_id: number;
  promocion_id: number;
}

// ========== DATOS PARA ACTUALIZAR ==========
export interface DatosActualizarPromocion {
  fecha_inicio?: string;
  fecha_fin?: string;
  descripcion?: string;
  monto?: number;
  estado?: boolean;
}

export interface DatosActualizarPromocionConProductos {
  fecha_inicio?: string;
  fecha_fin?: string;
  descripcion?: string;
  monto?: number;
  estado?: boolean;
  productos_ids?: number[];
}

export interface DatosActualizarProductoPromocion {
  producto_id?: number;
  promocion_id?: number;
}

// ========== FILTROS ==========
export interface FiltrosPromocionesInterface {
  buscar?: string;
  estado?: boolean;
  fecha_inicio_desde?: string;
  fecha_inicio_hasta?: string;
  fecha_fin_desde?: string;
  fecha_fin_hasta?: string;
  monto_min?: number;
  monto_max?: number;
  pagina?: number;
  limite?: number;
}

export interface FiltrosProductoPromocionInterface {
  producto_id?: number;
  promocion_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  pagina?: number;
  limite?: number;
}

// ========== RESPUESTAS ==========
export interface RespuestaPromociones {
  exito: boolean;
  datos: Promocion[];
  mensaje?: string;
  paginacion?: {
    total: number;
    paginaActual: number;
    totalPaginas: number;
    limite: number;
  };
}

export interface RespuestaPromocion {
  exito: boolean;
  datos: Promocion;
  mensaje?: string;
}

export interface RespuestaProductoPromociones {
  exito: boolean;
  datos: ProductoPromocion[];
  mensaje?: string;
  paginacion?: {
    total: number;
    paginaActual: number;
    totalPaginas: number;
    limite: number;
  };
}

export interface RespuestaProductoPromocion {
  exito: boolean;
  datos: ProductoPromocion;
  mensaje?: string;
}

// ========== ESTADOS Y UTILIDADES ==========
export interface EstadoPromocion {
  estado: 'activa' | 'pendiente' | 'expirada' | 'inactiva';
  color: string;
  texto: string;
}

export interface PromocionConProductos extends Promocion {
  productos: Producto[];
  total_productos: number;
}

export interface DatosPromocionParaLista {
  id: number;
  descripcion: string;
  monto: number | string;
  estado: boolean;
  fecha_inicio: string;
  fecha_fin: string;
  es_activa: boolean;
  es_pendiente: boolean;
  es_expirada: boolean;
  total_productos: number;
}

// ========== ESTADÍSTICAS ==========
export interface EstadisticasPromociones {
  total_promociones: number;
  promociones_activas: number;
  promociones_pendientes: number;
  promociones_expiradas: number;
  promociones_inactivas: number;
  producto_mas_promocionado?: {
    producto_id: number;
    producto_descripcion: string;
    total_promociones: number;
  };
}

// ========== VALIDACIÓN ==========
export interface ErrorValidacionPromocion {
  campo: string;
  mensaje: string;
  tipo: 'error' | 'advertencia';
}

export interface ResultadoValidacionPromocion {
  valido: boolean;
  errores: ErrorValidacionPromocion[];
  advertencias: ErrorValidacionPromocion[];
}

// ========== CONFIGURACIÓN ==========
export interface ConfiguracionPromocion {
  max_productos_por_promocion: number;
  dias_maximo_promocion: number;
  monto_minimo: number;
  monto_maximo: number;
  permitir_solapamiento: boolean;
}

// ========== IMPORT/EXPORT ==========
export interface DatosExportacionPromocion {
  promocion: Promocion;
  productos: Array<{
    producto_id: number;
    producto_descripcion: string;
    producto_precio: number;
    fecha_agregado: string;
  }>;
}

export interface DatosImportacionPromocion {
  fecha_inicio: string;
  fecha_fin: string;
  descripcion: string;
  monto: number;
  estado: boolean;
  productos: Array<{
    producto_id: number;
    sku?: string;
  }>;
}