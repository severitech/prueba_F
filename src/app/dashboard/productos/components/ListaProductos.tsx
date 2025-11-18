// app/productos/components/ListaProductos.tsx
import React from 'react';
import { Producto } from '@/interface/productos';
import { servicioProductos } from '@/api/productos.service';

interface ListaProductosProps {
  productos: Producto[];
  cargando: boolean;
  onEditar: (producto: Producto) => void;
  onEliminar: (id: number) => void;
  onCambiarEstado: (id: number, estado: 'Activo' | 'Inactivo') => void;
  paginacion: {
    total: number;
    paginaActual: number;
    totalPaginas: number;
    limite: number;
  };
  onCambiarPagina: (pagina: number) => void;
}

export default function ListaProductos({
  productos,
  cargando,
  onEditar,
  onEliminar,
  onCambiarEstado,
  paginacion,
  onCambiarPagina
}: ListaProductosProps) {
  if (productos.length === 0 && !cargando) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">
          📦
        </div>
        <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
          No se encontraron productos
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          {paginacion.total === 0 ? 'No hay productos registrados' : 'Intenta con otros filtros'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Estadísticas */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600 dark:text-gray-400">
          Mostrando {productos.length} de {paginacion.total} productos
        </p>
      </div>

      {/* Grid de Productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {productos.map((producto) => (
          <div
            key={producto.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Imagen */}
            <div className="h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              {producto.imagenes && producto.imagenes.length > 0 ? (
                <img
                  src={producto.imagenes[0]}
                  alt={producto.descripcion}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-400 dark:text-gray-500 text-4xl">📦</div>
              )}
            </div>

            {/* Contenido */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {producto.descripcion}
              </h3>

              <div className="space-y-2 mb-4">
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {servicioProductos.formatearMoneda(producto.precio)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Stock: <span className="font-medium">{producto.stock}</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Subcategoría: <span className="font-medium">{producto.subcategoria.descripcion}</span>
                </p>
              </div>

              {/* Estado */}
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    producto.estado === 'Activo'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                  }`}
                >
                  {producto.estado}
                </span>
              </div>

              {/* Acciones */}
              <div className="flex space-x-2">
                <button
                  onClick={() => onEditar(producto)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-2 px-3 rounded text-sm transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => onCambiarEstado(producto.id, producto.estado === 'Activo' ? 'Inactivo' : 'Activo')}
                  className={`px-3 py-2 rounded text-sm transition-colors ${
                    producto.estado === 'Activo'
                      ? 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 text-white'
                      : 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white'
                  }`}
                >
                  {producto.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  onClick={() => onEliminar(producto.id)}
                  className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white py-2 px-3 rounded text-sm transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      {paginacion.totalPaginas > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <button
            onClick={() => onCambiarPagina(paginacion.paginaActual - 1)}
            disabled={paginacion.paginaActual === 1}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Anterior
          </button>

          {[...Array(paginacion.totalPaginas)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => onCambiarPagina(index + 1)}
              className={`px-3 py-2 border rounded-md ${
                paginacion.paginaActual === index + 1
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() => onCambiarPagina(paginacion.paginaActual + 1)}
            disabled={paginacion.paginaActual === paginacion.totalPaginas}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}