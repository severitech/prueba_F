// app/garantias/components/FiltrosGarantias.tsx
"use client"

import { FiltrosGarantiasInterface } from '@/interface/garantia';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Filter, X } from 'lucide-react';

interface FiltrosGarantiasProps {
  filtros: FiltrosGarantiasInterface;
  onFiltrosChange: (filtros: FiltrosGarantiasInterface) => void;
  onLimpiarFiltros: () => void;
}

export default function FiltrosGarantias({
  filtros,
  onFiltrosChange,
  onLimpiarFiltros
}: FiltrosGarantiasProps) {
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        {/* Producto */}
        <div>
          <Label htmlFor="producto">ID del Producto</Label>
          <Input
            id="producto"
            type="number"
            placeholder="Filtrar por producto..."
            value={filtros.producto?.id || ''} // Cambiado para usar el ID del producto
            onChange={(e) => onFiltrosChange({ 
              ...filtros, 
              producto: e.target.value ? { id: parseInt(e.target.value) } : undefined // Crear un objeto Producto con el ID
            })}
          />
        </div>

        {/* Tiempo mínimo */}
        <div>
          <Label htmlFor="tiempo_min">Tiempo mínimo (meses)</Label>
          <Input
            id="tiempo_min"
            type="number"
            placeholder="Mínimo"
            value={filtros.tiempo_min || ''}
            onChange={(e) => onFiltrosChange({ 
              ...filtros, 
              tiempo_min: e.target.value ? parseInt(e.target.value) : undefined 
            })}
          />
        </div>
      </div>
    </div>
  );
}