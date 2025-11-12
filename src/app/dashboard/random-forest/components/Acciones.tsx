"use client"

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  onDescargarPDF: (regenerar?: boolean) => Promise<any> | void;
  onDescargarExcel: (regenerar?: boolean) => Promise<any> | void;
  onDescargarPanelPDF?: () => Promise<any> | void;
  onDescargarPanelExcel?: () => Promise<any> | void;
  onPredecirTotales: () => Promise<any> | void;
  onGenerarDatos?: () => Promise<any> | void;
  onEntrenarModeloCantidades?: () => Promise<any> | void;
  onEntrenarPanel?: () => Promise<any> | void;
  onPredecirPanel?: () => Promise<any> | void;
  onPredictCantidades?: () => Promise<any> | void;
}

export default function AccionesPanel({ onDescargarPDF, onDescargarExcel, onDescargarPanelPDF, onDescargarPanelExcel, onPredecirTotales, onGenerarDatos, onEntrenarModeloCantidades, onEntrenarPanel, onPredecirPanel, onPredictCantidades }: Props) {
  const [loading, setLoading] = useState(false);
  const [regenerarPDF, setRegenerarPDF] = useState(false);
  const [regenerarExcel, setRegenerarExcel] = useState(false);

  const run = async (fn: () => Promise<any> | void) => {
    try {
      setLoading(true);
      await fn();
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4">
      <h3 className="font-semibold mb-2">Acciones</h3>
      <div className="flex flex-col gap-3">
        {/* Sección: Descargar Predict Sales Cantidades */}
        <div className="border-b pb-3">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">📊 Cantidades</p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 mb-2">
            <Button className="w-full sm:w-auto text-sm" onClick={() => run(() => onDescargarPDF(regenerarPDF))} disabled={loading}>Descargar PDF</Button>
            <label className="inline-flex items-center ml-0 sm:ml-3 mt-2 sm:mt-0 text-xs">
              <input type="checkbox" className="mr-2" checked={regenerarPDF} onChange={(e) => setRegenerarPDF(e.target.checked)} />
              Regenerar
            </label>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <Button className="w-full sm:w-auto text-sm" onClick={() => run(() => onDescargarExcel(regenerarExcel))} disabled={loading}>Descargar Excel</Button>
            <label className="inline-flex items-center ml-0 sm:ml-3 mt-2 sm:mt-0 text-xs">
              <input type="checkbox" className="mr-2" checked={regenerarExcel} onChange={(e) => setRegenerarExcel(e.target.checked)} />
              Regenerar
            </label>
          </div>
        </div>

        {/* Sección: Descargar Panel */}
        <div className="border-b pb-3">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">📈 Panel</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="text-sm" onClick={() => run(onDescargarPanelPDF || (() => {}))} disabled={loading}>Descargar PDF Panel</Button>
            <Button variant="outline" className="text-sm" onClick={() => run(onDescargarPanelExcel || (() => {}))} disabled={loading}>Descargar Excel Panel</Button>
          </div>
        </div>

        {/* Sección: Predicciones y Entrenamiento */}
        <div>
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">⚙️ Operaciones</p>
          <div className="grid grid-cols-1 gap-2">
            <Button variant="ghost" onClick={() => run(onPredecirTotales)} disabled={loading} className="text-sm">Ejecutar predicción (preview)</Button>
            <Button variant="secondary" onClick={() => run(onGenerarDatos || (() => {}))} disabled={loading} className="text-sm">Generar datos sintéticos</Button>
            <Button variant="secondary" onClick={() => run(onEntrenarModeloCantidades || (() => {}))} disabled={loading} className="text-sm">Entrenar modelo cantidades</Button>
            <Button variant="secondary" onClick={() => run(onEntrenarPanel || (() => {}))} disabled={loading} className="text-sm">Entrenar modelo panel</Button>
            <Button variant="secondary" onClick={() => run(onPredecirPanel || (() => {}))} disabled={loading} className="text-sm">Predict sales panel</Button>
            <Button variant="secondary" onClick={() => run(onPredictCantidades || (() => {}))} disabled={loading} className="text-sm">Predict sales cantidades</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
