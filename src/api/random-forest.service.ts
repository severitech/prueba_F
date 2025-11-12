// api/random-forest.service.ts
import { utilidadesAutenticacion } from "@/lib/autenticacion";

// Ajusta estas rutas si tus urls.py usan otros nombres
const RUTA_GENERAR_DATOS = "/ia/generar-datos/"; // GenerarDatosSinteticosView.post
const RUTA_TRAIN_CANTIDADES = "/ia/entrenar-modelo/"; // EntrenarModeloCantidadesView.post -> usar ruta real 'entrenar-modelo'

/** ====== Tipos base (Panel) ====== */
export type ScopeIA = "producto" | "categoria" | "cliente";

export interface PanelHealthScope {
  modelo: boolean;
  metrics_csv: boolean;
  series_summary_csv: boolean;
}
export interface PanelHealthResponse {
  ok: boolean;
  scopes: Record<ScopeIA, PanelHealthScope>;
  mensaje?: string;
}

export interface PanelSeriesItem {
  [key: string]: string | number; // producto_id | usuario_id | categoria
  puntos: number;
  activos: number;
  total: number;
  media: number;
  std: number;
}
export interface PanelSeriesResponse {
  ok: boolean;
  scope: ScopeIA;
  key: "producto_id" | "usuario_id" | "categoria";
  count: number;
  items: PanelSeriesItem[];
  mensaje?: string;
}

export interface PanelPredItem {
  periodo: string;
  anio: number;
  mes: number;
  scope: ScopeIA;
  producto_id?: number;
  usuario_id?: number;
  categoria?: string;
  cantidad_predicha: number;
  minimo?: number;
  maximo?: number;
  confianza?: number;
}
export interface PanelPredResponse {
  ok: boolean;
  scope: ScopeIA;
  aggregate?: boolean;
  serie?: string | number;
  count: number;
  items: PanelPredItem[];
  mensaje?: string;
  log?: string;
}

export interface EntrenarPanelResponse {
  ok: boolean;
  log?: string;
  mensaje?: string;
}

/** ====== Tipos (Cantidades Totales) ====== */
export interface PredTotalesPreview {
  ok: boolean;
  log?: string;
  rows?: number;
  preview?: Array<Record<string, any>>;
  csv_error?: string;
}

export interface PredTotalesListado {
  ok: boolean;
  count: number;
  items: Array<{
    anio: number;
    mes: number;
    // más campos según tu CSV (ej: cantidad_predicha, etc.)
    [k: string]: any;
  }>;
  error?: string;
}

/** ====== Servicio ====== */
class ServicioRandomForest {
  private urlBase =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  private obtenerHeadersJSON(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    const token = utilidadesAutenticacion?.obtenerToken?.();
    if (token) headers["Authorization"] = `Token ${token}`;
    return headers;
  }

  private obtenerHeadersBinario(): HeadersInit {
    const headers: HeadersInit = {};
    const token = utilidadesAutenticacion?.obtenerToken?.();
    if (token) headers["Authorization"] = `Token ${token}`;
    return headers;
  }

  /** =============== PANEL (producto/categoria/cliente) =============== */

