// app/garantias/components/ListaGarantias.tsx
"use client"

import React from 'react';
import { Garantia } from '@/interface/garantia';
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Package } from 'lucide-react';

interface ListaGarantiasProps {
  garantias: Garantia[];
  cargando: boolean;
  onEditar: (garantia: Garantia) => void;
  onEliminar: (id: number) => void;
  paginacion: {
    total: number;
    paginaActual: number;
    totalPaginas: number;
    limite: number;
  };
  onCambiarPagina: (pagina: number) => void;
}

export default function ListaGarantias({
  garantias,
  cargando,
  onEditar,
  onEliminar,
  paginacion,
  onCambiarPagina
}: ListaGarantiasProps) {
  if (garantias.length === 0 && !cargando) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          No hay garantías
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Comienza creando una nueva garantía.
        </p>
      </div>
    );
  }

  const obtenerNombreProducto = (producto: Garantia['producto']) => {
    if (typeof producto === 'object' && producto !== null) {
      return producto.descripcion;
    }
    return `Producto ID: ${producto}`;
  };

  return (
    <div className="space-y-6">
      {/* Lista */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {garantias.map((garantia) => (
            <div key={garantia.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {garantia.descripcion}
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {garantia.tiempo} meses
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Producto: {obtenerNombreProducto(garantia.producto)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditar(garantia)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEliminar(garantia.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Paginación */}
      {paginacion.totalPaginas > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Mostrando {garantias.length} de {paginacion.total} garantías
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={paginacion.paginaActual === 1}
              onClick={() => onCambiarPagina(paginacion.paginaActual - 1)}
            >
              Anterior
            </Button>
            <span className="flex items-center px-3 text-sm text-gray-500 dark:text-gray-400">
              Página {paginacion.paginaActual} de {paginacion.totalPaginas}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={paginacion.paginaActual === paginacion.totalPaginas}
              onClick={() => onCambiarPagina(paginacion.paginaActual + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}