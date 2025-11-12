// src/app/mis-pedidos/page.tsx
"use client";

import { useEffect, useState } from "react";
import { servicioVentas } from "@/api/ventas.service";
import { Venta } from "@/interface/venta";

export default function MisPedidos() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [estadisticas, setEstadisticas] = useState<any>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError("");

      console.log("🔄 Iniciando carga de datos...");

      const datosVentas = await servicioVentas.obtenerMisVentas();
      console.log("📦 Datos finales de ventas:", datosVentas);

      setVentas(datosVentas.ventas);

      // Calcular estadísticas
      const stats = {
        total_ventas: datosVentas.total,
        total_gastado: datosVentas.ventas.reduce((sum, venta) => {
          return sum + parseFloat(venta.total?.toString() || "0");
        }, 0),
        ventas_pendientes: datosVentas.ventas.filter(
          (v) => v.estado === "Pendiente"
        ).length,
        ventas_pagadas: datosVentas.ventas.filter((v) => v.estado === "Pagado")
          .length,
        ventas_canceladas: datosVentas.ventas.filter(
          (v) => v.estado === "Cancelado"
        ).length,
      };

      setEstadisticas(stats);
      console.log("📊 Estadísticas finales:", stats);
    } catch (err: any) {
      console.error("❌ Error cargando datos:", err);
      setError(err.message || "Error desconocido al cargar los pedidos");
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-zinc-200 dark:bg-zinc-700 p-4 rounded-lg h-20"></div>
            ))}
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-zinc-200 dark:bg-zinc-700 rounded-lg h-40 mb-6"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <div className="text-red-500 text-4xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
            Error al cargar los pedidos
          </h2>
          <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
          <button
            onClick={cargarDatos}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
        Mis Pedidos
      </h1>
      <p className="text-zinc-600 dark:text-zinc-300 mb-8">
        Revisa el historial de todas tus compras
      </p>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 text-center shadow-sm">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {estadisticas.total_ventas}
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              Total Pedidos
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {servicioVentas.formatearMoneda(estadisticas.total_gastado)}
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              Total Gastado
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {estadisticas.ventas_pagadas}
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              Pagados
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 text-center shadow-sm">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {estadisticas.ventas_pendientes}
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              Pendientes
            </div>
          </div>
        </div>
      )}

      {ventas.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-zinc-400 dark:text-zinc-500 text-6xl mb-4">
            🛒
          </div>
          <h2 className="text-xl font-semibold text-zinc-600 dark:text-zinc-300 mb-2">
            No tienes pedidos aún
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6">
            ¡Realiza tu primera compra!
          </p>
          <button
            onClick={() => (window.location.href = "/productos")}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Ir a Productos
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {ventas.map((venta) => (
            <div
              key={venta.id}
              className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm overflow-hidden transition-colors"
            >
              {/* Header de la venta */}
              <div className="bg-zinc-50 dark:bg-zinc-700 px-6 py-4 border-b border-zinc-200 dark:border-zinc-600">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">
                      {servicioVentas.obtenerIconoEstado(venta.estado)}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                        Pedido #{venta.id}
                      </h3>
                      <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                        {servicioVentas.formatearFecha(venta.fecha)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 mt-2 md:mt-0">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${
                        venta.estado === "Pagado"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800"
                          : venta.estado === "Pendiente"
                          ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
                          : venta.estado === "Cancelado"
                          ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800"
                          : "bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-600"
                      }`}
                    >
                      {venta.estado}
                    </span>
                    <span className="text-lg font-bold text-zinc-900 dark:text-white">
                      {servicioVentas.formatearMoneda(venta.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Productos */}
              <div className="p-6">
                <h4 className="font-medium text-zinc-900 dark:text-white mb-4">
                  Productos comprados: {venta.detalles?.length || 0} items
                </h4>

                {venta.detalles && venta.detalles.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {venta.detalles.map((detalle, index) => (
                      <div
                        key={detalle.id || index}
                        className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-700 last:border-b-0"
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-700 rounded flex items-center justify-center flex-shrink-0 border border-zinc-200 dark:border-zinc-600">
                            {detalle?.producto?.imagenes?.[0] ? (
                              <img
                                src={detalle.producto.imagenes?.[0]}
                                alt={detalle.producto.descripcion || "Producto"}
                                className="w-12 h-12 object-cover rounded"
                              />
                            ) : (
                              <span className="text-zinc-400 dark:text-zinc-500 text-xl">
                                📦
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-zinc-900 dark:text-white truncate">
                              {detalle.producto?.descripcion ||
                                `Producto #${detalle.producto?.id.toString()}`}
                            </p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                              Cantidad: {detalle.cantidad} ×{" "}
                              {servicioVentas.formatearMoneda(
                                detalle.producto?.precio || 0
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-zinc-900 dark:text-white">
                            {servicioVentas.formatearMoneda(detalle.subtotal)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 dark:text-zinc-400 text-center py-4">
                    No se encontraron detalles específicos de este pedido
                  </p>
                )}

                {/* Información de pago */}
                {venta.pagos && venta.pagos.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-700">
                    <h4 className="font-medium text-zinc-900 dark:text-white mb-3">
                      Información de Pago: {venta.pagos.length} transacciones
                    </h4>
                    <div className="bg-zinc-50 dark:bg-zinc-700 rounded-lg p-4 space-y-2">
                      {venta.pagos.map((pago, index) => (
                        <div
                          key={pago.id || index}
                          className="flex justify-between items-center text-sm"
                        >
                          <div>
                            <span className="text-zinc-600 dark:text-zinc-400">
                              Transacción {index + 1}:
                            </span>
                            <span className="ml-2 text-zinc-900 dark:text-zinc-100 font-mono text-xs bg-white dark:bg-zinc-600 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-500">
                              {pago.stripe_key || "N/A"}
                            </span>
                          </div>
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            {servicioVentas.formatearMoneda(pago.monto)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}