// app/promociones/components/FiltrosPromociones.tsx
"use client"

import React from 'react';
import { FiltrosPromocionesInterface } from '@/interface/promociones';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X, Calendar } from 'lucide-react';

interface FiltrosPromocionesProps {
  filtros: FiltrosPromocionesInterface;
  onFiltrosChange: (filtros: FiltrosPromocionesInterface) => void;
  onLimpiarFiltros: () => void;
}

export default function FiltrosPromociones({
  filtros,
  onFiltrosChange,
  onLimpiarFiltros
}: FiltrosPromocionesProps) {
  const tieneFiltros = Object.values(filtros).some(valor => 
    valor !== undefined && valor !== '' && valor !== null
  );

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Estado */}
        <div>
          <Label htmlFor="estado">Estado</Label>
          <Select
            value={filtros.estado !== undefined ? filtros.estado.toString() : ''}
            onValueChange={(value) => onFiltrosChange({ 
              ...filtros, 
              estado: value === '' ? undefined : value === 'true'
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Activas</SelectItem>
              <SelectItem value="false">Inactivas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Fecha Inicio Desde */}
        <div>
          <Label htmlFor="fecha_inicio_desde">Fecha inicio desde</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="fecha_inicio_desde"
              type="date"
              value={filtros.fecha_inicio_desde || ''}
              onChange={(e) => onFiltrosChange({ 
                ...filtros, 
                fecha_inicio_desde: e.target.value || undefined 
              })}
              className="pl-10"
            />
          </div>
        </div>

        {/* Fecha Inicio Hasta */}
        <div>
          <Label htmlFor="fecha_inicio_hasta">Fecha inicio hasta</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="fecha_inicio_hasta"
              type="date"
              value={filtros.fecha_inicio_hasta || ''}
              onChange={(e) => onFiltrosChange({ 
                ...filtros, 
                fecha_inicio_hasta: e.target.value || undefined 
              })}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {/* Fecha Fin Desde */}
        <div>
          <Label htmlFor="fecha_fin_desde">Fecha fin desde</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="fecha_fin_desde"
              type="date"
              value={filtros.fecha_fin_desde || ''}
              onChange={(e) => onFiltrosChange({ 
                ...filtros, 
                fecha_fin_desde: e.target.value || undefined 
              })}
              className="pl-10"
            />
          </div>
        </div>

        {/* Fecha Fin Hasta */}
        <div>
          <Label htmlFor="fecha_fin_hasta">Fecha fin hasta</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="fecha_fin_hasta"
              type="date"
              value={filtros.fecha_fin_hasta || ''}
              onChange={(e) => onFiltrosChange({ 
                ...filtros, 
                fecha_fin_hasta: e.target.value || undefined 
              })}
              className="pl-10"
            />
          </div>
        </div>

        {/* Monto Mínimo */}
        <div>
          <Label htmlFor="monto_min">Monto mínimo</Label>
          <Input
            id="monto_min"
            type="number"
            step="0.01"
            placeholder="Mínimo"
            value={filtros.monto_min || ''}
            onChange={(e) => onFiltrosChange({ 
              ...filtros, 
              monto_min: e.target.value ? parseFloat(e.target.value) : undefined 
            })}
          />
        </div>

        {/* Monto Máximo */}
        <div>
          <Label htmlFor="monto_max">Monto máximo</Label>
          <Input
            id="monto_max"
            type="number"
            step="0.01"
            placeholder="Máximo"
            value={filtros.monto_max || ''}
            onChange={(e) => onFiltrosChange({ 
              ...filtros, 
              monto_max: e.target.value ? parseFloat(e.target.value) : undefined 
            })}
          />
        </div>
      </div>

      {/* Información de filtros activos */}
      {tieneFiltros && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Filtros activos:</strong>{' '}
            {[
              filtros.buscar && `Búsqueda: "${filtros.buscar}"`,
              filtros.estado !== undefined && `Estado: ${filtros.estado ? 'Activas' : 'Inactivas'}`,
              filtros.fecha_inicio_desde && `Inicio desde: ${filtros.fecha_inicio_desde}`,
              filtros.fecha_inicio_hasta && `Inicio hasta: ${filtros.fecha_inicio_hasta}`,
              filtros.fecha_fin_desde && `Fin desde: ${filtros.fecha_fin_desde}`,
              filtros.fecha_fin_hasta && `Fin hasta: ${filtros.fecha_fin_hasta}`,
              filtros.monto_min && `Monto mínimo: ${filtros.monto_min}`,
              filtros.monto_max && `Monto máximo: ${filtros.monto_max}`
            ].filter(Boolean).join(' • ')}
          </p>
        </div>
      )}
    </div>
  );
}