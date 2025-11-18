// app/productos/components/FiltrosProductos.tsx
import React, { useState } from 'react';
import { FiltrosProductosInterface } from '@/interface/productos';

interface FiltrosProductosProps {
  filtros: FiltrosProductosInterface;
  onFiltrosChange: (filtros: FiltrosProductosInterface) => void;
  onLimpiarFiltros: () => void;
}

export default function FiltrosProductos({ 
  filtros, 
  onFiltrosChange, 
  onLimpiarFiltros 
}: FiltrosProductosProps) {
  const [filtrosLocales, setFiltrosLocales] = useState<FiltrosProductosInterface>(filtros);

  const aplicarFiltros = () => {
    onFiltrosChange(filtrosLocales);
  };

  const limpiarFiltros = () => {
    setFiltrosLocales({} as FiltrosProductosInterface);
    onLimpiarFiltros();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Filtros
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Búsqueda */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Buscar
          </label>
          <input
            type="text"
            value={filtrosLocales.buscar || ''}
            onChange={(e) => setFiltrosLocales(prev => ({ ...prev, buscar: e.target.value }))}
            placeholder="Nombre del producto..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Estado
          </label>
          <select
            value={filtrosLocales.estado || ''}
            onChange={(e) => setFiltrosLocales(prev => ({ ...prev, estado: e.target.value as 'Activo' | 'Inactivo' }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Todos</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>

        {/* Precio Mínimo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Precio Mínimo
          </label>
          <input
            type="number"
            value={filtrosLocales.precio_min || ''}
            onChange={(e) => setFiltrosLocales(prev => ({ ...prev, precio_min: Number(e.target.value) }))}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Precio Máximo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Precio Máximo
          </label>
          <input
            type="number"
            value={filtrosLocales.precio_max || ''}
            onChange={(e) => setFiltrosLocales(prev => ({ ...prev, precio_max: Number(e.target.value) }))}
            placeholder="1000.00"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-3 mt-4">
        <button
          onClick={limpiarFiltros}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Limpiar
        </button>
        <button
          onClick={aplicarFiltros}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md transition-colors"
        >
          Aplicar Filtros
        </button>
      </div>
    </div>
  );
}