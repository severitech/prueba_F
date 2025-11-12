"use client"

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

type ScopeVentas = "total" | "producto" | "cliente";

export interface FiltrosVentasHistoricas {
  scope: ScopeVentas;
  producto_id?: number;
  cliente_id?: number;
  anio?: number;
  mes?: number;
}

interface Props {
  onAplicarFiltros: (filtros: FiltrosVentasHistoricas) => void;
  loading?: boolean;
}

const MESES = [
  { valor: 1, label: "Enero" },
  { valor: 2, label: "Febrero" },
  { valor: 3, label: "Marzo" },
  { valor: 4, label: "Abril" },
  { valor: 5, label: "Mayo" },
  { valor: 6, label: "Junio" },
  { valor: 7, label: "Julio" },
  { valor: 8, label: "Agosto" },
  { valor: 9, label: "Septiembre" },
  { valor: 10, label: "Octubre" },
  { valor: 11, label: "Noviembre" },
  { valor: 12, label: "Diciembre" },
];

const ANIOS = Array.from({ length: 10 }, (_, i) => 2015 + i);

export default function FiltroVentasHistoricas({ onAplicarFiltros, loading }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [scope, setScope] = useState<ScopeVentas>("total");
  const [producto_id, setProductoId] = useState<number | undefined>();
  const [cliente_id, setClienteId] = useState<number | undefined>();
  const [anio, setAnio] = useState<number | undefined>();
  const [mes, setMes] = useState<number | undefined>();

  const handleAplicar = () => {
    onAplicarFiltros({
      scope,
      producto_id,
      cliente_id,
      anio,
      mes,
    });
  };

  const handleLimpiar = () => {
    setScope("total");
    setProductoId(undefined);
    setClienteId(undefined);
    setAnio(undefined);
    setMes(undefined);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-3 sm:p-4 mb-4">
      {/* Header colapsable */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full mb-3"
      >
        <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white">
          📊 Filtros - Ventas Históricas
        </h3>
        <span className={`text-xl transition-transform ${expanded ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>

      {expanded && (
        <div className="space-y-4">
          {/* Scope Selection */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Agrupar por
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(["total", "producto", "cliente"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setScope(s);
                    setProductoId(undefined);
                    setClienteId(undefined);
                  }}
                  className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    scope === s
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {s === "total" && "📊 Total"}
                  {s === "producto" && "📦 Producto"}
                  {s === "cliente" && "👤 Cliente"}
                </button>
              ))}
            </div>
          </div>

          {/* Filtros específicos por scope */}
          {scope === "producto" && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ID del Producto (opcional)
              </label>
              <input
                type="number"
                value={producto_id || ""}
                onChange={(e) => setProductoId(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Dejar en blanco para ver todos"
                className="w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          )}

          {scope === "cliente" && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ID del Cliente (opcional)
              </label>
              <input
                type="number"
                value={cliente_id || ""}
                onChange={(e) => setClienteId(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Dejar en blanco para ver todos"
                className="w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Año y Mes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Año (opcional)
              </label>
              <select
                value={anio || ""}
                onChange={(e) => setAnio(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Todos los años</option>
                {ANIOS.map((año) => (
                  <option key={año} value={año}>
                    {año}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mes (opcional)
              </label>
              <select
                value={mes || ""}
                onChange={(e) => setMes(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Todos los meses</option>
                {MESES.map((m) => (
                  <option key={m.valor} value={m.valor}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleAplicar}
              disabled={loading}
              className="flex-1 text-sm"
            >
              🔍 Cargar Ventas
            </Button>
            <Button
              onClick={handleLimpiar}
              variant="outline"
              className="flex-1 text-sm"
            >
              🔄 Limpiar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
