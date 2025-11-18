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
  // Inicializamos con un objeto vacío tipado para cumplir la interfaz
  const [filtros, setFiltros] = useState<FiltrosProductosInterface>({} as FiltrosProductosInterface);
  const [paginacion, setPaginacion] = useState({
    total: 0,
    paginaActual: 1,
    totalPaginas: 1,
    limite: 10
  });

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
        
        // CORRECCIÓN: Usar paginacion en lugar de mensaje
        if (respuesta.paginacion) {
          setPaginacion(respuesta.paginacion);
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

  const manejarGuardarProducto = async (datosProducto: {
    descripcion: string;
    precio: number;
    stock: number;
    estado: 'Activo' | 'Inactivo';
    subcategoria_id: number;
    imagenes: string[];
  }) => {
    try {
      let respuesta;
      
      if (productoEditando) {
        // CORRECCIÓN: Para actualizar, no enviar imagenes si no hay nuevas
        const datosActualizarProducto = {
          descripcion: datosProducto.descripcion,
          precio: datosProducto.precio,
          stock: datosProducto.stock,
          estado: datosProducto.estado,
          subcategoria_id: datosProducto.subcategoria_id
        };
        respuesta = await servicioProductos.actualizarProducto(productoEditando.id, datosActualizarProducto);
      } else {
        // Unificar creación enviando objeto DatosCrearProducto (el servicio espera JSON)
        const datosCrearProducto = {
          descripcion: datosProducto.descripcion,
          precio: datosProducto.precio,
          stock: datosProducto.stock,
          estado: datosProducto.estado,
          subcategoria_id: datosProducto.subcategoria_id,
          imagenes: [] as File[] // enviar array vacío de Files
        };
        respuesta = await servicioProductos.crearProducto(datosCrearProducto);
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

  const manejarEliminarProducto = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
    
    try {
      // CORRECCIÓN: Usar el método correcto para eliminar
      const respuesta = await servicioProductos.eliminarProducto(id);
      
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

  const manejarCambiarEstado = async (id: number, estado: 'Activo' | 'Inactivo') => {
    try {
      let respuesta;
      
      if (estado === 'Activo') {
        respuesta = await servicioProductos.activarProducto(id);
      } else {
        respuesta = await servicioProductos.actualizarProducto(id, { estado: 'Inactivo' });
      }
      
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

  const cambiarPagina = (pagina: number) => {
    setPaginacion(prev => ({ ...prev, paginaActual: pagina }));
  };

  const onLimpiarFiltros = () => {
    setFiltros({} as FiltrosProductosInterface);
    setPaginacion(prev => ({ ...prev, paginaActual: 1 }));
  };

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setPaginacion(prev => ({ ...prev, paginaActual: 1 }));
  }, [filtros]);

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

      <FiltrosProductos
        filtros={filtros}
        onFiltrosChange={setFiltros}
        onLimpiarFiltros={onLimpiarFiltros}
      />

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

      <ListaProductos
        productos={productos}
        cargando={cargando}
        onEditar={abrirModalEditar}
        onEliminar={manejarEliminarProducto}
        onCambiarEstado={manejarCambiarEstado}
        paginacion={paginacion}
        onCambiarPagina={cambiarPagina}
      />

      <ModalProducto
        open={mostrarModal}
        onOpenChange={setMostrarModal}
        producto={productoEditando}
        onGuardar={manejarGuardarProducto}
      />
    </div>
  );
}