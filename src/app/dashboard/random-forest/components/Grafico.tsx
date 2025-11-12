"use client"

import React, { useState } from "react";
import * as Recharts from "recharts";
import { PanelPredItem } from "@/api/random-forest.service";

interface Props {
  data: PanelPredItem[];
  loading?: boolean;
  tipoVisualizacion?: "cantidades" | "panel" | "ventas-historicas";
  onTipoVisualizacionChange?: (tipo: "cantidades" | "panel" | "ventas-historicas") => void;
}

type ChartType = "lineas" | "barras" | "area" | "comparativa";

export default function GraficoPanel({ data, loading, tipoVisualizacion = "cantidades", onTipoVisualizacionChange }: Props) {
  const [chartType, setChartType] = useState<ChartType>("lineas");

  React.useEffect(() => {
    if (tipoVisualizacion === "ventas-historicas") {
      console.log("[Grafico] Ventas Históricas - data.length:", data.length);
      console.log("[Grafico] Ventas Históricas - primer item:", data[0]);
      console.log("[Grafico] Ventas Históricas - campos del primer item:", data[0] ? Object.keys(data[0]) : []);
      
      // Log de los valores de cantidad_predicha
      if (data.length > 0) {
        const cantidades = data.map(d => ({ 
          periodo: d.periodo,
          cantidad_predicha: d.cantidad_predicha,
          min: d.minimo,
          max: d.maximo
        }));
        console.log("[Grafico] Primeros 3 items con cantidad_predicha:", cantidades.slice(0, 3));
      }
    }
  }, [data, tipoVisualizacion]);

  // Detectar si hay series por categoria/producto/usuario
  const seriesKey = data.find((d) => d.categoria !== undefined)
    ? "categoria"
    : data.find((d) => d.producto_id !== undefined)
    ? "producto_id"
    : data.find((d) => d.usuario_id !== undefined)
    ? "usuario_id"
    : null;

  // Generar labels ordenados
  const labels = Array.from(
    new Set(
      data.map((it) => it.periodo || `${it.anio}-${String(it.mes).padStart(2, "0")}`)
    )
  );

  // Si hay seriesKey, pivotar los datos para múltiples líneas
  let chartData: Array<Record<string, any>> = [];
  let seriesNames: string[] = [];

  if (seriesKey) {
    const map: Record<string, Record<string, number>> = {};
    data.forEach((it) => {
      const label = it.periodo || `${it.anio}-${String(it.mes).padStart(2, "0")}`;
      const seriesName = String((it as any)[seriesKey] ?? "");
      if (!seriesName) return;
      if (!map[label]) map[label] = {};
      map[label][seriesName] = Number(it.cantidad_predicha || 0);
      if (!seriesNames.includes(seriesName)) seriesNames.push(seriesName);
    });

    chartData = labels.map((label) => ({ label, ...(map[label] || {}) }));
  } else {
    chartData = data.map((it) => ({
      label: it.periodo || `${it.anio}-${String(it.mes).padStart(2, "0")}`,
      pred: it.cantidad_predicha,
      min: it.minimo,
      max: it.maximo,
    }));
  }

  const COLORS = [
    "#7c3aed",
    "#059669",
    "#ef4444",
    "#f59e0b",
    "#0ea5e9",
    "#10b981",
    "#f97316",
    "#06b6d4",
  ];

  const renderChart = () => {
    // Validar que hay datos
    if (!chartData || chartData.length === 0) {
      console.log("[Grafico] renderChart - no hay datos. chartData:", chartData);
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          Sin datos para graficar
        </div>
      );
    }

    console.log("[Grafico] renderChart - chartData.length:", chartData.length, "chartType:", chartType, "seriesKey:", seriesKey);

    switch (chartType) {
      case "lineas":
        return (
          <Recharts.ResponsiveContainer width="100%" height="100%">
            <Recharts.LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 60 }}>
              <Recharts.CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <Recharts.XAxis 
                dataKey="label" 
                tick={{ fontSize: 12 }}
                angle={chartData.length > 8 ? -45 : 0}
                textAnchor={chartData.length > 8 ? ("end" as const) : ("middle" as const)}
                height={chartData.length > 8 ? 80 : 50}
              />
              <Recharts.YAxis tick={{ fontSize: 12 }} />
              <Recharts.Tooltip 
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "4px" }}
                cursor={{ stroke: "#ccc", strokeWidth: 1 }}
              />
              <Recharts.Legend wrapperStyle={{ paddingTop: "10px" }} />
              {seriesKey && seriesNames.length > 0 ? (
                seriesNames.slice(0, 8).map((name, idx) => (
                  <Recharts.Line
                    key={`line-${name}-${idx}`}
                    type="monotone"
                    dataKey={String(name)}
                    name={String(name)}
                    stroke={COLORS[idx % COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={true}
                  />
                ))
              ) : (
                <>
                  <Recharts.Line
                    type="monotone"
                    dataKey="pred"
                    name="Predicción"
                    stroke="#7c3aed"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    isAnimationActive={true}
                  />
                  {chartData.some(d => d.min !== undefined) && (
                    <Recharts.Line
                      type="monotone"
                      dataKey="min"
                      name="Mínimo"
                      stroke="#ef4444"
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      dot={false}
                      isAnimationActive={true}
                    />
                  )}
                  {chartData.some(d => d.max !== undefined) && (
                    <Recharts.Line
                      type="monotone"
                      dataKey="max"
                      name="Máximo"
                      stroke="#10b981"
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      dot={false}
                      isAnimationActive={true}
                    />
                  )}
                </>
              )}
            </Recharts.LineChart>
          </Recharts.ResponsiveContainer>
        );

      case "barras":
        return (
          <Recharts.ResponsiveContainer width="100%" height="100%">
            <Recharts.BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 60 }}>
              <Recharts.CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <Recharts.XAxis 
                dataKey="label" 
                tick={{ fontSize: 12 }}
                angle={chartData.length > 8 ? -45 : 0}
                textAnchor={chartData.length > 8 ? ("end" as const) : ("middle" as const)}
                height={chartData.length > 8 ? 80 : 50}
              />
              <Recharts.YAxis tick={{ fontSize: 12 }} />
              <Recharts.Tooltip 
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "4px" }}
              />
              <Recharts.Legend wrapperStyle={{ paddingTop: "10px" }} />
              {seriesKey && seriesNames.length > 0 ? (
                seriesNames.slice(0, 8).map((name, idx) => (
                  <Recharts.Bar
                    key={`bar-${name}-${idx}`}
                    dataKey={String(name)}
                    name={String(name)}
                    fill={COLORS[idx % COLORS.length]}
                    isAnimationActive={true}
                  />
                ))
              ) : (
                <Recharts.Bar 
                  dataKey="pred" 
                  name="Predicción" 
                  fill="#7c3aed"
                  isAnimationActive={true}
                />
              )}
            </Recharts.BarChart>
          </Recharts.ResponsiveContainer>
        );

      case "area":
        return (
          <Recharts.ResponsiveContainer width="100%" height="100%">
            <Recharts.AreaChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 60 }}>
              <Recharts.CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <Recharts.XAxis 
                dataKey="label" 
                tick={{ fontSize: 12 }}
                angle={chartData.length > 8 ? -45 : 0}
                textAnchor={chartData.length > 8 ? ("end" as const) : ("middle" as const)}
                height={chartData.length > 8 ? 80 : 50}
              />
              <Recharts.YAxis tick={{ fontSize: 12 }} />
              <Recharts.Tooltip 
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "4px" }}
              />
              <Recharts.Legend wrapperStyle={{ paddingTop: "10px" }} />
              {seriesKey && seriesNames.length > 0 ? (
                seriesNames.slice(0, 8).map((name, idx) => (
                  <Recharts.Area
                    key={`area-${name}-${idx}`}
                    type="monotone"
                    dataKey={String(name)}
                    name={String(name)}
                    stroke={COLORS[idx % COLORS.length]}
                    fill={COLORS[idx % COLORS.length]}
                    fillOpacity={0.2}
                    isAnimationActive={true}
                  />
                ))
              ) : (
                <Recharts.Area
                  type="monotone"
                  dataKey="pred"
                  name="Predicción"
                  stroke="#7c3aed"
                  fill="#7c3aed"
                  fillOpacity={0.3}
                  isAnimationActive={true}
                />
              )}
            </Recharts.AreaChart>
          </Recharts.ResponsiveContainer>
        );

      case "comparativa":
        // Gráfico comparativo: Predicción vs Mínimo vs Máximo (solo para cantidades sin seriesKey)
        if (!seriesKey && chartData.some(d => d.min !== undefined && d.max !== undefined)) {
          return (
            <Recharts.ResponsiveContainer width="100%" height="100%">
              <Recharts.BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 60 }}>
                <Recharts.CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <Recharts.XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 12 }}
                  angle={chartData.length > 8 ? -45 : 0}
                  textAnchor={chartData.length > 8 ? ("end" as const) : ("middle" as const)}
                  height={chartData.length > 8 ? 80 : 50}
                />
                <Recharts.YAxis tick={{ fontSize: 12 }} />
                <Recharts.Tooltip 
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "4px" }}
                />
                <Recharts.Legend wrapperStyle={{ paddingTop: "10px" }} />
                <Recharts.Bar 
                  dataKey="min" 
                  name="Mínimo" 
                  fill="#ef4444"
                  isAnimationActive={true}
                />
                <Recharts.Bar 
                  dataKey="pred" 
                  name="Predicción" 
                  fill="#7c3aed"
                  isAnimationActive={true}
                />
                <Recharts.Bar 
                  dataKey="max" 
                  name="Máximo" 
                  fill="#10b981"
                  isAnimationActive={true}
                />
              </Recharts.BarChart>
            </Recharts.ResponsiveContainer>
          );
        }
        // Fallback a líneas si no hay datos comparativos (cuando es panel/series)
        if (seriesKey && seriesNames.length > 0) {
          return renderChart_Lineas();
        }
        // Si no hay datos válidos para comparativa, mostrar barras simples
        return (
          <Recharts.ResponsiveContainer width="100%" height="100%">
            <Recharts.BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 60 }}>
              <Recharts.CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <Recharts.XAxis 
                dataKey="label" 
                tick={{ fontSize: 12 }}
                angle={chartData.length > 8 ? -45 : 0}
                textAnchor={chartData.length > 8 ? ("end" as const) : ("middle" as const)}
                height={chartData.length > 8 ? 80 : 50}
              />
              <Recharts.YAxis tick={{ fontSize: 12 }} />
              <Recharts.Tooltip 
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "4px" }}
              />
              <Recharts.Legend wrapperStyle={{ paddingTop: "10px" }} />
              <Recharts.Bar 
                dataKey="pred" 
                name="Predicción" 
                fill="#7c3aed"
                isAnimationActive={true}
              />
            </Recharts.BarChart>
          </Recharts.ResponsiveContainer>
        );

      default:
        return renderChart_Lineas();
    }
  };

  const renderChart_Lineas = () => (
    <Recharts.ResponsiveContainer width="100%" height="100%">
      <Recharts.LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
        <Recharts.CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <Recharts.XAxis 
          dataKey="label" 
          tick={{ fontSize: 12 }}
          angle={chartData.length > 8 ? -45 : 0}
          textAnchor={chartData.length > 8 ? ("end" as const) : ("middle" as const)}
          height={chartData.length > 8 ? 60 : 40}
        />
        <Recharts.YAxis tick={{ fontSize: 12 }} />
        <Recharts.Tooltip 
          contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "4px" }}
          cursor={{ stroke: "#ccc", strokeWidth: 1 }}
        />
        <Recharts.Legend wrapperStyle={{ paddingTop: "10px" }} />
        {seriesKey && seriesNames.length > 0 ? (
          seriesNames.slice(0, 8).map((name, idx) => (
            <Recharts.Line
              key={`line-${name}-${idx}`}
              type="monotone"
              dataKey={String(name)}
              name={String(name)}
              stroke={COLORS[idx % COLORS.length]}
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
            />
          ))
        ) : (
          <>
            <Recharts.Line 
              type="monotone" 
              dataKey="pred" 
              name="Predicción"
              stroke="#7c3aed" 
              strokeWidth={2} 
              dot={{ r: 3 }}
              isAnimationActive={true}
            />
            {chartData.some(d => d.min !== undefined) && (
              <Recharts.Line
                type="monotone"
                dataKey="min"
                name="Mínimo"
                stroke="#ef4444"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
                isAnimationActive={true}
              />
            )}
            {chartData.some(d => d.max !== undefined) && (
              <Recharts.Line
                type="monotone"
                dataKey="max"
                name="Máximo"
                stroke="#10b981"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
                isAnimationActive={true}
              />
            )}
          </>
        )}
      </Recharts.LineChart>
    </Recharts.ResponsiveContainer>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-3 sm:p-4 w-full">
      {/* Header con selectores */}
      <div className="flex flex-col gap-3 mb-4">
        <h3 className="font-semibold text-base sm:text-lg">Gráfico de Predicciones</h3>
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <select
            value={tipoVisualizacion}
            onChange={(e) => onTipoVisualizacionChange?.(e.target.value as "cantidades" | "panel" | "ventas-historicas")}
            className="text-xs sm:text-sm border rounded px-2 py-1.5 bg-white dark:bg-gray-700 dark:text-white flex-1 sm:flex-none"
          >
            <option value="cantidades">📊 Predict Sales Cantidades</option>
            <option value="panel">📈 Predict Sales Panel</option>
            <option value="ventas-historicas">📉 Ventas Históricas</option>
          </select>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as ChartType)}
            className="text-xs sm:text-sm border rounded px-2 py-1.5 bg-white dark:bg-gray-700 dark:text-white flex-1 sm:flex-none"
          >
            <option value="lineas">📉 Líneas</option>
            <option value="barras">📊 Barras</option>
            <option value="area">📈 Área</option>
            <option value="comparativa">⚖️ Comparativa</option>
          </select>
        </div>
      </div>

      {/* Gráfico */}
      {loading ? (
        <div className="text-center py-12 sm:py-16 text-gray-500">
          <div className="animate-spin h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          Cargando gráfico...
        </div>
      ) : !data || data.length === 0 ? (
        <div className="text-center py-12 sm:py-16 text-gray-500">
          <p className="text-sm sm:text-base">Sin datos para mostrar.</p>
          <p className="text-xs sm:text-sm mt-1">Ejecuta una predicción primero.</p>
        </div>
      ) : (
        <div className="w-full" style={{ height: "400px", display: "flex", flexDirection: "column" }}>
          {renderChart()}
        </div>
      )}
    </div>
  );
}