  async panelHealth(): Promise<PanelHealthResponse> {
    try {
      const res = await fetch(`${this.urlBase}/ia/panel/health/`, {
        method: "GET",
        headers: this.obtenerHeadersJSON(),
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || res.statusText);
      return data as PanelHealthResponse;
    } catch (e) {
      return {
        ok: false,
        scopes: {
          producto: { modelo: false, metrics_csv: false, series_summary_csv: false },
          categoria: { modelo: false, metrics_csv: false, series_summary_csv: false },
          cliente: { modelo: false, metrics_csv: false, series_summary_csv: false },
        } as Record<ScopeIA, PanelHealthScope>,
        mensaje: e instanceof Error ? e.message : "Error consultando health",
      };
    }
  }

  async entrenarPanel(scope?: ScopeIA): Promise<EntrenarPanelResponse> {
    try {
      const url = new URL(`${this.urlBase}/ia/panel/entrenar/`);
      if (scope) url.searchParams.set("scope", scope);
      const res = await fetch(url.toString(), {
        method: "POST",
        headers: this.obtenerHeadersJSON(),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || data?.mensaje || res.statusText);
      }
      return data as EntrenarPanelResponse;
    } catch (e) {
      return { ok: false, mensaje: e instanceof Error ? e.message : "Error entrenando panel" };
    }
  }

  async obtenerSeries(scope: ScopeIA): Promise<PanelSeriesResponse> {
    try {
      const url = new URL(`${this.urlBase}/ia/panel/series/`);
      url.searchParams.set("scope", scope);
      const res = await fetch(url.toString(), {
        method: "GET",
        headers: this.obtenerHeadersJSON(),
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || data?.mensaje || res.statusText);
      return data as PanelSeriesResponse;
    } catch (e) {
      return {
        ok: false,
        scope,
        key: "categoria",
        count: 0,
        items: [],
        mensaje: e instanceof Error ? e.message : "Error obteniendo series del panel",
      };
    }
  }

  async obtenerPrediccionesAgregado(scope: ScopeIA): Promise<PanelPredResponse> {
    try {
      const url = new URL(`${this.urlBase}/ia/panel/predicciones/`);
      url.searchParams.set("scope", scope);
      const res = await fetch(url.toString(), {
        method: "GET",
        headers: this.obtenerHeadersJSON(),
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || data?.mensaje || res.statusText);
      return data as PanelPredResponse;
    } catch (e) {
      return {
        ok: false,
        scope,
        aggregate: true,
        count: 0,
        items: [],
        mensaje: e instanceof Error ? e.message : "Error obteniendo predicciones agregadas",
      };
    }
  }

  async obtenerPrediccionesSerie(
    scope: ScopeIA,
    serie: number | string
  ): Promise<PanelPredResponse> {
    try {
      const url = new URL(`${this.urlBase}/ia/panel/predicciones/`);
      url.searchParams.set("scope", scope);
      url.searchParams.set("serie", String(serie));
      const res = await fetch(url.toString(), {
        method: "GET",
        headers: this.obtenerHeadersJSON(),
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || data?.mensaje || res.statusText);
      return data as PanelPredResponse;
    } catch (e) {
      return {
        ok: false,
        scope,
        serie,
        count: 0,
        items: [],
        mensaje: e instanceof Error ? e.message : "Error obteniendo predicciones de la serie",
      };
    }
  }

  /** Un botón post-deploy */
  async bootstrap(): Promise<{
    ok: boolean;
    mensaje?: string;
    health?: PanelHealthResponse;
    agregados?: Record<ScopeIA, PanelPredResponse>;
    log?: string;
  }> {
    try {
      const train = await this.entrenarPanel();
      if (!train.ok) throw new Error(train.mensaje || "Fallo entrenando panel");

      const [cat, cli, pro] = await Promise.all([
        this.obtenerPrediccionesAgregado("categoria"),
        this.obtenerPrediccionesAgregado("cliente"),
        this.obtenerPrediccionesAgregado("producto"),
      ]);

      const health = await this.panelHealth();
      const ok = (cat.ok && cli.ok && pro.ok) && !!health?.ok;

      return {
        ok,
        health,
        agregados: { categoria: cat, cliente: cli, producto: pro },
        log: train?.log,
        mensaje: ok ? "Bootstrap IA completado" : "Bootstrap IA con advertencias",
      };
    } catch (e) {
      return { ok: false, mensaje: e instanceof Error ? e.message : "Error en bootstrap de la IA" };
    }
  }

  /** =============== CANTIDADES TOTALES =============== */

  /** Crear datos sintéticos (opcional en prod) */
  async generarDatosSinteticos(): Promise<{ ok: boolean; log?: string; mensaje?: string }> {
    try {
      const res = await fetch(`${this.urlBase}${RUTA_GENERAR_DATOS}`, {
        method: "POST",
        headers: this.obtenerHeadersJSON(),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || data?.mensaje || res.statusText);
      return data;
    } catch (e) {
      return { ok: false, mensaje: e instanceof Error ? e.message : "Error generando datos sintéticos" };
    }
  }

  /** Entrenar modelo de cantidades totales */
  async entrenarModeloCantidades(): Promise<{ ok: boolean; log?: string; metadata?: any; mensaje?: string }> {
    try {
      const res = await fetch(`${this.urlBase}${RUTA_TRAIN_CANTIDADES}`, {
        method: "POST",
        headers: this.obtenerHeadersJSON(),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || data?.mensaje || res.statusText);
      return data;
    } catch (e) {
      return { ok: false, mensaje: e instanceof Error ? e.message : "Error entrenando modelo de cantidades" };
    }
  }

  /** Ejecuta predict_sales_cantidades.py y devuelve preview */
  async predecirCantidades(): Promise<PredTotalesPreview> {
    try {
      // POST /ia/predict-cantidades/ (según urls.py -> PredecirCantidadesView)
      const res = await fetch(`${this.urlBase}/ia/predict-cantidades/`, {
        method: "POST",
        headers: this.obtenerHeadersJSON(),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || res.statusText);
      return data as PredTotalesPreview;
    } catch (e) {
      return {
        ok: false,
        preview: [],
        rows: 0,
        log: e instanceof Error ? e.message : "Error ejecutando predicciones totales",
      } as any;
    }
  }

  /** Lista predicciones totales (filtrando por año/mes si se pasa) */
  async obtenerPrediccionesTotales(params?: { anio?: number; mes?: number }): Promise<PredTotalesListado> {
    try {
      const url = new URL(`${this.urlBase}/ia/predicciones/`);
      if (params?.anio) url.searchParams.set("anio", String(params.anio));
      if (params?.mes) url.searchParams.set("mes", String(params.mes));
      const res = await fetch(url.toString(), {
        method: "GET",
        headers: this.obtenerHeadersJSON(),
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || res.statusText);
      return data as PredTotalesListado;
    } catch (e) {
      return {
        ok: false,
        count: 0,
        items: [],
        error: e instanceof Error ? e.message : "Error listando predicciones totales",
      };
    }
  }

  /** =============== REPORTES: PDF / EXCEL (Cantidades Totales) =============== */

  /** Helper genérico para descargar binarios (usa Content-Disposition si viene) */
  private async descargarArchivo(
    url: string,
    nombreFallback: string,
    method: "GET" | "POST" = "GET",
    body?: any
  ): Promise<{ ok: boolean; filename?: string; mensaje?: string }> {
    try {
      const res = await fetch(url, {
        method,
        headers: method === "POST" ? this.obtenerHeadersJSON() : this.obtenerHeadersBinario(),
        body: method === "POST" && body ? JSON.stringify(body) : undefined,
      });

      if (!res.ok) {
        // intenta leer JSON de error
        let detalle = "";
        try { detalle = (await res.json())?.error || ""; } catch {}
        throw new Error(detalle || `Error ${res.status}: ${res.statusText}`);
      }

      const blob = await res.blob();
      // Detectar nombre desde Content-Disposition
      const dispo = res.headers.get("Content-Disposition") || res.headers.get("content-disposition") || "";
      const match = dispo.match(/filename="?([^"]+)"?/i);
      const filename = match?.[1] || nombreFallback;

      // Forzar descarga en el navegador
      const link = document.createElement("a");
      const urlBlob = window.URL.createObjectURL(blob);
      link.href = urlBlob;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);

      return { ok: true, filename };
    } catch (e) {
      return {
        ok: false,
        mensaje: e instanceof Error ? e.message : "Error al descargar archivo",
      };
    }
  }

  private construirUrl(path: string, params?: Record<string, string | number | boolean>) {
    const url = new URL(`${this.urlBase}${path}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
      });
    }
    return url.toString();
  }

  /** Descargar PDF de predicciones totales (GET si existe; POST para regenerar) */
  /** Descargar PDF (puede aceptar params para filtrar y regenerar) */
  async descargarPDF(options?: { regenerar?: boolean; params?: Record<string, string | number | boolean>; path?: string }) {
    const regenerar = options?.regenerar || false;
    const path = options?.path || "/ia/reporte-pdf/";
    const url = this.construirUrl(path, options?.params as Record<string, string | number | boolean> | undefined);
    if (regenerar) {
      return this.descargarArchivo(url, "reporte.pdf", "POST", options?.params);
    }
    return this.descargarArchivo(url, "reporte.pdf", "GET");
  }

  /** Descargar Excel (puede aceptar params para filtrar y regenerar) */
  async descargarExcel(options?: { regenerar?: boolean; params?: Record<string, string | number | boolean>; path?: string }) {
    const regenerar = options?.regenerar || false;
    const path = options?.path || "/ia/reporte-excel/";
    const url = this.construirUrl(path, options?.params as Record<string, string | number | boolean> | undefined);
    if (regenerar) {
      return this.descargarArchivo(url, "reporte.xlsx", "POST", options?.params);
    }
    return this.descargarArchivo(url, "reporte.xlsx", "GET");
  }

    /** 🔹 Obtener ventas históricas (por total, producto, cliente o categoría) */
  async obtenerVentasHistoricas(params: {
    scope: "total" | "producto" | "cliente" | "categoria";
    anio?: number;
    mes?: number;
    producto_id?: number;
    cliente_id?: number;
    categoria?: string;
  }): Promise<{
    ok: boolean;
    scope: string;
    group_key?: string | null;
    count: number;
    items: Array<Record<string, any>>;
    error?: string;
    mensaje?: string;
  }> {
    try {
      const url = new URL(`${this.urlBase}/ia/ventas-historicas/`);
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          url.searchParams.set(k, String(v));
        }
      });

      const res = await fetch(url.toString(), {
        method: "GET",
        headers: this.obtenerHeadersJSON(),
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || data?.mensaje || res.statusText);
      }

      return data;
    } catch (e) {
      console.error("❌ Error obteniendo ventas históricas:", e);
      return {
        ok: false,
        scope: params.scope,
        count: 0,
        items: [],
        error: e instanceof Error ? e.message : "Error obteniendo ventas históricas",
      };
    }
  }


  /**
   * 📦 Descargar predicciones del Panel IA en CSV, PDF o Excel
   * Backend: path("panel/descargar/", PanelDescargarReporteView.as_view(), name="ia-panel-descargar")
   * URL final: /api/ia/panel/descargar/?scope=...&formato=...(&serie=...&force=1)
   */
  async descargarPanelIA(
    scope: ScopeIA,                          // "producto" | "categoria" | "cliente"
    formato: "csv" | "pdf" | "excel" = "csv",
    opts?: { serie?: number | string; force?: boolean }
  ): Promise<{ ok: boolean; filename?: string; mensaje?: string }> {
    const params: Record<string, string | number | boolean> = {
      scope,
      formato,
    };
    if (opts?.serie !== undefined) params.serie = String(opts.serie);
    if (opts?.force) params.force = 1;

    const url = this.construirUrl("/ia/panel/descargar/", params);
    const nombreFallback = `pred_${scope}${opts?.serie ? `_${opts.serie}` : "_all"}.${formato === "excel" ? "xlsx" : formato}`;

    return this.descargarArchivo(url, nombreFallback, "GET");
  }

  // ✨ Azúcar sintáctico por formato (opcional)
  async descargarPanelCSV(scope: ScopeIA, opts?: { serie?: number | string; force?: boolean }) {
    return this.descargarPanelIA(scope, "csv", opts);
  }
  async descargarPanelPDF(scope: ScopeIA, opts?: { serie?: number | string; force?: boolean }) {
    return this.descargarPanelIA(scope, "pdf", opts);
  }
  async descargarPanelExcel(scope: ScopeIA, opts?: { serie?: number | string; force?: boolean }) {
    return this.descargarPanelIA(scope, "excel", opts);
  }

}


export const servicioRandomForest = new ServicioRandomForest();
