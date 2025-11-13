"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { IconMicrophone } from "@tabler/icons-react";
import { servicioReportes, RespuestaBasica, ResultadoReporte } from "@/api/reportes.service";
import { enviarComandoConFallback, enviarAudioConFallback } from "../utils/comandos";

interface FiltroReportesProps {
  tipoReporte: string;
  onAplicarFiltros: (filtros: Record<string, any>) => void;
  onCambiarTipo: (tipo: string) => void;
  onResultadoVoz?: (resultado: RespuestaBasica<ResultadoReporte>) => void;
  loading: boolean;
}

export function FiltroReportes({
  tipoReporte,
  onAplicarFiltros,
  onCambiarTipo,
  onResultadoVoz,
  loading,
}: FiltroReportesProps) {
  const [localFiltros, setLocalFiltros] = useState<Record<string, any>>({});
  const [comandoTexto, setComandoTexto] = useState("");
  const [grabandoAudio, setGrabandoAudio] = useState(false);
  const [audioBits, setAudioBits] = useState<Blob | null>(null);
  const [estadoVoz, setEstadoVoz] = useState<"idle" | "grabando" | "procesando">("idle");
  const [mensajeVoz, setMensajeVoz] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleAplicar = () => {
    onAplicarFiltros(localFiltros);
  };

  const handleLimpiar = () => {
    setLocalFiltros({});
    onAplicarFiltros({});
  };

  // Audio - Iniciar grabación
  const iniciarGrabacion = async () => {
    try {
      setGrabandoAudio(true);
      setMensajeVoz("Grabando... Habla ahora");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        if (chunks.length > 0) {
          const blob = new Blob(chunks, { type: "audio/webm" });
          setAudioBits(blob);
          setMensajeVoz(`✓ Audio capturado (${(blob.size / 1024).toFixed(2)} KB). Click en "Procesar Audio"`);
          setGrabandoAudio(false);
        } else {
          setMensajeVoz("✗ No se capturó audio. Intenta de nuevo");
          setGrabandoAudio(false);
        }
      };

      mediaRecorder.start();
      
      // Auto-stop después de 30 segundos
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
          streamRef.current?.getTracks().forEach((track) => track.stop());
        }
      }, 30000);
    } catch (err) {
      setMensajeVoz("✗ Error accediendo al micrófono. Verifica permisos");
      setGrabandoAudio(false);
      console.error("[Reportes] Error grabación:", err);
    }
  };

  // Audio - Detener grabación
  const detenerGrabacion = () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      setGrabandoAudio(false);
    } catch (err) {
      console.error("[Reportes] Error deteniendo grabación:", err);
      setGrabandoAudio(false);
    }
  };

  // Enviar comando por texto
  const enviarComandoTexto = async () => {
    if (!comandoTexto.trim()) {
      setMensajeVoz("Escribe un comando");
      return;
    }

    setEstadoVoz("procesando");
    setMensajeVoz("Procesando comando...");

    try {
      const resultado = await enviarComandoConFallback(comandoTexto);
      console.log("[Reportes] Resultado texto:", resultado);

      if (resultado.success && resultado.reporte) {
        setMensajeVoz(`✓ Comando procesado: ${resultado.comando_procesado || "ejecutado"}`);
        onResultadoVoz?.(resultado);
        setComandoTexto("");
      } else {
        setMensajeVoz(`✗ Error: ${resultado.error || "No se pudo procesar"}`);
      }
    } catch (err) {
      setMensajeVoz(`Error: ${err instanceof Error ? err.message : "desconocido"}`);
    } finally {
      setEstadoVoz("idle");
    }
  };

  // Enviar audio
  const enviarAudio = async () => {
    if (!audioBits) {
      setMensajeVoz("No hay audio capturado");
      return;
    }

    setEstadoVoz("procesando");
    setMensajeVoz("Procesando audio...");

    try {
      const resultado = await enviarAudioConFallback(audioBits);
      console.log("[Reportes] Resultado audio:", resultado);

      if (resultado.success && resultado.reporte) {
        setMensajeVoz(`✓ Audio procesado: ${resultado.comando_detectado || "procesado"}`);
        onResultadoVoz?.(resultado);
        setAudioBits(null);
      } else {
        setMensajeVoz(`✗ Error: ${resultado.error || "No se pudo procesar"}`);
      }
    } catch (err) {
      setMensajeVoz(`Error: ${err instanceof Error ? err.message : "desconocido"}`);
    } finally {
      setEstadoVoz("idle");
    }
  };

  return (
    <div className="space-y-4">
      {/* Card de Filtros Estáticos */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros Estáticos</CardTitle>
          <CardDescription>Selecciona el tipo de reporte y aplica filtros tradicionales</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
        {/* Selector de tipo de reporte */}
        <div className="space-y-2">
          <Label htmlFor="tipo-reporte">Tipo de Reporte</Label>
          <Select
            value={tipoReporte}
            onValueChange={(valor) => {
              onCambiarTipo(valor);
              setLocalFiltros({});
            }}
            disabled={loading}
          >
            <SelectTrigger id="tipo-reporte">
              <SelectValue placeholder="Selecciona un reporte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ventas">Ventas</SelectItem>
              <SelectItem value="productos">Productos</SelectItem>
              <SelectItem value="clientes">Clientes</SelectItem>
              <SelectItem value="inventario">Inventario</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtros específicos por tipo */}
        <Tabs defaultValue={tipoReporte} className="w-full">
          {/* Filtros de Ventas */}
          <TabsContent value="ventas" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fecha-inicio">Fecha Inicio</Label>
                <Input
                  id="fecha-inicio"
                  type="date"
                  value={localFiltros.fecha_inicio || ""}
                  onChange={(e) =>
                    setLocalFiltros({ ...localFiltros, fecha_inicio: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha-fin">Fecha Fin</Label>
                <Input
                  id="fecha-fin"
                  type="date"
                  value={localFiltros.fecha_fin || ""}
                  onChange={(e) =>
                    setLocalFiltros({ ...localFiltros, fecha_fin: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría</Label>
                <Input
                  id="categoria"
                  placeholder="p.ej: Electrónica"
                  value={localFiltros.categoria || ""}
                  onChange={(e) =>
                    setLocalFiltros({ ...localFiltros, categoria: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={localFiltros.estado || "todos"}
                  onValueChange={(valor) =>
                    setLocalFiltros({ ...localFiltros, estado: valor === "todos" ? "" : valor })
                  }
                  disabled={loading}
                >
                  <SelectTrigger id="estado">
                    <SelectValue placeholder="Selecciona estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="completada">Completada</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* Filtros de Productos */}
          <TabsContent value="productos" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="categoria-prod">Categoría</Label>
                <Input
                  id="categoria-prod"
                  placeholder="p.ej: Electrónica"
                  value={localFiltros.categoria || ""}
                  onChange={(e) =>
                    setLocalFiltros({ ...localFiltros, categoria: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock-minimo">Stock Mínimo</Label>
                <Input
                  id="stock-minimo"
                  type="number"
                  placeholder="0"
                  value={localFiltros.stock_minimo || ""}
                  onChange={(e) =>
                    setLocalFiltros({ ...localFiltros, stock_minimo: parseInt(e.target.value) || undefined })
                  }
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock-maximo">Stock Máximo</Label>
                <Input
                  id="stock-maximo"
                  type="number"
                  placeholder="1000"
                  value={localFiltros.stock_maximo || ""}
                  onChange={(e) =>
                    setLocalFiltros({ ...localFiltros, stock_maximo: parseInt(e.target.value) || undefined })
                  }
                  disabled={loading}
                />
              </div>
            </div>
          </TabsContent>

          {/* Filtros de Clientes */}
          <TabsContent value="clientes" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tipo-cliente">Tipo Cliente</Label>
                <Select
                  value={localFiltros.tipo_cliente || "todos"}
                  onValueChange={(valor) =>
                    setLocalFiltros({ ...localFiltros, tipo_cliente: valor === "todos" ? "" : valor })
                  }
                  disabled={loading}
                >
                  <SelectTrigger id="tipo-cliente">
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="empresa">Empresa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha-inicio-cliente">Desde</Label>
                <Input
                  id="fecha-inicio-cliente"
                  type="date"
                  value={localFiltros.fecha_inicio || ""}
                  onChange={(e) =>
                    setLocalFiltros({ ...localFiltros, fecha_inicio: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha-fin-cliente">Hasta</Label>
                <Input
                  id="fecha-fin-cliente"
                  type="date"
                  value={localFiltros.fecha_fin || ""}
                  onChange={(e) =>
                    setLocalFiltros({ ...localFiltros, fecha_fin: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
            </div>
          </TabsContent>

          {/* Filtros de Inventario */}
          <TabsContent value="inventario" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="stock-min-inv">Stock Mínimo</Label>
                <Input
                  id="stock-min-inv"
                  type="number"
                  placeholder="0"
                  value={localFiltros.stock_minimo || ""}
                  onChange={(e) =>
                    setLocalFiltros({ ...localFiltros, stock_minimo: parseInt(e.target.value) || undefined })
                  }
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock-max-inv">Stock Máximo</Label>
                <Input
                  id="stock-max-inv"
                  type="number"
                  placeholder="1000"
                  value={localFiltros.stock_maximo || ""}
                  onChange={(e) =>
                    setLocalFiltros({ ...localFiltros, stock_maximo: parseInt(e.target.value) || undefined })
                  }
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria-inv">Categoría</Label>
                <Input
                  id="categoria-inv"
                  placeholder="p.ej: Electrónica"
                  value={localFiltros.categoria || ""}
                  onChange={(e) =>
                    setLocalFiltros({ ...localFiltros, categoria: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Botones de acción */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleAplicar}
            disabled={loading}
            className="flex-1"
          >
            Aplicar Filtros
          </Button>
          <Button
            onClick={handleLimpiar}
            variant="outline"
            disabled={loading || estadoVoz === "procesando"}
            className="flex-1"
          >
            Limpiar
          </Button>
        </div>
      </CardContent>
    </Card>

    {/* Filtros Dinámicos por Voz */}
    <Card>
      <CardHeader>
        <CardTitle>Filtros Dinámicos por Voz</CardTitle>
        <CardDescription>Usa texto o voz para generar reportes de forma natural</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tab de Voz */}
        <Tabs defaultValue="texto" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="texto">Comando Texto</TabsTrigger>
            <TabsTrigger value="audio">Comando Voz</TabsTrigger>
          </TabsList>

          {/* Comando por Texto */}
          <TabsContent value="texto" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="comando-texto">Escribe tu comando</Label>
              <Textarea
                id="comando-texto"
                placeholder="Ej: 'Mostrame las ventas de marzo' o 'Productos con stock bajo'"
                value={comandoTexto}
                onChange={(e) => setComandoTexto(e.target.value)}
                disabled={estadoVoz !== "idle"}
                rows={3}
              />
            </div>
            <Button
              onClick={enviarComandoTexto}
              disabled={estadoVoz !== "idle" || !comandoTexto.trim()}
              className="w-full"
            >
              {estadoVoz === "procesando" ? "Procesando..." : "Procesar Comando"}
            </Button>
          </TabsContent>

          {/* Comando por Audio */}
          <TabsContent value="audio" className="space-y-4">
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-muted border-2 border-dashed">
                <p className="text-sm text-muted-foreground mb-4">
                  🎤 Graba tu comando de voz (máx 30 segundos)
                </p>
                
                {!grabandoAudio ? (
                  <Button
                    onClick={iniciarGrabacion}
                    disabled={estadoVoz !== "idle"}
                    variant="default"
                    size="lg"
                    className="w-full"
                  >
                    <IconMicrophone className="mr-2 h-5 w-5" />
                    Iniciar Grabación
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
                      <p className="text-sm font-medium">Grabando...</p>
                    </div>
                    <Button
                      onClick={detenerGrabacion}
                      variant="destructive"
                      size="lg"
                      className="w-full"
                    >
                      ⏹️ Detener Grabación
                    </Button>
                  </div>
                )}
              </div>

              {audioBits && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-sm text-green-800 mb-3">
                    ✓ Audio capturado correctamente
                  </p>
                  <Button
                    onClick={enviarAudio}
                    disabled={estadoVoz !== "idle"}
                    className="w-full"
                    variant="default"
                  >
                    {estadoVoz === "procesando" ? "Procesando..." : "🚀 Procesar Audio"}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Mensaje de estado */}
        {mensajeVoz && (
          <Card className={
            estadoVoz === "procesando" 
              ? "border-blue-200 bg-blue-50" 
              : estadoVoz === "grabando"
              ? "border-yellow-200 bg-yellow-50"
              : "border-green-200 bg-green-50"
          }>
            <CardContent className="pt-4">
              <p className={`text-sm font-medium ${
                estadoVoz === "procesando" 
                  ? "text-blue-800" 
                  : estadoVoz === "grabando"
                  ? "text-yellow-800"
                  : "text-green-800"
              }`}>
                {mensajeVoz}
              </p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  </div>
  );
}
