"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ResultadoReporte } from "@/api/reportes.service";
import { Badge } from "@/components/ui/badge";

interface TabsReportesProps {
  tipoReporte: string;
  resultado: ResultadoReporte;
}

export function TabsReportes({ tipoReporte, resultado }: TabsReportesProps) {
  const { kpis, datos } = resultado;

  return (
    <Tabs defaultValue="datos" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="kpis">KPIs</TabsTrigger>
        <TabsTrigger value="datos">Datos Detallados</TabsTrigger>
      </TabsList>

      {/* Tab de KPIs */}
      <TabsContent value="kpis" className="space-y-4">
        {kpis ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(kpis).map(([key, value]) => (
              <Card key={key}>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground capitalize">
                      {key.replace(/_/g, " ")}
                    </p>
                    <p className="text-2xl font-bold">
                      {typeof value === "number"
                        ? value.toLocaleString("es-CO", {
                            maximumFractionDigits: 2,
                          })
                        : value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">No hay KPIs disponibles</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Tab de Datos */}
      <TabsContent value="datos" className="space-y-4">
        {datos && Array.isArray(datos) && datos.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(datos[0] || {}).map((key) => (
                    <TableHead key={key} className="capitalize">
                      {key.replace(/_/g, " ")}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {datos.map((row: any, idx: number) => (
                  <TableRow key={idx}>
                    {Object.values(row).map((value: any, cellIdx: number) => (
                      <TableCell key={cellIdx}>
                        {typeof value === "boolean" ? (
                          <Badge variant={value ? "default" : "secondary"}>
                            {value ? "Sí" : "No"}
                          </Badge>
                        ) : typeof value === "number" ? (
                          value.toLocaleString("es-CO", {
                            maximumFractionDigits: 2,
                          })
                        ) : (
                          value
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : typeof datos === "object" && datos !== null && !Array.isArray(datos) ? (
          <div className="space-y-4">
            {Object.entries(datos).map(([key, value]) => (
              <Card key={key}>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold capitalize">{key.replace(/_/g, " ")}</h4>
                    <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}
