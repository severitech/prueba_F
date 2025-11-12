"use client";

import { useState, useEffect } from "react";
import { servicioReportes, RespuestaBasica, ResultadoReporte } from "@/api/reportes.service";
import { Acciones, FiltroReportes, TabsReportes } from "./components";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Página de Reportes - Generador de reportes dinámicos con filtros estáticos y por voz
export default function ReportesPage() {
  const [tipoReporte, setTipoReporte] = useState<"ventas" | "productos" | "clientes" | "inventario">("ventas");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<ResultadoReporte | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<Record<string, any>>({});

  // Generar reporte basado en tipo y filtros
  const generarReporte = async (tipo: string, params?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    setResultado(null);

    try {
      const queryParams = { ...filtros, ...params };
      let respuesta: RespuestaBasica<ResultadoReporte> | null = null;

      console.log(`[Reportes] Generando reporte tipo: ${tipo}`, queryParams);

      switch (tipo) {
        case "ventas":
          respuesta = await servicioReportes.getVentas(queryParams as any);
          break;
        case "productos":
          respuesta = await servicioReportes.getProductos(queryParams as any);
          break;
        case "clientes":
          respuesta = await servicioReportes.getClientes(queryParams as any);
          break;
        case "inventario":
          respuesta = await servicioReportes.getInventario(queryParams as any);
          break;
        default:
          throw new Error("Tipo de reporte no válido");
      }

      if (!respuesta?.success) {
        throw new Error(respuesta?.error || "Error generando reporte");
      }

      setResultado(respuesta.reporte || null);
      console.log(`[Reportes] Reporte generado exitosamente`, respuesta.reporte);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : "Error desconocido";
      setError(mensaje);
      console.error(`[Reportes] Error:`, mensaje);
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  const handleAplicarFiltros = (nuevosFiltros: Record<string, any>) => {
    console.log("[Reportes] Aplicando filtros:", nuevosFiltros);
    setFiltros(nuevosFiltros);
    generarReporte(tipoReporte, nuevosFiltros);
  };

  // Cambiar tipo de reporte
  const handleCambiarTipo = (tipo: string) => {
    const tipoValido = tipo as "ventas" | "productos" | "clientes" | "inventario";
    setTipoReporte(tipoValido);
    setResultado(null);
    generarReporte(tipoValido, filtros);
  };

  // Manejar resultados de comandos por voz
  const handleResultadoVoz = (respuesta: RespuestaBasica<ResultadoReporte>) => {
    console.log("[Reportes] Resultado voz recibido:", respuesta);
    setResultado(respuesta.reporte || null);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Encabezado */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
        <p className="text-muted-foreground">Genera y visualiza reportes de ventas, productos, clientes e inventario</p>
      </div>

      {/* Acciones y Filtros */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-4">
        <Acciones 
          tipoReporte={tipoReporte}
          loading={loading}
          onGenerarReporte={() => generarReporte(tipoReporte)}
          resultado={resultado}
          tieneResultados={!!resultado}
        />
        <div className="lg:col-span-3">
          <FiltroReportes
            tipoReporte={tipoReporte}
            onAplicarFiltros={handleAplicarFiltros}
            onCambiarTipo={handleCambiarTipo}
            onResultadoVoz={handleResultadoVoz}
            loading={loading}
          />
        </div>
      </div>

      {/* Mensajes de error */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Resultados */}
      {loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground">Generando reporte...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {resultado && !loading && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados del Reporte</CardTitle>
            <CardDescription>
              {resultado.total ? `Total de registros: ${resultado.total}` : "Reporte generado"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TabsReportes 
              tipoReporte={tipoReporte}
              resultado={resultado}
            />
          </CardContent>
        </Card>
      )}

      {!resultado && !loading && !error && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Selecciona filtros y genera un reporte para ver los resultados aquí</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
