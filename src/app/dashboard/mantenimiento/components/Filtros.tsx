// app/mantenimientos/components/FiltrosMantenimientos.tsx
"use client"

import { FiltrosMantenimientoInterface } from '@/interface/mantenimiento';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X } from 'lucide-react';

interface FiltrosMantenimientosProps {
  filtros: FiltrosMantenimientoInterface;
  onFiltrosChange: (filtros: FiltrosMantenimientoInterface) => void;
  onLimpiarFiltros: () => void;
}

export default function FiltrosMantenimientos({
  filtros,
  onFiltrosChange,
  onLimpiarFiltros
}: FiltrosMantenimientosProps) {
  const tieneFiltros = Object.values(filtros).some(valor => 
    valor !== undefined && valor !== '' && valor !== null
  );

  // Función para manejar el cambio de estado
  const manejarCambioEstado = (valor: string) => {
    if (valor === 'todos') {
      // Si selecciona "todos", eliminar el filtro de estado
      const { estado, ...nuevosFiltros } = filtros;
      onFiltrosChange(nuevosFiltros);
    } else {
      onFiltrosChange({ 
        ...filtros, 
        estado: valor 
      });
    }
  };

  // Obtener el valor actual del estado para el Select
  const obtenerValorEstado = () => {
    return filtros.estado || 'todos';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Filtros
          </h3>
        </div>
        {tieneFiltros && (
          <Button
            variant="outline"
            size="sm"
            onClick={onLimpiarFiltros}
          >
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Búsqueda */}
        <div>
          <Label htmlFor="buscar">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="buscar"
              type="text"
              placeholder="Buscar en descripción..."
              value={filtros.buscar || ''}
              onChange={(e) => onFiltrosChange({ ...filtros, buscar: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        {/* Estado - CORREGIDO */}
        <div>
          <Label htmlFor="estado">Estado</Label>
          <Select
            value={obtenerValorEstado()}
            onValueChange={manejarCambioEstado}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="Pendiente">Pendiente</SelectItem>
              <SelectItem value="En proceso">En proceso</SelectItem>
              <SelectItem value="Completado">Completado</SelectItem>
              <SelectItem value="Cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Usuario */}
        <div>
          <Label htmlFor="usuario">ID del Usuario</Label>
          <Input
            id="usuario"
            type="number"
            placeholder="Filtrar por usuario..."
            value={filtros.usuario_id || ''}
            onChange={(e) => onFiltrosChange({ 
              ...filtros, 
              usuario_id: e.target.value ? parseInt(e.target.value) : undefined 
            })}
          />
        </div>

        {/* Detalle Venta */}
        <div>
          <Label htmlFor="detalle_venta">ID Detalle Venta</Label>
          <Input
            id="detalle_venta"
            type="number"
            placeholder="Filtrar por detalle..."
            value={filtros.detalle_venta || ''}
            onChange={(e) => onFiltrosChange({ 
              ...filtros, 
              detalle_venta: e.target.value ? parseInt(e.target.value) : undefined 
            })}
          />
        </div>
      </div>

      {/* Filtros de fecha */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <Label htmlFor="fecha_solicitud_desde">Fecha solicitud desde</Label>
          <Input
            id="fecha_solicitud_desde"
            type="date"
            value={filtros.fecha_solicitud_desde || ''}
            onChange={(e) => onFiltrosChange({ 
              ...filtros, 
              fecha_solicitud_desde: e.target.value || undefined 
            })}
          />
        </div>
        <div>
          <Label htmlFor="fecha_solicitud_hasta">Fecha solicitud hasta</Label>
          <Input
            id="fecha_solicitud_hasta"
            type="date"
            value={filtros.fecha_solicitud_hasta || ''}
            onChange={(e) => onFiltrosChange({ 
              ...filtros, 
              fecha_solicitud_hasta: e.target.value || undefined 
            })}
          />
        </div>
      </div>
    </div>
  );
}