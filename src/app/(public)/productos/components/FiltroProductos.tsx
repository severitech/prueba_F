// components/FiltrosProductos.tsx
"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';
import { FiltrosProductosInterface } from '@/interface/productos';
import { Categoria } from '@/interface/categoria';
import { SubCategoria } from '@/interface/subcategoria';

interface Props {
  filtros: FiltrosProductosInterface;
  onFiltrosChange: (filtros: FiltrosProductosInterface) => void;
  categorias: Categoria[];
  subcategorias: SubCategoria[];
}

export default function FiltrosProductos({ filtros, onFiltrosChange, categorias, subcategorias }: Props) {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [busquedaTemp, setBusquedaTemp] = useState(filtros?.buscar || "");
  const inputRef = useRef<HTMLInputElement>(null);

  // Asegurarnos de que siempre tenemos un objeto de filtros
  const filtrosSeguros = filtros || {};

  const aplicarBusqueda = () => {
    onFiltrosChange({
      ...filtrosSeguros,
      buscar: busquedaTemp || undefined,
      limite: filtrosSeguros.limite || 10, // Valor por defecto para "limite"
      pagina: filtrosSeguros.pagina || 1  // Valor por defecto para "pagina"
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      aplicarBusqueda();
    }
  };

  const handleFiltroChange = (key: keyof FiltrosProductosInterface, value: string | number | undefined) => {
    // Para filtros que no son búsqueda, aplicamos inmediatamente
    if (key !== 'buscar') {
      onFiltrosChange({
        ...filtrosSeguros,
        [key]: value
      });
    }
  };

  const limpiarFiltros = () => {
    setBusquedaTemp("");
    onFiltrosChange({
      limite: 10, // Valor por defecto para "limite"
      pagina: 1   // Valor por defecto para "pagina"
    });
    setMostrarFiltros(false);
  };

  const tieneFiltrosActivos = Boolean(
    filtrosSeguros.buscar || 
    filtrosSeguros.categoria || 
    filtrosSeguros.subcategoria || 
    filtrosSeguros.precio_max || 
    filtrosSeguros.ordenar_por
  );

  const subcategoriasFiltradas = filtrosSeguros.categoria 
    ? subcategorias.filter(sub => sub.categoria.id === filtrosSeguros.categoria)
    : subcategorias;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6 dark:bg-zinc-800 dark:border-zinc-700">
      {/* Barra de búsqueda principal */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 dark:bg-zinc-800 dark:border-zinc-700" />
          <Input
            ref={inputRef}
            placeholder="Buscar productos..."
            value={busquedaTemp}
            onChange={(e) => setBusquedaTemp(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 pr-20"
          />
          <Button
            onClick={aplicarBusqueda}
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 px-3 text-xs"
          >
            Buscar
          </Button>
        </div>
        
        <Button
          variant="outline"
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filtros
        </Button>

        {tieneFiltrosActivos && (
          <Button
            variant="ghost"
            onClick={limpiarFiltros}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Filtros avanzados */}
      {mostrarFiltros && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
          {/* Categoría */}
          <div>
            <label className="text-sm font-medium mb-2 block">Categoría</label>
            <Select
              value={filtrosSeguros.categoria?.toString() || "todas"}
              onValueChange={(value) => handleFiltroChange('categoria', value !== "todas" ? parseInt(value) : undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las categorías</SelectItem>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria.id} value={categoria.id.toString()}>
                    {categoria.descripcion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subcategoría */}
          <div>
            <label className="text-sm font-medium mb-2 block">Subcategoría</label>
            <Select
              value={filtrosSeguros.subcategoria?.toString() || "todas"}
              onValueChange={(value) => handleFiltroChange('subcategoria', value !== "todas" ? parseInt(value) : undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas las subcategorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las subcategorías</SelectItem>
                {subcategoriasFiltradas.map((subcategoria) => (
                  <SelectItem key={subcategoria.id} value={subcategoria.id.toString()}>
                    {subcategoria.descripcion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rango de precios */}
          <div>
            <label className="text-sm font-medium mb-2 block">Precio máximo</label>
            <Input
              type="number"
              placeholder="Precio máximo"
              value={filtrosSeguros.precio_max || ""}
              onChange={(e) => handleFiltroChange('precio_max', e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>

          {/* Ordenar por */}
          <div>
            <label className="text-sm font-medium mb-2 block">Ordenar por</label>
            <Select
              value={filtrosSeguros.ordenar_por || "default"}
              onValueChange={(value) => handleFiltroChange('ordenar_por', value !== "default" ? value : undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Ordenar por...</SelectItem>
                <SelectItem value="precio">Precio: Menor a mayor</SelectItem>
                <SelectItem value="-precio">Precio: Mayor a menor</SelectItem>
                <SelectItem value="descripcion">Nombre: A-Z</SelectItem>
                <SelectItem value="-descripcion">Nombre: Z-A</SelectItem>
                <SelectItem value="stock">Stock: Menor a mayor</SelectItem>
                <SelectItem value="-stock">Stock: Mayor a menor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Indicador de filtros activos */}
      {tieneFiltrosActivos && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
          {filtrosSeguros.buscar && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
              Buscar: {filtrosSeguros.buscar}
              <button 
                onClick={() => onFiltrosChange({...filtrosSeguros, buscar: undefined})}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filtrosSeguros.categoria && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
              Categoría: {categorias.find(c => c.id === filtrosSeguros.categoria)?.descripcion}
              <button 
                onClick={() => onFiltrosChange({...filtrosSeguros, categoria: undefined})}
                className="text-green-600 hover:text-green-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filtrosSeguros.subcategoria && (
            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
              Subcategoría: {subcategorias.find(s => s.id === filtrosSeguros.subcategoria)?.descripcion}
              <button 
                onClick={() => onFiltrosChange({...filtrosSeguros, subcategoria: undefined})}
                className="text-purple-600 hover:text-purple-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filtrosSeguros.precio_max && (
            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
              Precio máximo: Bs. {filtrosSeguros.precio_max}
              <button 
                onClick={() => onFiltrosChange({...filtrosSeguros, precio_max: undefined})}
                className="text-orange-600 hover:text-orange-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}