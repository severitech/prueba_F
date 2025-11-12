// app/promociones/components/ListaPromociones.tsx
"use client"

import React from 'react';
import { Promocion } from '@/interface/promocion';
import { servicioPromociones } from '@/api/promocion.service';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Calendar, Tag, ToggleLeft, ToggleRight } from 'lucide-react';

interface ListaPromocionesProps {
  promociones: Promocion[];
  cargando: boolean;
  onEditar: (promocion: Promocion) => void;
  onEliminar: (id: number) => void;
  onCambiarEstado: (id: number, estado: boolean) => void;
  paginacion: {
    total: number;
    paginaActual: number;
    totalPaginas: number;
    limite: number;
  };
  onCambiarPagina: (pagina: number) => void;
}

export default function ListaPromociones({
  promociones,
  cargando,
  onEditar,
  onEliminar,
  onCambiarEstado,
  paginacion,
  onCambiarPagina
}: ListaPromocionesProps) {
  if (promociones.length === 0 && !cargando) {
    return (
      <div className="text-center py-12">
        <Tag className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          No hay promociones
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Comienza creando una nueva promoción.
        </p>
      </div>
    );
  }

  const formatearFecha = (fecha: string) => {
    return servicioPromociones.formatearFecha(fecha);
  };

  const formatearMonto = (monto: number | string) => {
    const valor = typeof monto === 'string' ? parseFloat(monto) : monto;
    return valor >= 100 ? servicioPromociones.formatearMoneda(valor) : `${valor}%`;
  };

  const esPromocionActiva = (promocion: Promocion) => {
    if (!promocion.estado) return false;
    
    const hoy = new Date();
    const fechaInicio = new Date(promocion.fecha_inicio);
    const fechaFin = new Date(promocion.fecha_fin);
    
    return hoy >= fechaInicio && hoy <= fechaFin;
  };

  const obtenerEstadoPromocion = (promocion: Promocion) => {
    if (!promocion.estado) return 'inactiva';
    
    const hoy = new Date();
    const fechaInicio = new Date(promocion.fecha_inicio);
    const fechaFin = new Date(promocion.fecha_fin);
    
    if (hoy < fechaInicio) return 'pendiente';
    if (hoy > fechaFin) return 'expirada';
    return 'activa';
  };

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case 'activa':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pendiente':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'expirada':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'inactiva':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const obtenerTextoEstado = (estado: string) => {
    switch (estado) {
      case 'activa':
        return 'Activa';
      case 'pendiente':
        return 'Pendiente';
      case 'expirada':
        return 'Expirada';
      case 'inactiva':
        return 'Inactiva';
      default:
        return estado;
    }
  };

  return (
    <div className="space-y-6">
      {/* Lista */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {promociones.map((promocion) => {
            const estado = obtenerEstadoPromocion(promocion);
            
            return (
              <div key={promocion.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {promocion.descripcion}
                      </h3>
                      <Badge className={obtenerColorEstado(estado)}>
                        {obtenerTextoEstado(estado)}
                      </Badge>
                      <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        {formatearMonto(promocion.monto)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Inicio: {formatearFecha(promocion.fecha_inicio)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Fin: {formatearFecha(promocion.fecha_fin)}</span>
                      </div>
                    </div>
                    
                    {promocion.estado && estado === 'expirada' && (
                      <p className="mt-2 text-xs text-orange-600 dark:text-orange-400">
                        ⚠️ Esta promoción ha expirado
                      </p>
                    )}
                    
                    {promocion.estado && estado === 'pendiente' && (
                      <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                        ⏰ Esta promoción comenzará pronto
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {/* Toggle Estado */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCambiarEstado(promocion.id, !promocion.estado)}
                      title={promocion.estado ? 'Desactivar' : 'Activar'}
                    >
                      {promocion.estado ? (
                        <ToggleRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                    
                    {/* Editar */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditar(promocion)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    {/* Eliminar */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEliminar(promocion.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Paginación */}
      {paginacion.totalPaginas > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Mostrando {promociones.length} de {paginacion.total} promociones
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