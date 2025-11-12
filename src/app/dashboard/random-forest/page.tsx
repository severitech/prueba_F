"use client"

import React, { useEffect, useState } from "react";
import {
  servicioRandomForest,
  ScopeIA,
  PanelSeriesResponse,
  PanelPredItem,
  PanelPredResponse,
} from "@/api/random-forest.service";
import FiltrarPanel from "./components/Filtrar";
import GraficoPanel from "./components/Grafico";
import AccionesPanel from "./components/Acciones";
import FiltroVentasHistoricas, { FiltrosVentasHistoricas } from "./components/FiltroVentasHistoricas";

export default function RandomForestPage() {
  const [scope, setScope] = useState<ScopeIA>("producto");
  const [series, setSeries] = useState<PanelSeriesResponse | null>(null);
  const [serieSeleccionada, setSerieSeleccionada] = useState<string | number | null>(null);
  const [predicciones, setPredicciones] = useState<PanelPredItem[]>([]);
  const [prediccionesCantidades, setPrediccionesCantidades] = useState<PanelPredItem[]>([]);
  const [prediccionesPanel, setPrediccionesPanel] = useState<PanelPredItem[]>([]);
  const [ventasHistoricas, setVentasHistoricas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastView, setLastView] = useState<"cantidades" | "panel" | "panel-serie" | "ventas-historicas" | null>(null);
  const [tipoVisualizacion, setTipoVisualizacion] = useState<"cantidades" | "panel" | "ventas-historicas">("cantidades");

  useEffect(() => {
    // cargar series cuando cambia el scope
    const cargarSeries = async () => {
      setCargando(true);
      setError(null);
      try {
        const res = await servicioRandomForest.obtenerSeries(scope);
        if (res.ok) {
          setSeries(res);
          // resetear selección (pero mantener predicciones anteriores)
          setSerieSeleccionada(null);
          // NO resetear prediccionesCantidades ni prediccionesPanel - mantenerlos en memoria
          // setPredicciones([]);
          // setLastView(null);
        } else {
          setError(res.mensaje || "Error al obtener series");
          setSeries(null);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setCargando(false);
      }
    };

    cargarSeries();
  }, [scope]);

  const cargarPrediccionesAgregado = async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await servicioRandomForest.obtenerPrediccionesAgregado(scope);
      if (res.ok) {
        setPrediccionesPanel(res.items || []);
        setPredicciones(res.items || []);
        setLastView("panel");
      } else {
        setError(res.mensaje || "Error al obtener predicciones agregadas");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setCargando(false);
    }
  };

  const cargarPrediccionesSerie = async (serie: string | number) => {
    setCargando(true);
    setError(null);
    try {
      const res = await servicioRandomForest.obtenerPrediccionesSerie(scope, serie);
      if (res.ok) {
        setPrediccionesPanel(res.items || []);
        setPredicciones(res.items || []);
        setLastView("panel-serie");
      } else {
        setError(res.mensaje || "Error al obtener predicciones de la serie");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setCargando(false);
    }
  };

  const handleDescargarPDF = async (regenerar = false) => {
    // Decide endpoint/params según la vista actual
    if (lastView === "panel") {
      return servicioRandomForest.descargarPDF({ regenerar, params: { scope } });
    }
    if (lastView === "panel-serie") {
      return servicioRandomForest.descargarPDF({ regenerar, params: { scope, serie: serieSeleccionada ?? "" } });
    }
    // cantidades u fallback
    return servicioRandomForest.descargarPDF({ regenerar });
  };

  const handleDescargarExcel = async (regenerar = false) => {
    if (lastView === "panel") {
      return servicioRandomForest.descargarExcel({ regenerar, params: { scope } });
    }
    if (lastView === "panel-serie") {
      return servicioRandomForest.descargarExcel({ regenerar, params: { scope, serie: serieSeleccionada ?? "" } });
    }
    return servicioRandomForest.descargarExcel({ regenerar });
  };

  const handleDescargarPanelPDF = async () => {
    try {
      if (!serieSeleccionada || serieSeleccionada === "__AGG__") {
        // Descargar agregado (sin serie)
        await servicioRandomForest.descargarPanelPDF(scope);
      } else {
        // Descargar con serie específica
        await servicioRandomForest.descargarPanelPDF(scope, { serie: serieSeleccionada });
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error descargando PDF del panel");
    }
  };

  const handleDescargarPanelExcel = async () => {
    try {
      if (!serieSeleccionada || serieSeleccionada === "__AGG__") {
        // Descargar agregado (sin serie)
        await servicioRandomForest.descargarPanelExcel(scope);
      } else {
        // Descargar con serie específica
        await servicioRandomForest.descargarPanelExcel(scope, { serie: serieSeleccionada });
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error descargando Excel del panel");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Random Forest - Panel IA</h1>
          <p className="text-sm text-gray-600">Explora predicciones por scope y serie, visualiza en gráfico y descarga reportes.</p>
        </div>
      </div>

      <FiltrarPanel
        scope={scope}
        onScopeChange={(s: ScopeIA) => setScope(s)}
        series={series}
        serieSeleccionada={serieSeleccionada}
        onSerieChange={(val: string | number | null) => {
          setSerieSeleccionada(val);
          if (val === null) {
            setPredicciones([]);
          } else {
            cargarPrediccionesSerie(val);
          }
        }}
        onCargarAgregado={cargarPrediccionesAgregado}
        loading={cargando}
      />

      <FiltroVentasHistoricas
        onAplicarFiltros={async (filtros: FiltrosVentasHistoricas) => {
          setCargando(true);
          setError(null);
          try {
            const res = await servicioRandomForest.obtenerVentasHistoricas(filtros);
            console.log("[VentasHistoricas] Respuesta:", res);
            console.log("[VentasHistoricas] Primer item:", res.items?.[0]);
            
            if (res.ok && res.items && res.items.length > 0) {
              // Convertir datos de ventas históricas al formato que espera el gráfico
              const items = res.items.map((r: any) => {
                // Detectar valor de cantidad según los campos disponibles
                let cantidadValor = 0;
                if (r.cantidad_predicha !== undefined) cantidadValor = Number(r.cantidad_predicha);
                else if (r.cantidad_ventas !== undefined) cantidadValor = Number(r.cantidad_ventas);
                else if (r.total !== undefined) cantidadValor = Number(r.total);
                else if (r.cantidad !== undefined) cantidadValor = Number(r.cantidad);
                else if (r.ventas !== undefined) cantidadValor = Number(r.ventas);
                else if (r.monto_total !== undefined) cantidadValor = Number(r.monto_total);

                // Generar período
                const periodo = r.periodo || r.fecha || `${r.anio || new Date().getFullYear()}-${String(r.mes || 1).padStart(2, "0")}`;

                const item: any = {
                  periodo,
                  anio: r.anio || new Date().getFullYear(),
                  mes: r.mes || new Date().getMonth() + 1,
                  cantidad_predicha: cantidadValor,
                };

                // Agregar identificadores si existen (para clientes/productos)
                if (r.cliente_id !== undefined) item.usuario_id = r.cliente_id; // Mapeamos cliente_id a usuario_id para compatibilidad
                if (r.producto_id !== undefined) item.producto_id = r.producto_id;
                if (r.categoria !== undefined) item.categoria = r.categoria;

                // Incluir todos los campos originales
                return { ...r, ...item };
              });

              console.log("[VentasHistoricas] Primer item transformado:", items[0]);
              console.log("[VentasHistoricas] Total de items:", items.length);
              console.log("[VentasHistoricas] Cantidad_predicha del primer item:", items[0]?.cantidad_predicha);
              setVentasHistoricas(items);
              setTipoVisualizacion("ventas-historicas");
              setLastView("ventas-historicas");
            } else {
              setError(res.error || "No se encontraron datos");
            }
          } catch (e) {
            console.error("[VentasHistoricas] Error:", e);
            setError(e instanceof Error ? e.message : "Error cargando ventas históricas");
          } finally {
            setCargando(false);
          }
        }}
        loading={cargando}
      />

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded p-3 mb-4">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <GraficoPanel 
            data={
              tipoVisualizacion === "cantidades" 
                ? prediccionesCantidades 
                : tipoVisualizacion === "ventas-historicas"
                ? ventasHistoricas
                : prediccionesPanel
            } 
            loading={cargando}
            tipoVisualizacion={tipoVisualizacion}
            onTipoVisualizacionChange={(tipo) => {
              setTipoVisualizacion(tipo);
              if (tipo === "cantidades") setPredicciones(prediccionesCantidades);
              else if (tipo === "ventas-historicas") setPredicciones(ventasHistoricas);
              else setPredicciones(prediccionesPanel);
            }}
          />
        </div>
        <div>
          <AccionesPanel
            onDescargarPDF={(regenerar?: boolean) => handleDescargarPDF(Boolean(regenerar))}
            onDescargarExcel={(regenerar?: boolean) => handleDescargarExcel(Boolean(regenerar))}
            onDescargarPanelPDF={handleDescargarPanelPDF}
            onDescargarPanelExcel={handleDescargarPanelExcel}
            onPredecirTotales={async () => {
              const res = await servicioRandomForest.predecirCantidades();
              if (res.ok && res.preview) {
                // mapear preview a items del gráfico si corresponde
                // suponer que preview tiene campos anio, mes, cantidad_predicha
                const items = (res.preview || []).map((r: any) => ({
                  periodo: r.periodo || `${r.anio}-${String(r.mes).padStart(2, "0")}`,
                  anio: r.anio,
                  mes: r.mes,
                  scope,
                  cantidad_predicha: Number(r.cantidad_predicha || r.cantidad || 0),
                  minimo: r.minimo,
                  maximo: r.maximo,
                }));
                // poblar gráfico
                (async () => {
                  // pequeña espera para UX
                  // set directamente
                })();
                // set predictions
                // @ts-ignore
                setPredicciones(items);
                setLastView("cantidades");
              } else {
                alert(res.log || res.csv_error || res.rows === 0 ? "No hay datos de preview" : "Error al predecir");
              }
            }}
            onPredictCantidades={async () => {
              setCargando(true);
              try {
                const res = await servicioRandomForest.predecirCantidades();
                if (res.ok && res.preview) {
                  const items = (res.preview || []).map((r: any) => ({
                    periodo: r.periodo || `${r.anio}-${String(r.mes).padStart(2, "0")}`,
                    anio: r.anio,
                    mes: r.mes,
                    scope,
                    cantidad_predicha: Number(r.cantidad_predicha || r.cantidad || 0),
                    minimo: r.minimo,
                    maximo: r.maximo,
                  }));
                  // @ts-ignore
                  setPredicciones(items);
                  setPrediccionesCantidades(items);
                  setTipoVisualizacion("cantidades");
                  setLastView("cantidades");
                } else {
                  alert(res.log || res.csv_error || res.rows === 0 ? "No hay datos de preview" : "Error al predecir");
                }
              } catch (e) {
                alert(e instanceof Error ? e.message : String(e));
              } finally {
                setCargando(false);
              }
            }}
            onGenerarDatos={async () => {
              const r = await servicioRandomForest.generarDatosSinteticos();
              if (r.ok) alert(r.mensaje || "Datos generados"); else alert(r.mensaje || "Error generando datos");
            }}
            onEntrenarModeloCantidades={async () => {
              const r = await servicioRandomForest.entrenarModeloCantidades();
              if (r.ok) alert(r.mensaje || r.log || "Entrenamiento completado"); else alert(r.mensaje || "Error entrenando");
            }}
            onEntrenarPanel={async () => {
              const r = await servicioRandomForest.entrenarPanel(scope);
              if (r.ok) {
                alert(r.mensaje || r.log || "Entrenamiento panel completado");
              } else {
                alert(r.mensaje || "Error entrenando panel");
              }
            }}
            onPredecirPanel={async () => {
              setCargando(true);
              try {
                const res = await servicioRandomForest.obtenerPrediccionesAgregado(scope);
                if (res.ok) {
                  setPredicciones(res.items || []);
                  setPrediccionesPanel(res.items || []);
                  setTipoVisualizacion("panel");
                  setLastView("panel");
                } else {
                  alert(res.mensaje || "Error obteniendo predicciones del panel");
                }
              } catch (e) {
                alert(e instanceof Error ? e.message : String(e));
              } finally {
                setCargando(false);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
