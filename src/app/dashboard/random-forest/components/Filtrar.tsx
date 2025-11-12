"use client"

import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PanelSeriesResponse, ScopeIA } from "@/api/random-forest.service";

interface Props {
  scope: ScopeIA;
  onScopeChange: (s: ScopeIA) => void;
  series: PanelSeriesResponse | null;
  serieSeleccionada: string | number | null;
  onSerieChange: (v: string | number | null) => void;
  onCargarAgregado: () => void;
  loading?: boolean;
}

export default function FiltrarPanel({ scope, onScopeChange, series, serieSeleccionada, onSerieChange, onCargarAgregado, loading }: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4 mb-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Label>Scope</Label>
          <Select value={scope} onValueChange={(v) => onScopeChange(v as ScopeIA)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="producto">Producto</SelectItem>
              <SelectItem value="categoria">Categoria</SelectItem>
              <SelectItem value="cliente">Cliente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Label>Serie</Label>
          {/* Usar un valor placeholder especial en lugar de cadena vacía */}
          <Select value={serieSeleccionada !== null ? String(serieSeleccionada) : "__AGG__"} onValueChange={(v) => onSerieChange(v === "__AGG__" ? null : (isNaN(Number(v)) ? v : Number(v)))}>
            <SelectTrigger>
              <SelectValue placeholder={series ? "Selecciona serie" : "Cargando..."} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__AGG__">-- Agregado --</SelectItem>
              {series?.items?.map((it, idx) => {
                const key = series.key || "serie";
                const label = (it as any)[key] ?? `Item ${idx}`;
                const value = (it as any)[key];
                return (
                  <SelectItem key={idx} value={String(value)}>
                    {String(label)}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button onClick={onCargarAgregado} disabled={loading}>
            Cargar Agregado
          </Button>
        </div>
      </div>
    </div>
  );
}
