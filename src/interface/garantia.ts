import { Producto } from "./productos";

// interface/garantias.ts
export interface Garantia {
  id: number;
  descripcion: string;
  tiempo: number;
  producto: Producto
}

export interface DatosCrearGarantia {
  descripcion: string;
  tiempo: number;
  producto: Producto;
}

export interface DatosActualizarGarantia {
  descripcion?: string;
  tiempo?: number;
  producto?: Producto;
}

export interface FiltrosGarantiasInterface {
  buscar?: string;
  producto?: Producto;
  tiempo_min?: number;
  tiempo_max?: number;
  pagina?: number;
  limite?: number;
}

export interface RespuestaGarantias {
  exito: boolean;
  datos: Garantia[];
  mensaje?: string;
  paginacion?: {
    total: number;
    paginaActual: number;
    totalPaginas: number;
    limite: number;
  };
}

export interface RespuestaGarantia {
  exito: boolean;
  datos: Garantia;
  mensaje?: string;
}