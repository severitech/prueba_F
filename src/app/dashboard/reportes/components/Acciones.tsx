"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { IconDownload, IconRefresh } from "@tabler/icons-react";
import { exportarJSON, exportarExcel, exportarPDF, exportarKPIsExcel, exportarKPIsPDF } from "../utils/exportar";
import { ResultadoReporte } from "@/api/reportes.service";

interface AccionesProps {
  tipoReporte: string;
  loading: boolean;
  onGenerarReporte: () => void;
  resultado?: ResultadoReporte | null;
  tieneResultados: boolean;
}

export function Acciones({
  tipoReporte,
  loading,
  onGenerarReporte,
  resultado,
  tieneResultados,
}: AccionesProps) {
  const handleDescargar = (formato: "json" | "excel" | "pdf", tipo: "datos" | "kpis") => {
    if (!resultado) return;

    const timestamp = new Date().getTime();
    const filename = `reporte_${tipoReporte}_${timestamp}`;

    if (tipo === "datos") {
      if (Array.isArray(resultado.datos) && resultado.datos.length > 0) {
        switch (formato) {
          case "json":
            exportarJSON(resultado.datos, { filename });
            break;
          case "excel":
            exportarExcel(resultado.datos, { filename, sheetName: "Datos" });
            break;
          case "pdf":
            exportarPDF(resultado.datos, {
              filename,
              title: `Reporte de ${tipoReporte.charAt(0).toUpperCase() + tipoReporte.slice(1)}`,
            });
            break;
        }
      }
    } else if (tipo === "kpis" && resultado.kpis) {
      switch (formato) {
        case "json":
          exportarJSON([resultado.kpis], { filename: `${filename}_kpis` });
          break;
        case "excel":
          exportarKPIsExcel(resultado.kpis, { filename: `${filename}_kpis` });
          break;
        case "pdf":
          exportarKPIsPDF(resultado.kpis, {
            filename: `${filename}_kpis`,
            title: `KPIs - ${tipoReporte.charAt(0).toUpperCase() + tipoReporte.slice(1)}`,
          });
          break;
      }
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Acciones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          onClick={onGenerarReporte}
          disabled={loading}
          className="w-full"
          size="sm"
        >
          <IconRefresh className="mr-2 h-4 w-4" />
          {loading ? "Generando..." : "Generar"}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full"
              size="sm"
              disabled={!tieneResultados || loading}
            >
              <IconDownload className="mr-2 h-4 w-4" />
              Descargar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <div className="px-2 py-1.5 text-xs font-semibold">Datos</div>
            <DropdownMenuItem onClick={() => handleDescargar("json", "datos")}>
              JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDescargar("excel", "datos")}>
              Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDescargar("pdf", "datos")}>
              PDF
            </DropdownMenuItem>

            {resultado?.kpis && (
              <>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-xs font-semibold">KPIs</div>
                <DropdownMenuItem onClick={() => handleDescargar("json", "kpis")}>
                  JSON KPIs
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDescargar("excel", "kpis")}>
                  Excel KPIs
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDescargar("pdf", "kpis")}>
                  PDF KPIs
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}
