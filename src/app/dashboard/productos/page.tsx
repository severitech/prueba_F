// app/productos/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Producto, FiltrosProductosInterface } from '@/interface/productos';
import { servicioProductos } from '@/api/productos.service';
import FiltrosProductos from './components/FiltroProductos';
import ListaProductos from './components/ListaProductos';
import ModalProducto from './components/ModalProductos';

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);
  const [filtros, setFiltros] = useState<FiltrosProductosInterface>({});
  const [paginacion, setPaginacion] = useState({
    total: 0,
    paginaActual: 1,
    totalPaginas: 1,
    limite: 10
  });

  // Cargar productos
  const cargarProductos = async () => {
    try {
      setCargando(true);
      setError('');
      
      const respuesta = await servicioProductos.obtenerProductos({
        ...filtros,
        pagina: paginacion.paginaActual,
        limite: paginacion.limite
      });

      if (respuesta.exito) {
        setProductos(respuesta.datos);
        if (respuesta.mensaje) {
          setPaginacion(respuesta.mensaje);
        }
      } else {
        setError(respuesta.mensaje || 'Error al cargar productos');
      }
    } catch (err) {
      setError('Error al cargar productos');
      console.error('Error:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, [filtros, paginacion.paginaActual]);

  // Manejar creación/edición
  const manejarGuardarProducto = async (datosProducto: any) => {
    try {
      let respuesta;
      
      if (productoEditando) {
        respuesta = await servicioProductos.actualizarProducto(productoEditando.id, datosProducto);
      } else {
        respuesta = await servicioProductos.crearProducto(datosProducto);
      }

      if (respuesta.exito) {
        await cargarProductos();
        cerrarModal();
      } else {
        setError(respuesta.mensaje || 'Error al guardar producto');
      }
    } catch (err) {
      setError('Error al guardar producto');
      console.error('Error:', err);
    }
  };

  // Manejar eliminación
  const manejarEliminarProducto = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    try {
      const respuesta = await servicioProductos.eliminarProducto(id, false);
      
      if (respuesta.exito) {
        await cargarProductos();
      } else {
        setError(respuesta.mensaje || 'Error al eliminar producto');
      }
    } catch (err) {
      setError('Error al eliminar producto');
      console.error('Error:', err);
    }
  };

  // Manejar activación/desactivación
  const manejarCambiarEstado = async (id: number, estado: 'Activo' | 'Inactivo') => {
    try {
      const respuesta = estado === 'Activo' 
        ? await servicioProductos.activarProducto(id)
        : await servicioProductos.eliminarProducto(id, false);

      if (respuesta.exito) {
        await cargarProductos();
      } else {
        setError(respuesta.mensaje || 'Error al cambiar estado');
      }
    } catch (err) {
      setError('Error al cambiar estado');
      console.error('Error:', err);
    }
  };

  // Modal functions
  const abrirModalCrear = () => {
    setProductoEditando(null);
    setMostrarModal(true);
  };

  const abrirModalEditar = (producto: Producto) => {
    setProductoEditando(producto);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setProductoEditando(null);
  };

  // Paginación
  const cambiarPagina = (pagina: number) => {
    setPaginacion(prev => ({ ...prev, paginaActual: pagina }));
  };

  if (cargando && productos.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-80"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Gestión de Productos
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Administra los productos de tu tienda
          </p>
        </div>
        <button
          onClick={abrirModalCrear}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors mt-4 md:mt-0"
        >
          <span>+</span>
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Filtros */}
      <FiltrosProductos
        filtros={filtros}
        onFiltrosChange={setFiltros}
        onLimpiarFiltros={() => setFiltros({})}
      />

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-red-500 mr-3">❌</div>
            <div>
              <h3 className="text-red-800 dark:text-red-200 font-medium">
                Error
              </h3>
              <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Lista de Productos */}
      <ListaProductos
        productos={productos}
        cargando={cargando}
        onEditar={abrirModalEditar}
        onEliminar={manejarEliminarProducto}
        onCambiarEstado={manejarCambiarEstado}
        paginacion={paginacion}
        onCambiarPagina={cambiarPagina}
      />

      {/* Modal con shadcn */}
      <ModalProducto
        open={mostrarModal}
        onOpenChange={setMostrarModal}
        producto={productoEditando}
        onGuardar={manejarGuardarProducto}
      />
    </div>
  );
}