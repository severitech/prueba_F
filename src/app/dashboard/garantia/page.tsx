// app/garantias/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Garantia, FiltrosGarantiasInterface } from '@/interface/garantia';
import { servicioGarantias } from '@/api/garantia.service';
import ListaGarantias from './components/ListaGarantias';
import ModalGarantia from './components/ModalGarantia';
import FiltrosGarantias from './components/Filtros';

export default function GarantiasPage() {
  const [garantias, setGarantias] = useState<Garantia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [garantiaEditando, setGarantiaEditando] = useState<Garantia | null>(null);
  const [filtros, setFiltros] = useState<FiltrosGarantiasInterface>({});
  const [paginacion, setPaginacion] = useState({
    total: 0,
    paginaActual: 1,
    totalPaginas: 1,
    limite: 10
  });

  // Cargar garantías
  const cargarGarantias = async () => {
    try {
      setCargando(true);
      setError('');
      
      const respuesta = await servicioGarantias.obtenerGarantias({
        ...filtros,
        pagina: paginacion.paginaActual,
        limite: paginacion.limite
      });

      if (respuesta.exito) {
        setGarantias(respuesta.datos);
        if (respuesta.paginacion) {
          setPaginacion(respuesta.paginacion);
        }
      } else {
        setError(respuesta.mensaje || 'Error al cargar garantías');
      }
    } catch (err) {
      setError('Error al cargar garantías');
      console.error('Error:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarGarantias();
  }, [filtros, paginacion.paginaActual]);

  // Manejar creación/edición
  const manejarGuardarGarantia = async (datosGarantia: any) => {
    try {
      let respuesta;
      
      if (garantiaEditando) {
        respuesta = await servicioGarantias.actualizarGarantia(garantiaEditando.id, datosGarantia);
      } else {
        respuesta = await servicioGarantias.crearGarantia(datosGarantia);
      }

      if (respuesta.exito) {
        await cargarGarantias();
        cerrarModal();
      } else {
        setError(respuesta.mensaje || 'Error al guardar garantía');
      }
    } catch (err) {
      setError('Error al guardar garantía');
      console.error('Error:', err);
    }
  };

  // Manejar eliminación
  const manejarEliminarGarantia = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta garantía?')) {
      return;
    }

    try {
      const respuesta = await servicioGarantias.eliminarGarantia(id);
      
      if (respuesta.exito) {
        await cargarGarantias();
      } else {
        setError(respuesta.mensaje || 'Error al eliminar garantía');
      }
    } catch (err) {
      setError('Error al eliminar garantía');
      console.error('Error:', err);
    }
  };

  // Modal functions
  const abrirModalCrear = () => {
    setGarantiaEditando(null);
    setMostrarModal(true);
  };

  const abrirModalEditar = (garantia: Garantia) => {
    setGarantiaEditando(garantia);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setGarantiaEditando(null);
  };

  // Paginación
  const cambiarPagina = (pagina: number) => {
    setPaginacion(prev => ({ ...prev, paginaActual: pagina }));
  };

  if (cargando && garantias.length === 0) {
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
            Gestión de Garantías
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Administra las garantías de los productos
          </p>
        </div>
        <button
          onClick={abrirModalCrear}
          className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors mt-4 md:mt-0"
        >
          <span>+</span>
          <span>Nueva Garantía</span>
        </button>
      </div>

      {/* Filtros */}
      <FiltrosGarantias
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

      {/* Lista de Garantías */}
      <ListaGarantias
        garantias={garantias}
        cargando={cargando}
        onEditar={abrirModalEditar}
        onEliminar={manejarEliminarGarantia}
        paginacion={paginacion}
        onCambiarPagina={cambiarPagina}
      />

      {/* Modal */}
      <ModalGarantia
        open={mostrarModal}
        onOpenChange={setMostrarModal}
        garantia={garantiaEditando}
        onGuardar={manejarGuardarGarantia}
      />
    </div>
  );
}