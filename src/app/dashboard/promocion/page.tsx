// app/promociones/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Promocion, FiltrosPromocionesInterface } from '@/interface/promocion';
import { servicioPromociones } from '@/api/promocion.service';
import FiltrosPromociones from './components/Filtrar';
import ListaPromociones from './components/Lista';
import ModalPromocion from './components/Modal';

export default function PromocionesPage() {
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [promocionEditando, setPromocionEditando] = useState<Promocion | null>(null);
  const [filtros, setFiltros] = useState<FiltrosPromocionesInterface>({});
  const [paginacion, setPaginacion] = useState({
    total: 0,
    paginaActual: 1,
    totalPaginas: 1,
    limite: 10
  });

  // Cargar promociones
  const cargarPromociones = async () => {
    try {
      setCargando(true);
      setError('');
      
      const respuesta = await servicioPromociones.obtenerPromociones({
        ...filtros,
        pagina: paginacion.paginaActual,
        limite: paginacion.limite
      });

      if (respuesta.exito) {
        setPromociones(respuesta.datos);
        if (respuesta.paginacion) {
          setPaginacion(respuesta.paginacion);
        }
      } else {
        setError(respuesta.mensaje || 'Error al cargar promociones');
      }
    } catch (err) {
      setError('Error al cargar promociones');
      console.error('Error:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPromociones();
  }, [filtros, paginacion.paginaActual]);

  // Manejar creación/edición
  const manejarGuardarPromocion = async (datosPromocion: Partial<Promocion>) => {
    try {
      let respuesta;
      
      if (promocionEditando) {
        // Convertir monto a número si es string
        if (!promocionEditando || typeof promocionEditando !== 'object') {
          throw new Error("La promoción a editar no está definida o no es un objeto válido.");
        }

        const datosActualizacion: Partial<{ id: string; monto: number | undefined }> = {
          ...promocionEditando,
          id: String(promocionEditando.id), // Conversión a cadena
          monto: promocionEditando.monto ? Number(promocionEditando.monto) : undefined // Conversión a número
        };

        respuesta = await servicioPromociones.actualizarPromocion(promocionEditando.id, datosActualizacion);
      } else {
        // Asegurar que monto sea un número
        const datosCreacion = {
          ...datosPromocion,
          monto: typeof datosPromocion.monto === 'string' 
            ? Number(datosPromocion.monto) 
            : (datosPromocion.monto ?? 0)
        };

        respuesta = await servicioPromociones.crearPromocion(datosCreacion as any);
      }

      if (respuesta.exito) {
        await cargarPromociones();
        cerrarModal();
      } else {
        setError(respuesta.mensaje || 'Error al guardar promoción');
      }
    } catch (err) {
      setError('Error al guardar promoción');
      console.error('Error:', err);
    }
  };

  // Manejar eliminación
  const manejarEliminarPromocion = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta promoción?')) {
      return;
    }

    try {
      const respuesta = await servicioPromociones.eliminarPromocion(id);
      
      if (respuesta.exito) {
        await cargarPromociones();
      } else {
        setError(respuesta.mensaje || 'Error al eliminar promoción');
      }
    } catch (err) {
      setError('Error al eliminar promoción');
      console.error('Error:', err);
    }
  };

  // Manejar cambio de estado
  const manejarCambiarEstado = async (id: number, estado: boolean) => {
    try {
      const respuesta = await servicioPromociones.actualizarPromocion(id, { estado });
      
      if (respuesta.exito) {
        await cargarPromociones();
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
    setPromocionEditando(null);
    setMostrarModal(true);
  };

  const abrirModalEditar = (promocion: Promocion) => {
    setPromocionEditando(promocion);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setPromocionEditando(null);
  };

  // Paginación
  const cambiarPagina = (pagina: number) => {
    setPaginacion(prev => ({ ...prev, paginaActual: pagina }));
  };

  if (cargando && promociones.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-8"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-20"></div>
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
            Gestión de Promociones
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Administra las promociones de productos
          </p>
        </div>
        <button
          onClick={abrirModalCrear}
          className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors mt-4 md:mt-0"
        >
          <span>+</span>
          <span>Nueva Promoción</span>
        </button>
      </div>

      {/* Filtros */}
      <FiltrosPromociones
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

      {/* Lista de Promociones */}
      <ListaPromociones
        promociones={promociones}
        cargando={cargando}
        onEditar={abrirModalEditar}
        onEliminar={manejarEliminarPromocion}
        onCambiarEstado={manejarCambiarEstado}
        paginacion={paginacion}
        onCambiarPagina={cambiarPagina}
      />

      {/* Modal */}
      <ModalPromocion
        open={mostrarModal}
        onOpenChange={setMostrarModal}
        promocion={promocionEditando}
        onGuardar={manejarGuardarPromocion}
      />
    </div>
  );
}