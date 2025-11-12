// app/mantenimientos/components/ListaMantenimientos.tsx
"use client"

import React from 'react';
import { Mantenimiento } from '@/interface/mantenimiento';
import { servicioMantenimiento } from '@/api/mantenimiento.service';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Settings, Clock, CheckCircle, XCircle } from 'lucide-react';
import { DetalleVenta } from '@/interface/venta';
import { Usuario } from '@/interface/auth';

interface ListaMantenimientosProps {
  mantenimientos: Mantenimiento[];
  cargando: boolean;
  onEditar: (mantenimiento: Mantenimiento) => void;
  onEliminar: (id: number) => void;
  onCambiarEstado: (id: number, nuevoEstado: string) => void;
  paginacion: {
    total: number;
    paginaActual: number;
    totalPaginas: number;
    limite: number;
  };
  onCambiarPagina: (pagina: number) => void;
}

export default function ListaMantenimientos({
  mantenimientos,
  cargando,
  onEditar,
  onEliminar,
  onCambiarEstado,
  paginacion,
  onCambiarPagina
}: ListaMantenimientosProps) {
  const obtenerIconoEstado = (estado: string) => {
    switch (estado) {
      case 'Pendiente':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'En proceso':
        return <Settings className="h-4 w-4 text-blue-600" />;
      case 'Completado':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Cancelado':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Settings className="h-4 w-4 text-gray-600" />;
    }
  };

  const obtenerOpcionesEstado = (estadoActual: string) => {
    const opciones: { valor: string; label: string; icono: React.ReactNode }[] = [];
    
    if (estadoActual === 'Pendiente') {
      opciones.push(
        { valor: 'En proceso', label: 'Marcar como En Proceso', icono: <Settings className="h-4 w-4" /> },
        { valor: 'Cancelado', label: 'Cancelar', icono: <XCircle className="h-4 w-4" /> }
      );
    } else if (estadoActual === 'En proceso') {
      opciones.push(
        { valor: 'Completado', label: 'Marcar como Completado', icono: <CheckCircle className="h-4 w-4" /> },
        { valor: 'Cancelado', label: 'Cancelar', icono: <XCircle className="h-4 w-4" /> }
      );
    } else if (estadoActual === 'Completado' || estadoActual === 'Cancelado') {
      opciones.push(
        { valor: 'Pendiente', label: 'Reabrir como Pendiente', icono: <Clock className="h-4 w-4" /> }
      );
    }
    
    return opciones;
  };

  // Función para obtener información del producto
  const obtenerInfoProducto = (detalleVenta: DetalleVenta) => {
    if (typeof detalleVenta === 'object' && detalleVenta !== null) {
      // Si detalle_venta es un objeto con propiedad producto
      if (detalleVenta.producto && typeof detalleVenta.producto === 'object') {
        return detalleVenta.producto.descripcion || `Producto ${detalleVenta.producto.id}`;
      }
      // Si detalle_venta es el producto directamente
      if (detalleVenta.producto) {
        return detalleVenta.producto;
      }
      return `Detalle Venta ${detalleVenta.id}`;
    }
    // Si detalle_venta es solo un número (ID)
    return `Detalle Venta ${detalleVenta}`;
  };

  // Función para obtener información del usuario
  const obtenerInfoUsuario = (usuario: Usuario): string => {
    if (typeof usuario === 'object' && usuario !== null) {
      return usuario.first_name+' '+ usuario.last_name || usuario.email || `Usuario ${usuario.id}`;
    }
    return `Usuario ${usuario}`;
  };

  if (mantenimientos.length === 0 && !cargando) {
    return (
      <div className="text-center py-12">
        <Settings className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          No hay mantenimientos
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Comienza creando un nuevo mantenimiento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Lista */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {mantenimientos.map((mantenimiento) => (
            <div key={mantenimiento.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Mantenimiento #{mantenimiento.id}
                    </h3>
                    <Badge 
                      variant="secondary" 
                      className={`flex items-center space-x-1 ${servicioMantenimiento.obtenerClaseEstado(mantenimiento.estado)}`}
                    >
                      {obtenerIconoEstado(mantenimiento.estado)}
                      <span>{mantenimiento.estado}</span>
                    </Badge>
                    {servicioMantenimiento.estaAtrasado(mantenimiento) && (
                      <Badge variant="destructive">
                        Atrasado
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {mantenimiento.descripcion}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <div>
                      <strong>Producto:</strong> {obtenerInfoProducto(mantenimiento.detalle_venta)}
                    </div>
                    <div>
                      <strong>Usuario:</strong> {obtenerInfoUsuario(mantenimiento.usuario)}
                    </div>
                    <div>
                      <strong>Costo:</strong> {servicioMantenimiento.formatearMoneda(mantenimiento.costo)}
                    </div>
                    <div>
                      <strong>Solicitud:</strong> {servicioMantenimiento.formatearFecha(mantenimiento.fecha_solicitud)}
                    </div>
                    {mantenimiento.fecha_atencion && (
                      <div>
                        <strong>Atención:</strong> {servicioMantenimiento.formatearFecha(mantenimiento.fecha_atencion)}
                      </div>
                    )}
                    {mantenimiento.fecha_finalizacion && (
                      <div>
                        <strong>Finalización:</strong> {servicioMantenimiento.formatearFecha(mantenimiento.fecha_finalizacion)}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  {/* Botones de acción */}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditar(mantenimiento)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEliminar(mantenimiento.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Botones de cambio de estado */}
                  <div className="flex flex-wrap gap-1">
                    {obtenerOpcionesEstado(mantenimiento.estado).map((opcion) => (
                      <Button
                        key={opcion.valor}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => onCambiarEstado(mantenimiento.id, opcion.valor)}
                      >
                        {opcion.icono}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Paginación */}
      {paginacion.totalPaginas > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Mostrando {mantenimientos.length} de {paginacion.total} mantenimientos
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={paginacion.paginaActual === 1}
              onClick={() => onCambiarPagina(paginacion.paginaActual - 1)}
            >
              Anterior
            </Button>
            <span className="flex items-center px-3 text-sm text-gray-500 dark:text-gray-400">
              Página {paginacion.paginaActual} de {paginacion.totalPaginas}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={paginacion.paginaActual === paginacion.totalPaginas}
              onClick={() => onCambiarPagina(paginacion.paginaActual + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}