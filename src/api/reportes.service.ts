// api/reportes.service.ts
import { utilidadesAutenticacion } from "@/lib/autenticacion";

/** ====== Tipos base ====== */
export type FormatoReporte = "json" | "pdf" | "excel";

export interface RespuestaBasica<T = any> {
  success: boolean;
  mensaje?: string;
  error?: string;
  reporte?: T;
  filtros_aplicados?: Record<string, any>;
  metadata?: Record<string, any>;
  comando_procesado?: string;
  comando_detectado?: string;
}

export interface KPIsVentas {
  cantidad_ventas: number;
  total_ventas: number;
  promedio_venta: number;
}

export interface KPIsProductos {
  total_productos: number;
  stock_total: number;
  valor_inventario: number;
  activos: number;
}

export interface ResultadoReporte {
  success: boolean;
  total?: number;
  kpis?: KPIsVentas | KPIsProductos | Record<string, any>;
  datos?: any[] | Record<string, any>;
}

export interface StatusReportes {
  success: boolean;
  status: "operacional" | "degradado" | "caido";
  ia_disponible: boolean;
  endpoints: Record<string, string>;
  ejemplos_get: Record<string, string>;
}

/** ====== Servicio ====== */
class ServicioReportes {
  private urlBase =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  private headersJSON(): HeadersInit {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    const token = utilidadesAutenticacion?.obtenerToken?.();
    if (token) headers["Authorization"] = `Token ${token}`;
    return headers;
  }

  private headersMultipart(): HeadersInit {
    const headers: HeadersInit = {};
    const token = utilidadesAutenticacion?.obtenerToken?.();
    if (token) headers["Authorization"] = `Token ${token}`;
    // OJO: NO seteamos Content-Type; el navegador lo define con boundary
    return headers;
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean>) {
    const url = new URL(`${this.urlBase}${path}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
      });
    }
    return url.toString();
  }

  /** =============== VOZ / TEXTO =============== */

  /** Envía un comando en texto y obtiene el reporte */
  async reportePorTexto(
    comando: string,
    usarIA = true
  ): Promise<RespuestaBasica<ResultadoReporte>> {
    try {
      const res = await fetch(`${this.urlBase}/reportes/voz/`, {
        method: "POST",
        headers: this.headersJSON(),
        body: JSON.stringify({ comando, usar_ia: usarIA }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || res.statusText);
      return data as RespuestaBasica<ResultadoReporte>;
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e.message : "Error procesando comando de voz (texto)",
      };
    }
  }

  /** Envía audio (Blob/File) como multipart y obtiene el reporte */
  async reportePorAudio(
    audio: Blob | File,
    filename = "voz.webm"
  ): Promise<RespuestaBasica<ResultadoReporte>> {
    try {
      const form = new FormData();
      form.append("audio", audio, filename);

      const res = await fetch(`${this.urlBase}/reportes/voz/audio/`, {
        method: "POST",
        headers: this.headersMultipart(),
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || res.statusText);
      return data as RespuestaBasica<ResultadoReporte>;
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e.message : "Error procesando audio de voz",
      };
    }
  }

  /** =============== VENTAS =============== */

  /** GET /reportes/ventas/?... (útil para dashboards) */
  async getVentas(params?: {
    fecha_inicio?: string; // "YYYY-MM-DD"
    fecha_fin?: string;    // "YYYY-MM-DD"
    categoria?: string;
    estado?: string;
    monto_minimo?: number;
    monto_maximo?: number;
    limite?: number;
  }): Promise<RespuestaBasica<ResultadoReporte>> {
    try {
      const url = this.buildUrl("/reportes/ventas/", params as any);
      const res = await fetch(url, {
        method: "GET",
        headers: this.headersJSON(),
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || res.statusText);
      return data as RespuestaBasica<ResultadoReporte>;
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : "Error obteniendo ventas" };
    }
  }

  /** POST /reportes/ventas/ (cuando quieras enviar filtros complejos por body) */
  async postVentas(body: Record<string, any>): Promise<RespuestaBasica<ResultadoReporte>> {
    try {
      const res = await fetch(`${this.urlBase}/reportes/ventas/`, {
        method: "POST",
        headers: this.headersJSON(),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || res.statusText);
      return data as RespuestaBasica<ResultadoReporte>;
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : "Error generando reporte de ventas" };
    }
  }

  /** =============== PRODUCTOS =============== */

  async getProductos(params?: {
    categoria?: string;
    stock_minimo?: number;
    stock_maximo?: number;
    limite?: number;
  }): Promise<RespuestaBasica<ResultadoReporte>> {
    try {
      const url = this.buildUrl("/reportes/productos/", params as any);
      const res = await fetch(url, {
        method: "GET",
        headers: this.headersJSON(),
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || res.statusText);
      return data as RespuestaBasica<ResultadoReporte>;
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : "Error obteniendo productos" };
    }
  }

  async postProductos(body: Record<string, any>): Promise<RespuestaBasica<ResultadoReporte>> {
    try {
      const res = await fetch(`${this.urlBase}/reportes/productos/`, {
        method: "POST",
        headers: this.headersJSON(),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || res.statusText);
      return data as RespuestaBasica<ResultadoReporte>;
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : "Error generando reporte de productos" };
    }
  }

  /** =============== CLIENTES =============== */

  async getClientes(params?: {
    tipo_cliente?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    limite?: number;
  }): Promise<RespuestaBasica<ResultadoReporte>> {
    try {
      const url = this.buildUrl("/reportes/clientes/", params as any);
      const res = await fetch(url, {
        method: "GET",
        headers: this.headersJSON(),
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || res.statusText);
      return data as RespuestaBasica<ResultadoReporte>;
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : "Error obteniendo clientes" };
    }
  }

  async postClientes(body: Record<string, any>): Promise<RespuestaBasica<ResultadoReporte>> {
    try {
      const res = await fetch(`${this.urlBase}/reportes/clientes/`, {
        method: "POST",
        headers: this.headersJSON(),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || res.statusText);
      return data as RespuestaBasica<ResultadoReporte>;
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : "Error generando reporte de clientes" };
    }
  }

  /** =============== INVENTARIO =============== */

  async getInventario(params?: {
    stock_minimo?: number;
    stock_maximo?: number;
    categoria?: string;
  }): Promise<RespuestaBasica<ResultadoReporte>> {
    try {
      const url = this.buildUrl("/reportes/inventario/", params as any);
      const res = await fetch(url, {
        method: "GET",
        headers: this.headersJSON(),
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || res.statusText);
      return data as RespuestaBasica<ResultadoReporte>;
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : "Error obteniendo inventario" };
    }
  }

  async postInventario(body: Record<string, any>): Promise<RespuestaBasica<ResultadoReporte>> {
    try {
      const res = await fetch(`${this.urlBase}/reportes/inventario/`, {
        method: "POST",
        headers: this.headersJSON(),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || res.statusText);
      return data as RespuestaBasica<ResultadoReporte>;
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : "Error generando reporte de inventario" };
    }
  }

  /** =============== STATUS =============== */

  async status(): Promise<StatusReportes> {
    try {
      const res = await fetch(`${this.urlBase}/reportes/status/`, {
        method: "GET",
        headers: this.headersJSON(),
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || res.statusText);
      return data as StatusReportes;
    } catch (e) {
      return {
        success: false,
        status: "degradado",
        ia_disponible: false,
        endpoints: {},
        ejemplos_get: {},
      } as any;
    }
  }
}

export const servicioReportes = new ServicioReportes();
